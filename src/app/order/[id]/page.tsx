"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { formatPrice } from "@/lib/menu";
import type { Order } from "@/lib/orders-store";
import { CheckCircle2, Clock, ChefHat, PackageCheck, Bike, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { key: "pending",   label: "Order Received",  icon: Clock,        desc: "We got your order!" },
  { key: "confirmed", label: "Confirmed",        icon: CheckCircle2, desc: "Order confirmed by the team." },
  { key: "preparing", label: "Preparing",        icon: ChefHat,      desc: "Your items are being freshly made." },
  { key: "ready",     label: "Ready",            icon: PackageCheck, desc: "Your order is ready!" },
  { key: "completed", label: "Completed",        icon: Bike,         desc: "Enjoy! Thanks for choosing Spot-On." },
];

function stepIndex(status: string) {
  return STEPS.findIndex((s) => s.key === status);
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      setOrder(await res.json());
    } catch {
      setError("We couldn't find that order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const currentStep = order ? stepIndex(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <main className="bg-[#081C15] min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading order...
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">😕</span>
            <p className="text-gray-400 text-lg">{error}</p>
            <Link href="/menu" className="mt-6 inline-block px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">
              Back to Menu
            </Link>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <span className="text-5xl mb-4 block">{isCancelled ? "😞" : "🎉"}</span>
              <h1 className="text-3xl font-extrabold text-white mb-2">
                {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
              </h1>
              <p className="text-gray-400">Order <span className="text-white font-mono font-bold">{order.orderNumber}</span></p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            {/* Status tracker */}
            {!isCancelled && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-6">Order Status</h2>
                <div className="space-y-0">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = idx < currentStep;
                    const isActive = idx === currentStep;
                    const isFuture = idx > currentStep;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isDone ? "bg-green-600 border-green-600" :
                            isActive ? "bg-orange-500 border-orange-500 ring-4 ring-orange-500/20" :
                            "bg-transparent border-white/20"
                          }`}>
                            <Icon className={`w-5 h-5 ${isDone || isActive ? "text-white" : "text-gray-600"}`} />
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 my-1 ${isDone ? "bg-green-600" : "bg-white/10"}`} />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className={`font-semibold ${isActive ? "text-orange-400" : isDone ? "text-green-400" : "text-gray-500"}`}>
                            {step.label}
                            {isActive && <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Current</span>}
                          </p>
                          {(isDone || isActive) && !isFuture && (
                            <p className="text-gray-400 text-sm mt-0.5">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-gray-500 text-xs mt-2">⟳ Auto-refreshes every 10 seconds</p>
              </div>
            )}

            {/* Cancelled banner */}
            {isCancelled && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold">This order was cancelled.</p>
                  <p className="text-gray-400 text-sm">Please place a new order or contact us.</p>
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Order Details</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="text-white font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="text-white font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-400">Method</p>
                  <p className="text-white font-medium capitalize">{order.deliveryType}</p>
                </div>
                {order.deliveryAddress && (
                  <div>
                    <p className="text-gray-400">Address</p>
                    <p className="text-white font-medium">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.emoji} {item.name} × {item.quantity}</span>
                    <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-green-400">{formatPrice(order.subtotal)}</span>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">Special Instructions</p>
                  <p className="text-white text-sm">{order.specialInstructions}</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-green-700 text-white font-semibold hover:bg-green-600 transition-colors">
                Order More 🍊
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
