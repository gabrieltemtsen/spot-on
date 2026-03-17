// @ts-nocheck
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatPrice } from "@/lib/menu";
import {
  Loader2, RefreshCw, LogOut, CheckCircle2, Clock, ChefHat,
  PackageCheck, Bike, XCircle, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Package, ShoppingBag,
} from "lucide-react";

const ADMIN_PASSWORD = "spoton2024";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
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

const GRADIENTS = [
  "from-orange-400 to-yellow-300", "from-yellow-400 to-amber-300", "from-red-400 to-pink-300",
  "from-orange-500 to-yellow-400", "from-red-600 to-pink-500", "from-amber-700 to-amber-500",
  "from-yellow-500 to-lime-400", "from-purple-500 to-orange-400", "from-green-500 to-lime-400",
  "from-orange-400 to-amber-300", "from-teal-400 to-green-300", "from-orange-400 to-pink-400",
  "from-pink-400 to-rose-300", "from-green-500 to-emerald-400", "from-purple-600 to-pink-400",
  "from-amber-400 to-yellow-300", "from-emerald-500 to-green-400", "from-amber-500 to-orange-400",
];

const EMPTY_PRODUCT = { name: "", category: "juice" as const, description: "", ingredients: "", price: "", emoji: "🍊", gradient: "from-orange-400 to-yellow-300", badge: "", available: true };
type ProductCategory = "juice" | "smoothie" | "salad" | "sandwich";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");

  // Orders
  const orders = useQuery(api.orders.list);
  const stats = useQuery(api.orders.getStats);
  const updateStatus = useMutation(api.orders.updateStatus);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Products
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const toggleAvailable = useMutation(api.products.toggleAvailable);
  const seedProducts = useMutation(api.products.seed);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productLoading, setProductLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("spoton-admin");
    if (saved === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { localStorage.setItem("spoton-admin", ADMIN_PASSWORD); setAuthed(true); }
    else setAuthError("Wrong password. Try again.");
  }

  async function handleOrderStatus(orderId: string, status: OrderStatus) {
    setUpdatingOrder(orderId);
    try { await updateStatus({ id: orderId as Id<"orders">, status }); } finally { setUpdatingOrder(null); }
  }

  function openNewProduct() {
    setEditingProductId(null);
    setProductForm(EMPTY_PRODUCT);
    setShowProductForm(true);
  }

  function openEditProduct(p: { _id: string; name: string; category: ProductCategory; description: string; ingredients: string[]; price: number; emoji: string; gradient: string; badge?: string; available: boolean }) {
    setEditingProductId(p._id);
    setProductForm({ name: p.name, category: p.category as "juice", description: p.description, ingredients: p.ingredients.join(", "), price: String(p.price), emoji: p.emoji, gradient: p.gradient, badge: p.badge ?? "", available: p.available });
    setShowProductForm(true);
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProductLoading(true);
    try {
      const data = {
        name: productForm.name,
        category: productForm.category as ProductCategory,
        description: productForm.description,
        ingredients: productForm.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(productForm.price),
        available: productForm.available,
        emoji: productForm.emoji,
        gradient: productForm.gradient,
        badge: productForm.badge || undefined,
      };
      if (editingProductId) {
        await updateProduct({ id: editingProductId as Id<"products">, ...data });
      } else {
        await createProduct(data);
      }
      setShowProductForm(false);
      setProductForm(EMPTY_PRODUCT);
    } finally {
      setProductLoading(false);
    }
  }

  async function handleSeed() {
    setSeedLoading(true);
    try {
      const result = await seedProducts({});
      setSeedMsg(result.seeded ? `✅ Seeded ${result.count} products!` : "ℹ️ Already seeded.");
      setTimeout(() => setSeedMsg(""), 3000);
    } finally {
      setSeedLoading(false);
    }
  }

  if (!authed) {
    return (
      <main className="bg-[#081C15] min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="text-center"><span className="text-5xl block mb-3">🔐</span><h1 className="text-2xl font-extrabold text-white">Admin Access</h1><p className="text-gray-400 text-sm mt-1">Spot-On Order Management</p></div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
          </div>
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold transition-colors">Enter Dashboard</button>
        </form>
      </main>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedOrderData = orders?.find((o: any) => o._id === selectedOrder);

  return (
    <main className="bg-[#081C15] min-h-screen">
      {/* Topbar */}
      <header className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-2xl">🍊</span><div><h1 className="text-white font-bold text-lg leading-none">Spot-On</h1><p className="text-gray-400 text-xs">Admin Dashboard</p></div></div>
        <button onClick={() => { localStorage.removeItem("spoton-admin"); setAuthed(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-red-900/40 text-gray-300 text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        {stats && (
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
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "orders", label: "Orders", icon: ShoppingBag },
            { key: "products", label: "Products", icon: Package },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as "orders" | "products")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === key ? "bg-green-700 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">All Orders</h2>
                {orders === undefined && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              </div>
              {orders?.length === 0 && <div className="text-center py-16 text-gray-500"><span className="text-4xl block mb-3">📭</span>No orders yet.</div>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {orders?.map((order: any) => {
                const S = STATUS_CONFIG[order.status as OrderStatus];
                const Icon = S.icon;
                const nextStatus = NEXT_STATUS[order.status as OrderStatus];
                return (
                  <div key={order._id} onClick={() => setSelectedOrder(order._id === selectedOrder ? null : order._id)}
                    className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/8 ${selectedOrder === order._id ? "border-green-500/50" : "border-white/10 hover:border-white/20"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold font-mono text-sm">{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${S.color}`}><Icon className="w-3 h-3" /> {S.label}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{order.customerName} · {order.customerPhone}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{order.items.length} items · {formatPrice(order.subtotal)} · {order.deliveryType}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>
                        {nextStatus && (
                          <button onClick={(e) => { e.stopPropagation(); handleOrderStatus(order._id, nextStatus); }} disabled={updatingOrder === order._id}
                            className="px-3 py-1.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-60">
                            {updatingOrder === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : `→ ${STATUS_CONFIG[nextStatus].label}`}
                          </button>
                        )}
                        {order.status === "pending" && (
                          <button onClick={(e) => { e.stopPropagation(); handleOrderStatus(order._id, "cancelled"); }}
                            className="px-3 py-1.5 rounded-full bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs font-semibold transition-colors">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h2 className="text-white font-bold text-lg mb-3">Order Detail</h2>
              {!selectedOrderData ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-500"><span className="text-3xl block mb-2">👆</span>Click an order to view</div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 sticky top-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold font-mono">{selectedOrderData.orderNumber}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${STATUS_CONFIG[selectedOrderData.status as OrderStatus].color}`}>{STATUS_CONFIG[selectedOrderData.status as OrderStatus].label}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-400">Customer:</span> <span className="text-white">{selectedOrderData.customerName}</span></p>
                    <p><span className="text-gray-400">Phone:</span> <span className="text-white">{selectedOrderData.customerPhone}</span></p>
                    <p><span className="text-gray-400">Method:</span> <span className="text-white capitalize">{selectedOrderData.deliveryType}</span></p>
                    {selectedOrderData.deliveryAddress && <p><span className="text-gray-400">Address:</span> <span className="text-white">{selectedOrderData.deliveryAddress}</span></p>}
                    {selectedOrderData.specialInstructions && <p><span className="text-gray-400">Note:</span> <span className="text-white">{selectedOrderData.specialInstructions}</span></p>}
                  </div>
                  <div className="border-t border-white/10 pt-3 space-y-1.5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {selectedOrderData.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{item.emoji} {item.name} ×{item.quantity}</span><span className="text-white">{formatPrice(item.price * item.quantity)}</span></div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t border-white/10"><span className="text-white">Total</span><span className="text-green-400">{formatPrice(selectedOrderData.subtotal)}</span></div>
                  </div>
                  <div className="space-y-2 pt-2">
                    {Object.entries(NEXT_STATUS).map(([from, to]) =>
                      selectedOrderData.status === from ? (
                        <button key={to} onClick={() => handleOrderStatus(selectedOrderData._id, to as OrderStatus)} disabled={updatingOrder === selectedOrderData._id}
                          className="w-full py-2.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                          {updatingOrder === selectedOrderData._id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Mark as {STATUS_CONFIG[to as OrderStatus].label}
                        </button>
                      ) : null
                    )}
                    {selectedOrderData.status === "pending" && (
                      <button onClick={() => handleOrderStatus(selectedOrderData._id, "cancelled")} className="w-full py-2.5 rounded-full bg-red-900/30 hover:bg-red-800/50 text-red-400 text-sm font-semibold transition-colors">Cancel Order</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-white font-bold text-lg">Menu Products ({products?.length ?? 0})</h2>
              <div className="flex items-center gap-3">
                {seedMsg && <span className="text-sm text-green-400">{seedMsg}</span>}
                <button onClick={handleSeed} disabled={seedLoading} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-semibold transition-colors disabled:opacity-60">
                  {seedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Seed Defaults
                </button>
                <button onClick={openNewProduct} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {products === undefined ? (
              <div className="flex items-center gap-2 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin" /> Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <span className="text-4xl block mb-3">🌿</span>
                <p>No products yet.</p>
                <button onClick={handleSeed} className="mt-4 px-6 py-2 rounded-full bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition-colors">Seed Default Menu</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product._id} className={`bg-white/5 border rounded-xl overflow-hidden ${!product.available ? "opacity-50" : "border-white/10"}`}>
                    <div className={`h-24 bg-gradient-to-br ${product.gradient} flex items-center justify-center text-4xl`}>{product.emoji}</div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-semibold text-sm">{product.name}</p>
                          <p className="text-gray-400 text-xs capitalize">{product.category} · {formatPrice(product.price)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${product.available ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                          {product.available ? "Live" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAvailable({ id: product._id as Id<"products">, available: !product.available })}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs transition-colors">
                          {product.available ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                          {product.available ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => openEditProduct(product)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-blue-900/40 text-blue-400 text-xs transition-colors">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => removeProduct({ id: product._id as Id<"products"> })} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-red-900/40 text-red-400 text-xs transition-colors">
                          <Trash2 className="w-3 h-3" /> Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowProductForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleProductSubmit} className="bg-[#0d1f17] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <h2 className="text-white font-bold text-xl">{editingProductId ? "Edit Product" : "Add New Product"}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs mb-1 block">Name *</label>
                  <input required value={productForm.name} onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Tropical Twist" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Category *</label>
                  <select required value={productForm.category} onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className="w-full px-3 py-2.5 rounded-xl bg-[#0a1a10] border border-white/20 text-white text-sm focus:outline-none focus:border-green-500">
                    <option value="juice">🍊 Juice</option>
                    <option value="smoothie">🥤 Smoothie</option>
                    <option value="salad">🥗 Salad</option>
                    <option value="sandwich">🥪 Sandwich</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Price (₦) *</label>
                  <input required type="number" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 2000" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Emoji *</label>
                  <input required value={productForm.emoji} onChange={(e) => setProductForm((f) => ({ ...f, emoji: e.target.value }))} placeholder="🍊" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Badge (optional)</label>
                  <input value={productForm.badge} onChange={(e) => setProductForm((f) => ({ ...f, badge: e.target.value }))} placeholder="e.g. Popular" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Description *</label>
                <textarea required value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description of the item..." rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none" />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Ingredients (comma-separated) *</label>
                <input required value={productForm.ingredients} onChange={(e) => setProductForm((f) => ({ ...f, ingredients: e.target.value }))} placeholder="Orange, Ginger, Lemon" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-2 block">Card Gradient</label>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENTS.map((g) => (
                    <button type="button" key={g} onClick={() => setProductForm((f) => ({ ...f, gradient: g }))}
                      className={`h-8 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${productForm.gradient === g ? "border-white scale-110" : "border-transparent"}`} />
                  ))}
                </div>
                <div className={`mt-2 h-12 rounded-xl bg-gradient-to-br ${productForm.gradient} flex items-center justify-center text-2xl`}>{productForm.emoji}</div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-400 text-sm">Available on menu</label>
                <button type="button" onClick={() => setProductForm((f) => ({ ...f, available: !f.available }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${productForm.available ? "bg-green-600" : "bg-gray-600"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${productForm.available ? "left-6" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 py-3 rounded-full border border-white/20 text-gray-300 font-semibold hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={productLoading} className="flex-1 py-3 rounded-full bg-green-700 hover:bg-green-600 text-white font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {productLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingProductId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </main>
  );
}
