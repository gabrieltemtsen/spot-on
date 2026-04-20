// @ts-nocheck
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/menu";
import { CheckCircle2, Clock, ChefHat, PackageCheck, Bike, XCircle, Loader2, RotateCcw, Banknote, AlertCircle, Phone, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STEPS = [
  { key: "pending",   label: "Order Received",  icon: Clock,        desc: "We got your order!" },
  { key: "confirmed", label: "Confirmed",        icon: CheckCircle2, desc: "Order confirmed by the team." },
  { key: "preparing", label: "Preparing",        icon: ChefHat,      desc: "Your items are being freshly made." },
  { key: "ready",     label: "Ready",            icon: PackageCheck, desc: "Your order is ready!" },
  { key: "completed", label: "Completed",        icon: Bike,         desc: "Enjoy! Thanks for choosing Spot-On 🍊" },
];

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const order = useQuery(api.orders.get, { id: id as Id<"orders"> });
  const allProducts = useQuery(api.products.list, {});
  const settings = useQuery(api.settings.getAll, {});
  const submitFeedback = useMutation(api.orders.submitFeedback);
  const { clearCart, addItem, openCart } = useCart();
  
  const [ratingVal, setRatingVal] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  function handleOrderAgain() {
    if (!order) return;
    clearCart();
    // Re-add each item — resolve from products list for full data, fall back to order item data
    order.items.forEach((orderItem: any) => {
      const product = allProducts?.find((p: any) => p._id === orderItem.productId);
      addItem({
        id: orderItem.productId,
        name: orderItem.name,
        category: product?.category ?? "juice",
        description: product?.description ?? "",
        ingredients: product?.ingredients ?? [],
        price: product?.price ?? orderItem.price, // use current price
        emoji: orderItem.emoji,
        gradient: product?.gradient ?? "from-orange-400 to-yellow-300",
        badge: product?.badge,
        imageUrl: product?.imageUrl ?? null,
      });
    });
    router.push("/checkout");
  }

  async function handleFeedback() {
    if (!order || ratingVal === 0) return;
    setFeedbackSubmitting(true);
    try {
      await submitFeedback({ id: order._id, rating: ratingVal, feedback: feedbackText || undefined });
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  return (
    <main className="bg-[#081C15] min-h-screen">
      <Navbar />
      <CartDrawer />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {order === undefined && (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading order...
          </div>
        )}
        {order === null && (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">😕</span>
            <p className="text-gray-400 text-lg">Order not found.</p>
            <Link href="/menu" className="mt-6 inline-block px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">Back to Menu</Link>
          </div>
        )}
        {order && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl mb-4 block">{isCancelled ? "😞" : "🎉"}</span>
              <h1 className="text-3xl font-extrabold text-white mb-2">{isCancelled ? "Order Cancelled" : "Order Confirmed!"}</h1>
              <p className="text-gray-400">Order <span className="text-white font-mono font-bold">{order.orderNumber}</span></p>
              <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>

            {!isCancelled && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-4">Order Status</h2>
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 mb-6 flex items-start gap-3">
                  <span className="text-xl leading-none pt-0.5">👀</span>
                  <div>
                    <p className="text-green-300 font-semibold text-sm">Keep this page open!</p>
                    <p className="text-green-400/80 text-xs mt-0.5">Your order status updates here automatically in real-time. Stay on this screen to track your progress.</p>
                  </div>
                </div>
                <div className="space-y-0">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = idx < currentStep;
                    const isActive = idx === currentStep;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? "bg-green-600 border-green-600" : isActive ? "bg-orange-500 border-orange-500 ring-4 ring-orange-500/20" : "bg-transparent border-white/20"}`}>
                            <Icon className={`w-5 h-5 ${isDone || isActive ? "text-white" : "text-gray-600"}`} />
                          </div>
                          {idx < STEPS.length - 1 && <div className={`w-0.5 h-8 my-1 ${isDone ? "bg-green-600" : "bg-white/10"}`} />}
                        </div>
                        <div className="pb-6">
                          <p className={`font-semibold ${isActive ? "text-orange-400" : isDone ? "text-green-400" : "text-gray-500"}`}>
                            {step.label}
                            {isActive && <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Current</span>}
                          </p>
                          {(isDone || isActive) && <p className="text-gray-400 text-sm mt-0.5">{step.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {order.estimatedPrepTime && !["ready", "completed", "dispatched"].includes(order.status) && (
                  <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-orange-300 text-xs font-bold uppercase tracking-wide">Estimated Prep Time</p>
                      <p className="text-white font-medium text-sm">{order.estimatedPrepTime}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                <div><p className="text-white font-semibold">This order was cancelled.</p><p className="text-gray-400 text-sm">Please place a new order or contact us.</p></div>
              </div>
            )}

            {/* ── Payment Status ─────────────────── */}
            {order.paymentMethod === "transfer" && (
              <div className={`rounded-2xl p-5 border flex gap-4 items-start ${
                order.paymentStatus === "confirmed"
                  ? "bg-green-900/20 border-green-500/30"
                  : order.paymentStatus === "rejected"
                  ? "bg-red-900/20 border-red-500/30"
                  : "bg-amber-900/20 border-amber-500/30"
              }`}>
                {order.paymentStatus === "confirmed" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                ) : order.paymentStatus === "rejected" ? (
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    order.paymentStatus === "confirmed" ? "text-green-300"
                    : order.paymentStatus === "rejected" ? "text-red-300"
                    : "text-amber-300"
                  }`}>
                    {order.paymentStatus === "confirmed"
                      ? "Payment Confirmed ✅"
                      : order.paymentStatus === "rejected"
                      ? "Payment Not Verified ❌"
                      : "Awaiting Payment Confirmation ⏳"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {order.paymentStatus === "confirmed"
                      ? `Verified by ${order.paymentConfirmedBy ?? "admin"}. Your order is being prepared.`
                      : order.paymentStatus === "rejected"
                      ? "We couldn't verify your transfer. Please contact us for help."
                      : `We received your transfer from ${order.paymentBank ?? "your bank"}. We'll confirm shortly and start preparing your order.`}
                  </p>
                  {order.paymentStatus !== "confirmed" && order.paymentStatus !== "rejected" && (
                    <div className="mt-3 bg-black/20 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                      {settings?.bankAccountNumber && <p>Account: <span className="text-white font-mono">{settings.bankAccountNumber}</span> · {settings.bankName}</p>}
                      <p>Amount: <span className="text-white font-bold">{formatPrice((order.subtotal ?? 0) + (order.deliveryFee ?? 0))}</span></p>
                      <p className="text-gray-500">This page updates automatically. Check back in a moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Order Details</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400">Name</p><p className="text-white font-medium">{order.customerName}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="text-white font-medium">{order.customerPhone}</p></div>
                <div><p className="text-gray-400">Method</p><p className="text-white font-medium capitalize">{order.deliveryType}</p></div>
                {order.deliveryAddress && <div><p className="text-gray-400">Address</p><p className="text-white font-medium">{order.deliveryAddress}</p></div>}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.emoji} {item.name} × {item.quantity}</span>
                    <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span><span className="text-green-400">{formatPrice(order.subtotal)}</span>
                </div>
              </div>
              {order.specialInstructions && (
                <div className="bg-white/5 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Special Instructions</p><p className="text-white text-sm">{order.specialInstructions}</p></div>
              )}
            </div>

            {/* ── Support Info ─────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-2">
              <Phone className="w-8 h-8 text-green-400 mb-1" />
              <h2 className="text-white font-bold">Need help with your order?</h2>
              <p className="text-gray-400 text-sm">Call our support line for updates or questions.</p>
              <a href={`tel:${settings?.businessPhone || ""}`} className="px-6 py-2 rounded-full bg-white/10 text-white font-semibold mt-2 hover:bg-white/20 transition-colors">
                {settings?.businessPhone || "Support Line"}
              </a>
            </div>

            {/* ── Ratings & Feedback ─────────────────── */}
            {order.status === "completed" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                {order.rating ? (
                  <div className="text-center space-y-2">
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-6 h-6 ${s <= order.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                      ))}
                    </div>
                    <p className="text-green-400 font-semibold text-sm">Thank you for your rating! 🎉</p>
                    {order.feedback && <p className="text-gray-400 text-sm italic mt-1">"{order.feedback}"</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-white font-bold text-center">How did we do?</h2>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingVal(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${star <= (hoverRating || ratingVal) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                        </button>
                      ))}
                    </div>
                    {ratingVal > 0 && (
                      <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Tell us what you liked (optional)..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                        />
                        <button
                          onClick={handleFeedback}
                          disabled={feedbackSubmitting}
                          className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-yellow-950 font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          {feedbackSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Order Again — only if products loaded and not cancelled */}
              {!isCancelled && allProducts && (
                <button
                  onClick={handleOrderAgain}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all active:scale-95">
                  <RotateCcw className="w-4 h-4" /> Order Again
                </button>
              )}
              <Link
                href="/menu"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-green-700 hover:bg-green-600 text-white font-semibold transition-colors">
                Browse Menu 🍊
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
