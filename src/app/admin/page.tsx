"use client";
import { useEffect, useState, useCallback } from "react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { formatPrice } from "@/lib/menu";
import { Loader2, RefreshCw, LogOut, CheckCircle2, Clock, ChefHat, PackageCheck, Bike, XCircle } from "lucide-react";

const ADMIN_PASSWORD = "spoton2024";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",   icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",         icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-orange-500/20 text-orange-400 border-orange-500/30",   icon: ChefHat },
  ready:     { label: "Ready",     color: "bg-green-500/20 text-green-400 border-green-500/30",       icon: PackageCheck },
  completed: { label: "Completed", color: "bg-gray-500/20 text-gray-400 border-gray-500/30",         icon: Bike },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30",            icon: XCircle },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed", confirmed: "preparing", preparing: "ready", ready: "completed",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("spoton-admin");
    if (saved === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) {
      fetchOrders();
      const t = setInterval(fetchOrders, 15000);
      return () => clearInterval(t);
    }
  }, [authed, fetchOrders]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("spoton-admin", ADMIN_PASSWORD);
      setAuthed(true);
    } else {
      setAuthError("Wrong password. Try again.");
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminPassword: ADMIN_PASSWORD }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selected?.id === orderId) setSelected(updated);
      }
    } finally {
      setUpdating(null);
    }
  }

  // Stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const stats = {
    total: todayOrders.length,
    pending: todayOrders.filter((o) => o.status === "pending").length,
    active: todayOrders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status)).length,
    completed: todayOrders.filter((o) => o.status === "completed").length,
    revenue: todayOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.subtotal, 0),
  };

  if (!authed) {
    return (
      <main className="bg-[#081C15] min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <span className="text-5xl block mb-3">🔐</span>
            <h1 className="text-2xl font-extrabold text-white">Admin Access</h1>
            <p className="text-gray-400 text-sm mt-1">Spot-On Order Management</p>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold transition-colors">
            Enter Dashboard
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="bg-[#081C15] min-h-screen">
      {/* Topbar */}
      <header className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍊</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Spot-On</h1>
            <p className="text-gray-400 text-xs">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { localStorage.removeItem("spoton-admin"); setAuthed(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-red-900/40 text-gray-300 text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Today's Orders", val: stats.total, color: "text-white" },
            { label: "Pending", val: stats.pending, color: "text-yellow-400" },
            { label: "In Progress", val: stats.active, color: "text-orange-400" },
            { label: "Completed", val: stats.completed, color: "text-green-400" },
            { label: "Today's Revenue", val: formatPrice(stats.revenue), color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-white font-bold text-lg">All Orders</h2>
            {loading && orders.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <span className="text-4xl block mb-3">📭</span>
                No orders yet. Share the menu link!
              </div>
            ) : (
              orders.map((order) => {
                const S = STATUS_CONFIG[order.status];
                const Icon = S.icon;
                const nextStatus = NEXT_STATUS[order.status];
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/8 ${selected?.id === order.id ? "border-green-500/50" : "border-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold font-mono text-sm">{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${S.color}`}>
                            <Icon className="w-3 h-3" /> {S.label}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{order.customerName} · {order.customerPhone}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatPrice(order.subtotal)} · {order.deliveryType}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>
                        {nextStatus && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }}
                            disabled={updating === order.id}
                            className="px-3 py-1.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                          >
                            {updating === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : `→ ${STATUS_CONFIG[nextStatus].label}`}
                          </button>
                        )}
                        {order.status === "pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "cancelled"); }}
                            disabled={updating === order.id}
                            className="px-3 py-1.5 rounded-full bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order detail panel */}
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Order Detail</h2>
            {!selected ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-500">
                <span className="text-3xl block mb-2">👆</span>
                Click an order to view details
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 sticky top-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold font-mono">{selected.orderNumber}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${STATUS_CONFIG[selected.status].color}`}>
                    {STATUS_CONFIG[selected.status].label}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-400">Customer:</span> <span className="text-white">{selected.customerName}</span></p>
                  <p><span className="text-gray-400">Phone:</span> <span className="text-white">{selected.customerPhone}</span></p>
                  <p><span className="text-gray-400">Method:</span> <span className="text-white capitalize">{selected.deliveryType}</span></p>
                  {selected.deliveryAddress && <p><span className="text-gray-400">Address:</span> <span className="text-white">{selected.deliveryAddress}</span></p>}
                  {selected.specialInstructions && <p><span className="text-gray-400">Note:</span> <span className="text-white">{selected.specialInstructions}</span></p>}
                </div>
                <div className="border-t border-white/10 pt-3 space-y-1.5">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.emoji} {item.name} ×{item.quantity}</span>
                      <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-green-400">{formatPrice(selected.subtotal)}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  {Object.entries(NEXT_STATUS).map(([from, to]) =>
                    selected.status === from ? (
                      <button key={to} onClick={() => updateStatus(selected.id, to)} disabled={updating === selected.id}
                        className="w-full py-2.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {updating === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Mark as {STATUS_CONFIG[to].label}
                      </button>
                    ) : null
                  )}
                  {selected.status === "pending" && (
                    <button onClick={() => updateStatus(selected.id, "cancelled")} disabled={updating === selected.id}
                      className="w-full py-2.5 rounded-full bg-red-900/30 hover:bg-red-800/50 text-red-400 text-sm font-semibold transition-colors">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
