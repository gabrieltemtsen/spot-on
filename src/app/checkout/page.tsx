// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/menu";
import { Loader2, MapPin, Store, CheckCircle2, Copy, Check, Banknote, Upload, X, ImageIcon } from "lucide-react";

const JOS_LOCATIONS = [
  { name: "Rayfield", fee: 2000 },
  { name: "Bukuru", fee: 2500 },
  { name: "Terminus", fee: 2000 },
  { name: "Zarmaganda", fee: 2000 },
  { name: "Tudun Wada", fee: 2000 },
  { name: "Anglo Jos", fee: 2000 },
  { name: "Other Area (Standard)", fee: 2500 }
];

function saveOrderToLocalStorage(orderId: string, orderNumber: string, customerName: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("spoton_orders") ?? "[]");
    existing.unshift({ id: orderId, orderNumber, customerName, placedAt: Date.now() });
    // Keep last 20 orders
    localStorage.setItem("spoton_orders", JSON.stringify(existing.slice(0, 20)));
  } catch { /* silent */ }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const createOrder = useMutation(api.orders.create);
  const saveReceiptStorageId = useMutation(api.orders.saveReceiptStorageId);
  const generateUploadUrl = useMutation(api.orders.generateReceiptUploadUrl);
  const settings = useQuery(api.settings.getAll, {});

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryType: "pickup" as "pickup" | "delivery",
    deliveryZone: "",
    deliveryAddress: "",
    specialInstructions: "",
    paymentMethod: "transfer" as "pending" | "cash" | "transfer" | "card",
    paymentBank: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Receipt upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function update(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  const subtotal = total();
  const selectedZoneFee = JOS_LOCATIONS.find(l => l.name === form.deliveryZone)?.fee ?? 2500;
  const deliveryFee = form.deliveryType === "delivery" ? selectedZoneFee : 0;
  const orderTotal = subtotal + deliveryFee;

  const bankName = settings?.bankName || "";
  const bankAccountNumber = settings?.bankAccountNumber || "";
  const bankAccountName = settings?.bankAccountName || "";
  const hasBankDetails = bankName && bankAccountNumber && bankAccountName;

  function copyAccountNumber() {
    navigator.clipboard.writeText(bankAccountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReceiptSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  }

  function removeReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone) { setError("Please fill in your name and phone number."); return; }
    if (form.deliveryType === "delivery" && !form.deliveryAddress) { setError("Please enter your delivery address."); return; }
    if (items.length === 0) { setError("Your cart is empty."); return; }
    if (form.paymentMethod === "transfer" && !form.paymentBank) { setError("Please tell us which bank you sent from."); return; }
    if (form.paymentMethod === "transfer" && !receiptFile) { setError("Please upload your transfer receipt screenshot."); return; }
    setError(""); setLoading(true);

    try {
      // Create order first (status: pending, paymentStatus: awaiting_confirmation)
      const orderId = await createOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryType: form.deliveryType,
        deliveryAddress: form.deliveryAddress ? `${form.deliveryZone ? form.deliveryZone + " - " : ""}${form.deliveryAddress}` : undefined,
        specialInstructions: form.specialInstructions || undefined,
        items: items.map(({ item, quantity }) => ({ productId: item.id, name: item.name, price: item.price, quantity, emoji: item.emoji })),
        subtotal,
        deliveryFee: deliveryFee || undefined,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentMethod === "transfer" ? "awaiting_confirmation" : "unpaid",
        paymentBank: form.paymentBank || undefined,
        source: "web",
      });

      // Upload receipt screenshot to Convex storage
      if (form.paymentMethod === "transfer" && receiptFile) {
        setUploading(true);
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": receiptFile.type },
          body: receiptFile,
        });
        const { storageId } = await res.json();
        await saveReceiptStorageId({ id: orderId as Id<"orders">, storageId });
        setUploading(false);
      }

      const orderNumber = `SO-${Date.now().toString().slice(-6)}`;

      // Save to localStorage for "My Orders"
      saveOrderToLocalStorage(orderId, orderNumber, form.customerName);

      // Fire notification (non-blocking)
      fetch("/api/notify-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          items: items.map(({ item, quantity }) => ({ name: item.name, quantity, price: item.price, emoji: item.emoji })),
          subtotal,
          deliveryFee,
          total: orderTotal,
          deliveryType: form.deliveryType,
          deliveryAddress: form.deliveryAddress ? `${form.deliveryZone ? form.deliveryZone + " - " : ""}${form.deliveryAddress}` : undefined,
          specialInstructions: form.specialInstructions,
          paymentMethod: form.paymentMethod,
          paymentBank: form.paymentBank || undefined,
        }),
      }).catch(() => {});

      clearCart();
      router.push(`/order/${orderId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#081C15] min-h-screen">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <span className="text-5xl block mb-4">🛒</span>
            <p className="text-lg">Your cart is empty.</p>
            <button onClick={() => router.push("/menu")} className="mt-6 px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">Browse Menu</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* ── Details ─────────────────── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-lg">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                    <input type="text" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} placeholder="e.g. Ade Johnson" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Phone Number *</label>
                    <input type="tel" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} placeholder="e.g. 0812 345 6789" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* ── Delivery ─────────────────── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-lg">Delivery Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: "pickup", label: "Pickup", desc: "Come pick it up — free", icon: <Store className="w-5 h-5" /> },
                    { value: "delivery", label: "Delivery", desc: "We bring it to you (₦2,000 - ₦2,500)", icon: <MapPin className="w-5 h-5" /> },
                  ].map((opt) => (
                    <button type="button" key={opt.value} onClick={() => update("deliveryType", opt.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${form.deliveryType === opt.value ? "border-green-500 bg-green-900/30 text-white" : "border-white/20 bg-white/5 text-gray-400 hover:border-white/30"}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.deliveryType === opt.value ? "bg-green-700" : "bg-white/10"}`}>{opt.icon}</div>
                      <div><p className="font-semibold">{opt.label}</p><p className="text-xs opacity-70">{opt.desc}</p></div>
                      {form.deliveryType === opt.value && <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />}
                    </button>
                  ))}
                </div>
                {form.deliveryType === "delivery" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Delivery Area *</label>
                      <select value={form.deliveryZone} onChange={(e) => update("deliveryZone", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500 transition-colors">
                        <option value="" disabled className="text-black">Select an area in Jos...</option>
                        {JOS_LOCATIONS.map(loc => (
                          <option key={loc.name} value={loc.name} className="text-black">{loc.name} — {formatPrice(loc.fee)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Detailed Address *</label>
                      <textarea value={form.deliveryAddress} onChange={(e) => update("deliveryAddress", e.target.value)} placeholder="House number, street name, landmarks..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Payment Method ─────────────────── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-lg">Payment</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: "transfer", label: "🏦 Transfer" },
                    { val: "cash",     label: "💵 Cash" },
                    { val: "card",     label: "💳 Card/POS" },
                    { val: "pending",  label: "⏳ Pay Later" },
                  ].map(pm => (
                    <button type="button" key={pm.val} onClick={() => update("paymentMethod", pm.val)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-all border ${form.paymentMethod === pm.val ? "border-green-500 bg-green-900/30 text-white" : "border-white/20 bg-white/5 text-gray-400 hover:border-white/30"}`}>
                      {pm.label}
                    </button>
                  ))}
                </div>

                {/* Transfer details */}
                {form.paymentMethod === "transfer" && (
                  <div className="space-y-4 mt-2">
                    {hasBankDetails ? (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Banknote className="w-4 h-4 text-green-400" />
                          <p className="text-green-300 font-semibold text-sm">Transfer to this account</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="text-white font-medium">{bankName}</span></div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Account No.</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono font-bold text-base">{bankAccountNumber}</span>
                              <button type="button" onClick={copyAccountNumber} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between"><span className="text-gray-400">Account Name</span><span className="text-white font-medium">{bankAccountName}</span></div>
                          <div className="flex justify-between font-bold pt-1 border-t border-green-500/20">
                            <span className="text-green-300">Amount to Send</span>
                            <span className="text-green-400 text-base">{formatPrice(orderTotal)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">⚡ After transferring, fill in the fields below so we can confirm your payment.</p>
                      </div>
                    ) : (
                      <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-amber-300 text-sm">
                        ⚠️ Bank details not set up yet. Please contact us for transfer details.
                      </div>
                    )}

                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Which bank did you send from? *</label>
                      <input
                        type="text"
                        value={form.paymentBank}
                        onChange={(e) => update("paymentBank", e.target.value)}
                        placeholder="e.g. GTBank, Access, OPay, Palmpay..."
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>
                    {/* Receipt upload */}
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Upload Transfer Receipt *</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptSelect}
                        className="hidden"
                      />
                      {!receiptPreview ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 rounded-xl border-2 border-dashed border-white/20 hover:border-green-500/60 bg-white/5 hover:bg-white/8 transition-all flex flex-col items-center gap-2 text-gray-400 hover:text-gray-300"
                        >
                          <Upload className="w-6 h-6" />
                          <span className="text-sm font-medium">Tap to upload receipt screenshot</span>
                          <span className="text-xs text-gray-600">PNG, JPG, WEBP supported</span>
                        </button>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border border-green-500/40">
                          <img src={receiptPreview} alt="Receipt" className="w-full max-h-48 object-contain bg-black/40" />
                          <button
                            type="button"
                            onClick={removeReceipt}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs text-green-300 truncate">{receiptFile?.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {form.paymentMethod === "pending" && <p className="text-gray-500 text-xs">💡 Pay when you pick up / we deliver.</p>}
                {form.paymentMethod === "cash" && <p className="text-gray-500 text-xs">💡 Pay cash on pickup or delivery.</p>}
                {form.paymentMethod === "card" && <p className="text-gray-500 text-xs">💳 POS available at pickup.</p>}
              </div>

              {/* ── Instructions ─────────────────── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h2 className="text-white font-bold text-lg">Special Instructions <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
                <textarea value={form.specialInstructions} onChange={(e) => update("specialInstructions", e.target.value)} placeholder="Allergies, preferences, or any special requests..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none" />
              </div>

              {error && <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-400 text-sm">{error}</div>}
            </div>

            {/* ── Order Summary ─────────────────── */}
            <div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 space-y-4">
                <h2 className="text-white font-bold text-lg">Order Summary</h2>
                <div className="space-y-3">
                  {items.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{item.name}</p><p className="text-gray-400 text-xs">×{quantity}</p></div>
                      <span className="text-green-400 text-sm font-semibold shrink-0">{formatPrice(item.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="flex justify-between text-gray-300 text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {deliveryFee > 0 && <div className="flex justify-between text-gray-300 text-sm"><span>Delivery fee</span><span>{formatPrice(deliveryFee)}</span></div>}
                  <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span className="text-green-400">{formatPrice(orderTotal)}</span></div>
                </div>
                
                <button
                  type="button"
                  onClick={() => router.push("/menu")}
                  className="w-full py-3 rounded-xl border border-white/20 hover:border-white/40 text-white text-sm font-semibold transition-all"
                >
                  + Add More Items
                </button>

                <button type="submit" disabled={loading} className="w-full py-4 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading receipt...</>
                   : loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                   : form.paymentMethod === "transfer" ? "Place Order — I've Transferred 🏦"
                   : "Place Order 🚀"}
                </button>
                {form.paymentMethod === "transfer" && (
                  <p className="text-xs text-center text-gray-500">Your order will be confirmed once we verify your transfer.</p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
