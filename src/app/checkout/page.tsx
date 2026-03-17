"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/menu";
import { Loader2, MapPin, Store, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryType: "pickup" as "pickup" | "delivery",
    deliveryAddress: "",
    specialInstructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone) {
      setError("Please fill in your name and phone number.");
      return;
    }
    if (form.deliveryType === "delivery" && !form.deliveryAddress) {
      setError("Please enter your delivery address.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      ...form,
      items: items.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        emoji: item.emoji,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const order = await res.json();
      clearCart();
      router.push(`/order/${order.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const subtotal = total();

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
            <button onClick={() => router.push("/menu")} className="mt-6 px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">
              Browse Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-lg">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      placeholder="e.g. Ade Johnson"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => update("customerPhone", e.target.value)}
                      placeholder="e.g. 0812 345 6789"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery method */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-lg">Delivery Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: "pickup", label: "Pickup", desc: "Come pick it up fresh", icon: <Store className="w-5 h-5" /> },
                    { value: "delivery", label: "Delivery", desc: "We bring it to you", icon: <MapPin className="w-5 h-5" /> },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => update("deliveryType", opt.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        form.deliveryType === opt.value
                          ? "border-green-500 bg-green-900/30 text-white"
                          : "border-white/20 bg-white/5 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.deliveryType === opt.value ? "bg-green-700" : "bg-white/10"}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-xs opacity-70">{opt.desc}</p>
                      </div>
                      {form.deliveryType === opt.value && <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />}
                    </button>
                  ))}
                </div>

                {form.deliveryType === "delivery" && (
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Delivery Address *</label>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={(e) => update("deliveryAddress", e.target.value)}
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Special instructions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h2 className="text-white font-bold text-lg">Special Instructions <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
                <textarea
                  value={form.specialInstructions}
                  onChange={(e) => update("specialInstructions", e.target.value)}
                  placeholder="Allergies, preferences, or any special requests..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT: Summary */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs">x{quantity}</p>
                      </div>
                      <span className="text-green-400 text-sm font-semibold shrink-0">
                        {formatPrice(item.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-400">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">Payment collected on delivery/pickup</p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 py-4 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : "Place Order 🚀"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
