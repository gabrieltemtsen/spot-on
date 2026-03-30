// @ts-nocheck
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatPrice } from "@/lib/menu";
import {
  Loader2, LogOut, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Package, ShoppingBag, DollarSign, Users, BarChart3, Zap, Printer,
  CheckCircle2, Clock, ChefHat, PackageCheck, Bike, XCircle, Truck,
  Copy, Check, RefreshCw, X, TrendingUp, TrendingDown, Settings,
  ImagePlus, Search, Save, Tag, Building2, Receipt, UserCircle,
  Download, Phone, Star, StickyNote, RepeatIcon, ChevronDown, ChevronUp,
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────
type OrderStatus = "pending"|"confirmed"|"preparing"|"ready"|"dispatched"|"completed"|"cancelled";
type TabId = "pos"|"orders"|"products"|"expenses"|"team"|"reports"|"settings"|"customers";
type Role = "admin"|"cashier";

interface TeamMember { _id: string; name: string; pin: string; role: Role; active: boolean }

const STATUS_CFG: Record<OrderStatus,{label:string;color:string;icon:React.ElementType}> = {
  pending:   {label:"Pending",   color:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30",   icon:Clock},
  confirmed: {label:"Confirmed", color:"bg-blue-500/20 text-blue-400 border-blue-500/30",         icon:CheckCircle2},
  preparing: {label:"Preparing", color:"bg-orange-500/20 text-orange-400 border-orange-500/30",   icon:ChefHat},
  ready:     {label:"Ready",     color:"bg-green-500/20 text-green-400 border-green-500/30",       icon:PackageCheck},
  dispatched:{label:"Dispatched",color:"bg-purple-500/20 text-purple-400 border-purple-500/30",   icon:Truck},
  completed: {label:"Completed", color:"bg-gray-500/20 text-gray-400 border-gray-500/30",         icon:Bike},
  cancelled: {label:"Cancelled", color:"bg-red-500/20 text-red-400 border-red-500/30",            icon:XCircle},
};
const NEXT_STATUS: Partial<Record<OrderStatus,OrderStatus>> = {
  pending:"confirmed",confirmed:"preparing",preparing:"ready",ready:"dispatched",dispatched:"completed",
};
const DEFAULT_EXPENSE_CATS = ["ingredients","rent","transport","packaging","staff","utilities","marketing","misc"];
const GRADIENTS = [
  "from-orange-400 to-yellow-300","from-yellow-400 to-amber-300","from-red-400 to-pink-300",
  "from-orange-500 to-yellow-400","from-red-600 to-pink-500","from-amber-700 to-amber-500",
  "from-yellow-500 to-lime-400","from-purple-500 to-orange-400","from-green-500 to-lime-400",
  "from-orange-400 to-amber-300","from-teal-400 to-green-300","from-orange-400 to-pink-400",
  "from-pink-400 to-rose-300","from-green-500 to-emerald-400","from-purple-600 to-pink-400",
  "from-amber-400 to-yellow-300","from-emerald-500 to-green-400","from-amber-500 to-orange-400",
];

function today() { return new Date().toISOString().split("T")[0]; }

// ── Shared: Product thumbnail ──────────────────────────────────
function ProductThumb({ product, size = "md" }: { product: any; size?: "sm"|"md"|"lg" }) {
  const h = size === "sm" ? "h-14" : size === "lg" ? "h-28" : "h-20";
  if (product.imageUrl) {
    return (
      <div className={`${h} rounded-lg overflow-hidden`}>
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${h} rounded-lg bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
      <span className={size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-3xl"}>{product.emoji}</span>
    </div>
  );
}

// ── PIN Login ─────────────────────────────────────────────────
function PinLogin({ onLogin }: { onLogin:(m:TeamMember)=>void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const member = useQuery(api.team.verifyPin, { pin: pin.length === 4 ? pin : "----" });
  const seedOwner = useMutation(api.team.seedOwner);

  useEffect(() => {
    if (pin.length === 4) {
      if (member) { onLogin(member); setPin(""); setError(""); }
      else { setError("Invalid PIN"); setTimeout(()=>{ setPin(""); setError(""); }, 1200); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, pin]);

  return (
    <main className="bg-[#081C15] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div><span className="text-5xl block mb-2">🍊</span><h1 className="text-2xl font-extrabold text-white">Spot-On Staff</h1><p className="text-gray-400 text-sm mt-1">Enter your PIN</p></div>
        <div className="flex justify-center gap-3">
          {[0,1,2,3].map(i=>(
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${i<pin.length?"bg-green-400 border-green-400":"border-white/30"}`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
            <button key={i} onClick={()=>{
              if(k==="⌫") setPin(p=>p.slice(0,-1));
              else if(k!==""&&pin.length<4) setPin(p=>p+k);
            }}
            className={`h-14 rounded-xl font-bold text-xl transition-all active:scale-95 ${k===""?"invisible":"bg-white/10 hover:bg-white/20 text-white"}`}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={()=>seedOwner({})} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          First time? Seed owner (PIN: 1234)
        </button>
      </div>
    </main>
  );
}

// ── Receipt print helper ───────────────────────────────────────
function printReceipt(order: any, settings?: Record<string,string>) {
  const w = window.open("","_blank","width=300,height=600");
  if (!w) return;
  const bizName = settings?.businessName ?? "SPOT-ON";
  const tagline = settings?.businessTagline ?? "Fresh Juices & Salads";
  const footer  = settings?.receiptFooter  ?? "Thank you! Come again 🙏";
  const address = settings?.businessAddress ?? "";
  const phone   = settings?.businessPhone   ?? "";
  const items = order.items.map((i: any) => `<tr><td>${i.emoji} ${i.name} ×${i.quantity}</td><td style="text-align:right">₦${(i.price*i.quantity).toLocaleString()}</td></tr>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
    body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:8px}
    h2{text-align:center;font-size:16px;margin:4px 0}
    .center{text-align:center}.divider{border-top:1px dashed #000;margin:6px 0}
    table{width:100%}td{padding:2px 0}.total{font-weight:bold;font-size:14px}
  </style></head><body>
    <h2>🍊 ${bizName.toUpperCase()}</h2>
    <p class="center">${tagline}</p>
    ${address ? `<p class="center" style="font-size:10px">${address}</p>` : ""}
    ${phone   ? `<p class="center" style="font-size:10px">📞 ${phone}</p>` : ""}
    <div class="divider"></div>
    <p><b>Order:</b> ${order.orderNumber}</p>
    <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString("en-NG")}</p>
    <p><b>Customer:</b> ${order.customerName}</p>
    ${order.customerPhone !== "Walk-in" ? `<p><b>Phone:</b> ${order.customerPhone}</p>` : ""}
    <div class="divider"></div>
    <table>${items}</table>
    <div class="divider"></div>
    ${order.deliveryFee ? `<p style="text-align:right">Delivery: ₦${order.deliveryFee.toLocaleString()}</p>` : ""}
    <p class="total" style="text-align:right">TOTAL: ₦${(order.total??order.subtotal).toLocaleString()}</p>
    ${order.paymentMethod ? `<p style="text-align:right">Paid: ${order.paymentMethod.toUpperCase()}</p>` : ""}
    <div class="divider"></div>
    <p class="center">${footer}</p>
  </body></html>`);
  w.document.close();
  w.print();
}

// ── Main Admin ─────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<TeamMember|null>(null);
  const [tab, setTab] = useState<TabId>("pos");
  const siteSettings = useQuery(api.settings.getAll, {});
  // POS preload — set from Customers tab "Re-order" button
  const [posPreload, setPosPreload] = useState<{id:string;name:string;emoji:string;price:number;qty:number}[]|null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("spoton-user");
    if (saved) try { setUser(JSON.parse(saved)); } catch { /**/ }
  }, []);

  function handleLogin(m: TeamMember) {
    setUser(m);
    localStorage.setItem("spoton-user", JSON.stringify(m));
    setTab("pos");
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("spoton-user");
  }

  if (!user) return <PinLogin onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";
  const tabs: {id:TabId;label:string;icon:React.ElementType;adminOnly?:boolean}[] = [
    {id:"pos",       label:"Quick Sale", icon:Zap},
    {id:"orders",    label:"Orders",     icon:ShoppingBag},
    {id:"products",  label:"Products",   icon:Package,     adminOnly:true},
    {id:"expenses",  label:"Expenses",   icon:DollarSign,  adminOnly:true},
    {id:"customers", label:"Customers",  icon:UserCircle,  adminOnly:true},
    {id:"team",      label:"Team",       icon:Users,       adminOnly:true},
    {id:"reports",   label:"Reports",    icon:BarChart3,   adminOnly:true},
    {id:"settings",  label:"Settings",   icon:Settings,    adminOnly:true},
  ].filter(t => !t.adminOnly || isAdmin);

  const bizName = siteSettings?.businessName ?? "Spot-On";

  return (
    <main className="bg-[#081C15] min-h-screen">
      <header className="bg-black/40 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">🍊</span><span className="text-white font-bold">{bizName}</span></div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">{user.name} · {user.role}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-900/40 text-gray-300 text-sm transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Out
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 py-3 border-b border-white/10 bg-black/20">
        {tabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${tab===id?"bg-green-700 text-white":"bg-white/10 text-gray-300 hover:bg-white/20"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {tab==="pos"       && <PosTab user={user} settings={siteSettings} preload={posPreload} onPreloadConsumed={()=>setPosPreload(null)} />}
        {tab==="orders"    && <OrdersTab user={user} settings={siteSettings} />}
        {tab==="products"  && <ProductsTab />}
        {tab==="expenses"  && <ExpensesTab user={user} settings={siteSettings} />}
        {tab==="customers" && <CustomersTab onReorder={(items)=>{setPosPreload(items);setTab("pos");}} />}
        {tab==="team"      && <TeamTab />}
        {tab==="reports"   && <ReportsTab settings={siteSettings} />}
        {tab==="settings"  && <SettingsTab />}
      </div>
    </main>
  );
}

// ── POS Quick Sale Tab ─────────────────────────────────────────
function PosTab({
  user, settings, preload, onPreloadConsumed,
}: {
  user: TeamMember;
  settings?: Record<string,string>;
  preload?: {id:string;name:string;emoji:string;price:number;qty:number}[] | null;
  onPreloadConsumed?: () => void;
}) {
  const products = useQuery(api.products.list, {});
  const createOrder = useMutation(api.orders.create);
  const [cart, setCart] = useState<{id:string;name:string;emoji:string;imageUrl?:string|null;price:number;qty:number}[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash"|"transfer"|"card">("cash");
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");

  const existingCustomer = useQuery(
    api.customers.getByPhone,
    customerPhone.trim() ? { phone: customerPhone.trim() } : "skip"
  );

  useEffect(() => {
    if (existingCustomer?.name) {
      setCustomerName(existingCustomer.name);
    }
  }, [existingCustomer]);

  // Accept preloaded cart from Customers tab "Re-order"
  useEffect(() => {
    if (preload && preload.length > 0) {
      setCart(preload.map(i => ({...i, imageUrl: null})));
      onPreloadConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preload]);

  const cats = ["all","juice","smoothie","salad","sandwich"];
  const filtered = (products??[]).filter(p => {
    const matchesCat = catFilter === "all" || p.category === catFilter;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return p.available && matchesCat && matchesSearch;
  });
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);

  function addToCart(p: any) {
    setCart(c=>{
      const ex = c.find(i=>i.id===p._id);
      if(ex) return c.map(i=>i.id===p._id?{...i,qty:i.qty+1}:i);
      return [...c,{id:p._id,name:p.name,emoji:p.emoji,imageUrl:p.imageUrl,price:p.price,qty:1}];
    });
  }

  async function charge() {
    if(!cart.length) return;
    setLoading(true);
    const name  = customerName.trim()  || "Walk-in";
    const phone = customerPhone.trim() || "Walk-in";
    try {
      const id = await createOrder({
        customerName: name,
        customerPhone: phone,
        deliveryType: "walkin",
        items: cart.map(i=>({productId:i.id,name:i.name,price:i.price,quantity:i.qty,emoji:i.emoji})),
        subtotal,
        paymentMethod,
        source: "walkin",
        processedBy: user._id,
        processedByName: user.name,
        status: "completed",
      });
      const order = { _id:id, orderNumber:`SO-${Date.now().toString().slice(-6)}`, customerName:name, customerPhone:phone, items:cart.map(i=>({...i,quantity:i.qty})), subtotal, total:subtotal, paymentMethod, createdAt:Date.now() };
      setLastOrder(order);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product grid */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search + category filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4"/></button>}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize ${catFilter===c?"bg-green-700 text-white":"bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              {c}
            </button>
          ))}
        </div>
        {!products ? (
          <div className="flex items-center gap-2 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin"/>Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40"/>
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p=>{
              const inCart = cart.find(i=>i.id===p._id);
              return (
                <button key={p._id} onClick={()=>addToCart(p)}
                  className={`relative p-3 rounded-xl border text-left transition-all active:scale-95 hover:border-green-500/50 ${inCart?"border-green-500/50 bg-green-900/20":"border-white/10 bg-white/5"}`}>
                  <ProductThumb product={p} size="md" />
                  <p className="text-white text-xs font-semibold leading-tight truncate mt-2">{p.name}</p>
                  <p className="text-green-400 text-sm font-bold mt-0.5">{formatPrice(p.price)}</p>
                  {inCart && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{inCart.qty}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart / charge */}
      <div className="space-y-4">
        {lastOrder && (
          <div className="bg-green-900/30 border border-green-600/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-green-400 font-bold text-sm">✅ Sale recorded!</p>
              <button onClick={()=>setLastOrder(null)}><X className="w-4 h-4 text-gray-400"/></button>
            </div>
            <button onClick={()=>printReceipt(lastOrder, settings)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors">
              <Printer className="w-4 h-4"/> Print Receipt
            </button>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-bold">Current Sale</h3>
          <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Phone number (optional — saves to CRM)" maxLength={11}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer name (optional)"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          {customerPhone.trim() && (
            <p className="text-green-400 text-xs -mt-1 flex items-center gap-1">
              <UserCircle className="w-3 h-3"/> Customer profile will be saved
            </p>
          )}

          {cart.length===0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Tap products to add →</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {cart.map(i=>(
                <div key={i.id} className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm flex-1 truncate">{i.emoji} {i.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={()=>setCart(c=>c.map(x=>x.id===i.id?{...x,qty:Math.max(0,x.qty-1)}:x).filter(x=>x.qty>0))}
                      className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-sm hover:bg-white/20">-</button>
                    <span className="text-white text-sm w-4 text-center">{i.qty}</span>
                    <button onClick={()=>setCart(c=>c.map(x=>x.id===i.id?{...x,qty:x.qty+1}:x))}
                      className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-sm hover:bg-white/20">+</button>
                  </div>
                  <span className="text-green-400 text-sm font-semibold shrink-0 w-20 text-right">{formatPrice(i.price*i.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-3">
            <span>Total</span><span className="text-green-400">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex gap-2">
            {(["cash","transfer","card"] as const).map(m=>(
              <button key={m} onClick={()=>setPaymentMethod(m)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${paymentMethod===m?"bg-green-700 text-white":"bg-white/10 text-gray-300 hover:bg-white/20"}`}>
                {m}
              </button>
            ))}
          </div>

          <button onClick={charge} disabled={loading||!cart.length}
            className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading?<Loader2 className="w-5 h-5 animate-spin"/>:<Zap className="w-5 h-5"/>}
            Charge {cart.length>0&&formatPrice(subtotal)}
          </button>
          {cart.length>0&&<button onClick={()=>setCart([])} className="w-full py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">Clear cart</button>}
        </div>
      </div>
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────
function OrdersTab({ user, settings }: { user: TeamMember; settings?: Record<string,string> }) {
  const orders = useQuery(api.orders.list);
  const stats = useQuery(api.orders.getStats);
  const updateStatus = useMutation(api.orders.updateStatus);
  const assignRider = useMutation(api.orders.assignRider);
  const confirmPayment = useMutation(api.orders.confirmPayment);
  const rejectPayment = useMutation(api.orders.rejectPayment);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState<string|null>(null);
  const [paymentUpdating, setPaymentUpdating] = useState<string|null>(null);
  const [receiptLightbox, setReceiptLightbox] = useState(false);
  const receiptUrl = useQuery(
    api.orders.getReceiptUrl,
    selected ? { id: selected._id } : "skip"
  );
  const [riderForm, setRiderForm] = useState({name:"",phone:""});
  const [showRider, setShowRider] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleStatus(id:string,status:OrderStatus){
    setUpdating(id);
    try{await updateStatus({id,status});}finally{setUpdating(null);}
  }

  async function handleConfirmPayment(id:string){
    setPaymentUpdating(id);
    try{
      await confirmPayment({id, confirmedBy: user.name});
      // Refresh selected if open
      if(selected?._id===id) setSelected((s:any)=>s ? {...s, paymentStatus:"confirmed", status:"confirmed"} : s);
    }finally{setPaymentUpdating(null);}
  }

  async function handleRejectPayment(id:string){
    setPaymentUpdating(id);
    try{
      await rejectPayment({id});
      if(selected?._id===id) setSelected((s:any)=>s ? {...s, paymentStatus:"rejected"} : s);
    }finally{setPaymentUpdating(null);}
  }

  function copyRiderText(order:any){
    const text=`🛵 *SPOT-ON DELIVERY*\n\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.deliveryAddress||"N/A"}\n\nItems:\n${order.items.map((i:any)=>`${i.emoji} ${i.name} ×${i.quantity}`).join("\n")}\n\nTotal: ₦${(order.total??order.subtotal).toLocaleString()}\nPayment: ${order.paymentMethod||"Collect on delivery"}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  async function saveRider(){
    if(!selected) return;
    await assignRider({id:selected._id,riderName:riderForm.name,riderPhone:riderForm.phone});
    setShowRider(false);
  }

  const selectedData = orders?.find((o:any)=>o._id===selected?._id);

  return (
    <div className="space-y-6">
      {stats&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:"Today's Revenue",val:formatPrice(stats.revenue),color:"text-green-400"},
            {label:"Pending",val:stats.pending,color:"text-yellow-400"},
            {label:"In Progress",val:stats.active,color:"text-orange-400"},
            {label:"Completed",val:stats.completed,color:"text-green-400"},
          ].map(s=>(
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold">All Orders</h2>
            {!orders&&<Loader2 className="w-4 h-4 animate-spin text-gray-400"/>}
          </div>
          {orders?.length===0&&<div className="text-center py-16 text-gray-500"><span className="text-4xl block mb-3">📭</span>No orders yet.</div>}
          {orders?.map((order:any)=>{
            const S=STATUS_CFG[order.status as OrderStatus];
            const Icon=S.icon;
            const next=NEXT_STATUS[order.status as OrderStatus];
            return(
              <div key={order._id} onClick={()=>setSelected(order)}
                className={`bg-white/5 border rounded-xl p-3 cursor-pointer transition-all ${selected?._id===order._id?"border-green-500/50":"border-white/10 hover:border-white/20"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold font-mono text-sm">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${S.color}`}><Icon className="w-3 h-3"/>{S.label}</span>
                      {order.source==="walkin"&&<span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Walk-in</span>}
                    </div>
                    <p className="text-gray-300 text-sm mt-0.5">{order.customerName}{order.customerPhone!=="Walk-in"&&` · ${order.customerPhone}`}</p>
                    <p className="text-gray-500 text-xs">{order.items.length} items · {formatPrice(order.total??order.subtotal)} · {order.paymentMethod||"pending"}
                      {order.paymentMethod==="transfer"&&order.paymentStatus==="awaiting_confirmation"&&<span className="ml-1 text-amber-400">⏳</span>}
                      {order.paymentMethod==="transfer"&&order.paymentStatus==="confirmed"&&<span className="ml-1 text-green-400">✅</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}</p>
                    {next&&(
                      <button onClick={e=>{e.stopPropagation();handleStatus(order._id,next);}} disabled={updating===order._id}
                        className="px-3 py-1.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-60">
                        {updating===order._id?<Loader2 className="w-3 h-3 animate-spin"/>:`→ ${STATUS_CFG[next].label}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order detail */}
        <div className="sticky top-4 space-y-3">
          {!selectedData?(
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-500"><span className="text-3xl block mb-2">👆</span>Click order to view</div>
          ):(
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold font-mono">{selectedData.orderNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CFG[selectedData.status as OrderStatus].color}`}>{STATUS_CFG[selectedData.status as OrderStatus].label}</span>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-400">Customer:</span> <span className="text-white">{selectedData.customerName}</span></p>
                {selectedData.customerPhone!=="Walk-in"&&<p><span className="text-gray-400">Phone:</span> <span className="text-white">{selectedData.customerPhone}</span></p>}
                <p><span className="text-gray-400">Type:</span> <span className="text-white capitalize">{selectedData.deliveryType}</span></p>
                {selectedData.deliveryAddress&&<p><span className="text-gray-400">Address:</span> <span className="text-white">{selectedData.deliveryAddress}</span></p>}
                {selectedData.riderName&&<p><span className="text-gray-400">Rider:</span> <span className="text-white">{selectedData.riderName} ({selectedData.riderPhone})</span></p>}
              </div>
              <div className="border-t border-white/10 pt-2 space-y-1">
                {selectedData.items.map((i:any,idx:number)=>(
                  <div key={idx} className="flex justify-between text-sm"><span className="text-gray-300">{i.emoji} {i.name} ×{i.quantity}</span><span className="text-white">{formatPrice(i.price*i.quantity)}</span></div>
                ))}
                {selectedData.deliveryFee>0&&<div className="flex justify-between text-sm"><span className="text-gray-400">Delivery fee</span><span className="text-white">{formatPrice(selectedData.deliveryFee)}</span></div>}
                <div className="flex justify-between font-bold pt-1 border-t border-white/10"><span className="text-white">Total</span><span className="text-green-400">{formatPrice(selectedData.total??selectedData.subtotal)}</span></div>
              </div>
              <div className="space-y-2 pt-1">
                {/* Payment confirmation for transfer orders */}
                {selectedData.paymentMethod==="transfer" && selectedData.paymentStatus==="awaiting_confirmation" && (
                  <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 space-y-2">
                    <p className="text-amber-300 text-xs font-semibold">⏳ Payment Awaiting Confirmation</p>
                    {selectedData.paymentBank && <p className="text-gray-400 text-xs">Sent from: <span className="text-white">{selectedData.paymentBank}</span></p>}
                    {/* Receipt image */}
                    {receiptUrl && (
                      <button type="button" onClick={()=>setReceiptLightbox(true)}
                        className="w-full rounded-xl overflow-hidden border border-amber-500/40 hover:border-amber-400 transition-colors group relative">
                        <img src={receiptUrl} alt="Transfer receipt" className="w-full max-h-48 object-contain bg-black/60" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            🔍 View Full Receipt
                          </span>
                        </div>
                      </button>
                    )}
                    {!receiptUrl && selectedData.receiptStorageId && (
                      <div className="flex items-center gap-2 text-gray-500 text-xs py-2">
                        <Loader2 className="w-3 h-3 animate-spin"/>Loading receipt...
                      </div>
                    )}
                    {!selectedData.receiptStorageId && (
                      <p className="text-gray-600 text-xs italic">No receipt uploaded</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={()=>handleConfirmPayment(selectedData._id)} disabled={paymentUpdating===selectedData._id}
                        className="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1">
                        {paymentUpdating===selectedData._id?<Loader2 className="w-3 h-3 animate-spin"/>:<CheckCircle2 className="w-3.5 h-3.5"/>}Confirm Payment
                      </button>
                      <button onClick={()=>handleRejectPayment(selectedData._id)} disabled={paymentUpdating===selectedData._id}
                        className="flex-1 py-2 rounded-full bg-red-900/30 hover:bg-red-800/40 text-red-400 text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5"/>Reject
                      </button>
                    </div>
                  </div>
                )}
                {selectedData.paymentMethod==="transfer" && selectedData.paymentStatus==="confirmed" && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-2.5 text-center text-green-400 text-xs font-semibold">✅ Payment Confirmed</div>
                )}
                {selectedData.paymentMethod==="transfer" && selectedData.paymentStatus==="rejected" && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-2.5 text-center text-red-400 text-xs font-semibold">❌ Payment Rejected</div>
                )}
                {Object.entries(NEXT_STATUS).map(([from,to])=>selectedData.status===from?(
                  <button key={to} onClick={()=>handleStatus(selectedData._id,to as OrderStatus)} disabled={updating===selectedData._id}
                    className="w-full py-2 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                    {updating===selectedData._id?<Loader2 className="w-4 h-4 animate-spin"/>:null}Mark as {STATUS_CFG[to as OrderStatus].label}
                  </button>
                ):null)}
                {selectedData.status==="pending"&&<button onClick={()=>handleStatus(selectedData._id,"cancelled")} className="w-full py-2 rounded-full bg-red-900/30 text-red-400 text-sm font-semibold hover:bg-red-800/40">Cancel</button>}
                <button onClick={()=>printReceipt(selectedData, settings)} className="w-full py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4"/> Print Receipt
                </button>
                {selectedData.deliveryType==="delivery"&&(
                  <>
                    <button onClick={()=>copyRiderText(selectedData)} className="w-full py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 flex items-center justify-center gap-2">
                      {copied?<Check className="w-4 h-4 text-green-400"/>:<Copy className="w-4 h-4"/>}
                      {copied?"Copied!":"Copy for Rider WhatsApp"}
                    </button>
                    <button onClick={()=>{setShowRider(true);setRiderForm({name:selectedData.riderName||"",phone:selectedData.riderPhone||""}); }} className="w-full py-2 rounded-full bg-white/10 text-blue-300 text-sm font-semibold hover:bg-white/20 flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4"/> Assign Rider
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt lightbox */}
      {receiptLightbox && receiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={()=>setReceiptLightbox(false)}>
          <div className="relative max-w-lg w-full" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">Transfer Receipt — {selectedData?.orderNumber}</p>
              <button onClick={()=>setReceiptLightbox(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <img src={receiptUrl} alt="Transfer receipt" className="w-full rounded-2xl object-contain max-h-[70vh] bg-black/60 border border-white/10"/>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>{handleConfirmPayment(selectedData._id);setReceiptLightbox(false);}} disabled={paymentUpdating===selectedData?._id}
                className="flex-1 py-3 rounded-full bg-green-700 hover:bg-green-600 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4"/>Confirm Payment
              </button>
              <button onClick={()=>{handleRejectPayment(selectedData._id);setReceiptLightbox(false);}} disabled={paymentUpdating===selectedData?._id}
                className="flex-1 py-3 rounded-full bg-red-900/40 hover:bg-red-800/50 text-red-300 font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4"/>Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rider modal */}
      {showRider&&(
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={()=>setShowRider(false)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d1f17] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-white font-bold text-lg">Assign Rider</h3>
              <input value={riderForm.name} onChange={e=>setRiderForm(f=>({...f,name:e.target.value}))} placeholder="Rider name" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
              <input value={riderForm.phone} onChange={e=>setRiderForm(f=>({...f,phone:e.target.value}))} placeholder="Rider phone" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
              <div className="flex gap-3">
                <button onClick={()=>setShowRider(false)} className="flex-1 py-3 rounded-full border border-white/20 text-gray-300 text-sm font-semibold">Cancel</button>
                <button onClick={saveRider} className="flex-1 py-3 rounded-full bg-green-700 text-white text-sm font-bold">Save</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name:"",category:"juice" as const,description:"",ingredients:"",
  price:"",costPrice:"",emoji:"🍊",gradient:"from-orange-400 to-yellow-300",
  badge:"",available:true,imageStorageId:"" as string|undefined,
};

function ProductsTab() {
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const removeImage   = useMutation(api.products.removeImage);
  const toggleAvailable = useMutation(api.products.toggleAvailable);
  const seedProducts  = useMutation(api.products.seed);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const updateImage   = useMutation(api.products.updateImage);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cats = ["all","juice","smoothie","salad","sandwich"];
  const filtered = (products??[]).filter(p => {
    const matchesCat = catFilter === "all" || p.category === catFilter;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function openEdit(p: any) {
    setEditId(p._id);
    setForm({
      name:p.name,category:p.category,description:p.description,
      ingredients:p.ingredients.join(", "),price:String(p.price),
      costPrice:String(p.costPrice||""),emoji:p.emoji,gradient:p.gradient,
      badge:p.badge??"",available:p.available,imageStorageId:p.imageStorageId,
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || null);
    setShowForm(true);
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_PRODUCT);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  }

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    try{
      let imageStorageId = form.imageStorageId;

      // Upload new image if selected
      if (imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await res.json();
        imageStorageId = storageId;
      }

      const data = {
        name:form.name,category:form.category,description:form.description,
        ingredients:form.ingredients.split(",").map(s=>s.trim()).filter(Boolean),
        price:Number(form.price),
        costPrice:form.costPrice?Number(form.costPrice):undefined,
        available:form.available,emoji:form.emoji,gradient:form.gradient,
        badge:form.badge||undefined,
        imageStorageId: imageStorageId || undefined,
      };
      if(editId) await updateProduct({id:editId,...data});
      else await createProduct(data);
      setShowForm(false); setForm(EMPTY_PRODUCT); setImageFile(null); setImagePreview(null);
    }finally{setLoading(false);}
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-bold text-lg">Products ({products?.length??0})</h2>
        <div className="flex gap-2 flex-wrap">
          {seedMsg&&<span className="text-green-400 text-sm self-center">{seedMsg}</span>}
          <button onClick={async()=>{const r=await seedProducts({});setSeedMsg(r.seeded?`✅ Seeded ${r.count}!`:"ℹ️ Already seeded");setTimeout(()=>setSeedMsg(""),3000);}} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20"><RefreshCw className="w-4 h-4"/>Seed</button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-600"><Plus className="w-4 h-4"/>Add Product</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${catFilter===c?"bg-green-700 text-white":"bg-white/10 text-gray-300 hover:bg-white/20"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {!products?<div className="flex items-center gap-2 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin"/>Loading...</div>:(
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(p=>{
            const margin=p.costPrice?(((p.price-p.costPrice)/p.price)*100).toFixed(0):null;
            return(
              <div key={p._id} className={`bg-white/5 border rounded-xl overflow-hidden ${!p.available?"opacity-50":"border-white/10"}`}>
                <div className="relative">
                  <ProductThumb product={p} size="lg" />
                  {p.badge&&<span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-yellow-300 text-xs font-semibold">{p.badge}</span>}
                  {p.imageStorageId&&(
                    <button onClick={()=>removeImage({id:p._id})} title="Remove image"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-red-400 hover:bg-red-900/60 transition-colors">
                      <X className="w-3 h-3"/>
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{p.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-bold">{formatPrice(p.price)}</span>
                    {margin&&<span className="text-xs text-purple-400">{margin}% margin</span>}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={()=>toggleAvailable({id:p._id,available:!p.available})} className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs transition-colors ${p.available?"bg-green-500/20 text-green-400":"bg-gray-500/20 text-gray-400"}`}>
                      {p.available?<ToggleRight className="w-3 h-3"/>:<ToggleLeft className="w-3 h-3"/>}{p.available?"On":"Off"}
                    </button>
                    <button onClick={()=>openEdit(p)} className="px-2 py-0.5 rounded-lg bg-white/10 text-blue-400 text-xs hover:bg-blue-900/30"><Pencil className="w-3 h-3 inline mr-0.5"/>Edit</button>
                    <button onClick={()=>removeProduct({id:p._id})} className="px-2 py-0.5 rounded-lg bg-white/10 text-red-400 text-xs hover:bg-red-900/30"><Trash2 className="w-3 h-3 inline mr-0.5"/>Del</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm&&(
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={()=>setShowForm(false)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-[#0d1f17] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <h2 className="text-white font-bold text-xl">{editId?"Edit Product":"Add Product"}</h2>

              {/* Image upload */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Product Image (optional)</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-xl"/>
                    <button type="button" onClick={()=>{setImageFile(null);setImagePreview(null);setForm(f=>({...f,imageStorageId:""}));if(fileInputRef.current)fileInputRef.current.value="";}}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-900/80">
                      <X className="w-4 h-4"/>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={()=>fileInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-500/50 hover:text-green-400 transition-all">
                    <ImagePlus className="w-6 h-6"/>
                    <span className="text-xs">Click to upload image</span>
                    <span className="text-xs text-gray-600">JPG, PNG, WebP · Max 5MB</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-gray-400 text-xs mb-1 block">Name *</label><input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tropical Twist" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
                <div><label className="text-gray-400 text-xs mb-1 block">Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as any}))} className="w-full px-3 py-2.5 rounded-xl bg-[#0a1a10] border border-white/20 text-white text-sm focus:outline-none focus:border-green-500"><option value="juice">🍊 Juice</option><option value="smoothie">🥤 Smoothie</option><option value="salad">🥗 Salad</option><option value="sandwich">🥪 Sandwich</option></select></div>
                <div><label className="text-gray-400 text-xs mb-1 block">Emoji (fallback)</label><input required value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} placeholder="🍊" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
                <div><label className="text-gray-400 text-xs mb-1 block">Price (₦) *</label><input required type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="2000" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
                <div><label className="text-gray-400 text-xs mb-1 block">Cost Price (₦)</label><input type="number" value={form.costPrice} onChange={e=>setForm(f=>({...f,costPrice:e.target.value}))} placeholder="800" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
                <div><label className="text-gray-400 text-xs mb-1 block">Badge</label><input value={form.badge} onChange={e=>setForm(f=>({...f,badge:e.target.value}))} placeholder="Popular" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
              </div>
              <div><label className="text-gray-400 text-xs mb-1 block">Description *</label><textarea required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"/></div>
              <div><label className="text-gray-400 text-xs mb-1 block">Ingredients (comma-separated)</label><input required value={form.ingredients} onChange={e=>setForm(f=>({...f,ingredients:e.target.value}))} placeholder="Orange, Ginger, Lemon" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/></div>
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Gradient (shown if no image)</label>
                <div className="grid grid-cols-6 gap-1.5">{GRADIENTS.map(g=><button type="button" key={g} onClick={()=>setForm(f=>({...f,gradient:g}))} className={`h-7 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${form.gradient===g?"border-white scale-110":"border-transparent"}`}/>)}</div>
                {!imagePreview&&<div className={`mt-2 h-10 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center text-2xl`}>{form.emoji}</div>}
              </div>
              <div className="flex items-center gap-3"><label className="text-gray-400 text-sm">Available</label><button type="button" onClick={()=>setForm(f=>({...f,available:!f.available}))} className={`w-12 h-6 rounded-full relative transition-all ${form.available?"bg-green-600":"bg-gray-600"}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${form.available?"left-6":"left-0.5"}`}/></button></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-full border border-white/20 text-gray-300 font-semibold hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-full bg-green-700 hover:bg-green-600 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading&&<Loader2 className="w-4 h-4 animate-spin"/>}{editId?"Save Changes":"Add Product"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// ── Expenses Tab ───────────────────────────────────────────────
function ExpensesTab({ user, settings }: { user: TeamMember; settings?: Record<string,string> }) {
  const [date, setDate] = useState(today());
  const expenses = useQuery(api.expenses.list, { date });
  const createExpense = useMutation(api.expenses.create);
  const removeExpense = useMutation(api.expenses.remove);
  const orders = useQuery(api.orders.list);

  // Load expense categories from settings (with fallback)
  const expenseCats: string[] = (() => {
    try {
      if (settings?.expenseCategories) return JSON.parse(settings.expenseCategories);
    } catch { /**/ }
    return DEFAULT_EXPENSE_CATS;
  })();

  const [form, setForm] = useState({category: expenseCats[0] ?? "ingredients", amount:"", note:""});
  const [loading, setLoading] = useState(false);

  // Update form category if cats change
  useEffect(() => {
    if (expenseCats.length > 0 && !expenseCats.includes(form.category)) {
      setForm(f => ({...f, category: expenseCats[0]}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.expenseCategories]);

  const dayRevenue = (orders??[]).filter((o:any)=>new Date(o.createdAt).toISOString().split("T")[0]===date&&o.status!=="cancelled").reduce((s:number,o:any)=>s+(o.total??o.subtotal),0);
  const dayExpenses = (expenses??[]).reduce((s,e)=>s+e.amount,0);
  const netPosition = dayRevenue - dayExpenses;

  async function handleAdd(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    try{await createExpense({date,category:form.category as any,amount:Number(form.amount),note:form.note||undefined,addedBy:user.name});setForm(f=>({...f,amount:"",note:""}));}
    finally{setLoading(false);}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-white font-bold text-lg">Expenses</h2>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500"/>
      </div>

      {/* Net position summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-900/30 border border-green-600/30 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1"/>
          <p className="text-green-400 font-bold text-lg">{formatPrice(dayRevenue)}</p>
          <p className="text-gray-400 text-xs">Revenue</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-center">
          <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1"/>
          <p className="text-red-400 font-bold text-lg">{formatPrice(dayExpenses)}</p>
          <p className="text-gray-400 text-xs">Expenses</p>
        </div>
        <div className={`border rounded-xl p-4 text-center ${netPosition>=0?"bg-green-900/20 border-green-500/20":"bg-red-900/20 border-red-500/20"}`}>
          <p className={`font-bold text-lg ${netPosition>=0?"text-green-400":"text-red-400"}`}>{formatPrice(Math.abs(netPosition))}</p>
          <p className="text-gray-400 text-xs">{netPosition>=0?"Net Profit":"Net Loss"}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="px-3 py-2.5 rounded-xl bg-[#0a1a10] border border-white/20 text-white text-sm capitalize focus:outline-none focus:border-green-500">
          {expenseCats.map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <input required type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="Amount (₦)" className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
        <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Note (optional)" className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
        <button type="submit" disabled={loading} className="py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}Add
        </button>
      </form>

      <div className="space-y-2">
        {!expenses?<div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading...</div>:
        expenses.length===0?<p className="text-gray-500 text-center py-8">No expenses logged for this date.</p>:
        expenses.map(exp=>(
          <div key={exp._id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-xs capitalize">{exp.category}</span>
              {exp.note&&<span className="text-gray-400 text-sm">{exp.note}</span>}
              {exp.addedBy&&<span className="text-gray-600 text-xs">by {exp.addedBy}</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-400 font-bold">{formatPrice(exp.amount)}</span>
              <button onClick={()=>removeExpense({id:exp._id})} className="p-1 rounded-lg hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Team Tab ───────────────────────────────────────────────────
function TeamTab() {
  const members = useQuery(api.team.list);
  const createMember = useMutation(api.team.create);
  const updateMember = useMutation(api.team.update);
  const removeMember = useMutation(api.team.remove);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",pin:"",role:"cashier" as Role});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealPins, setRevealPins] = useState(false);

  async function handleAdd(e:React.FormEvent){
    e.preventDefault(); setLoading(true); setError("");
    try{await createMember(form);setShowForm(false);setForm({name:"",pin:"",role:"cashier"});}
    catch(err:any){setError(err.message||"Error creating member");}
    finally{setLoading(false);}
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-bold text-lg">Team Members</h2>
        <div className="flex gap-2">
          <button onClick={()=>setRevealPins(r=>!r)} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${revealPins?"bg-yellow-700/40 text-yellow-300":"bg-white/10 text-gray-400"}`}>
            {revealPins ? "🙈 Hide PINs" : "👁 Show PINs"}
          </button>
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-600"><Plus className="w-4 h-4"/>Add Member</button>
        </div>
      </div>
      <p className="text-gray-400 text-sm">Each member logs in with their 4-digit PIN. <span className="text-yellow-400">Admin</span> has full access. <span className="text-blue-400">Cashier</span> can only use Quick Sale + Orders.</p>

      {!members?<div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading...</div>:(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(m=>(
            <div key={m._id} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${!m.active?"opacity-50":""}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-bold">{m.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${m.role==="admin"?"bg-yellow-500/20 text-yellow-400 border-yellow-500/30":"bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>{m.role}</span>
                </div>
                <span className="text-gray-400 font-mono text-sm">
                  {revealPins ? `PIN: ${m.pin}` : "PIN: ••••"}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>updateMember({id:m._id,active:!m.active})} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${m.active?"bg-red-900/30 text-red-400":"bg-green-900/30 text-green-400"}`}>{m.active?"Deactivate":"Activate"}</button>
                <button onClick={()=>removeMember({id:m._id})} className="px-3 py-1.5 rounded-lg bg-white/10 text-red-400 text-xs hover:bg-red-900/30"><Trash2 className="w-3 h-3"/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm&&(
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={()=>setShowForm(false)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAdd} className="bg-[#0d1f17] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-white font-bold text-lg">Add Team Member</h3>
              <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
              <input required value={form.pin} onChange={e=>setForm(f=>({...f,pin:e.target.value.slice(0,4)}))} placeholder="4-digit PIN" maxLength={4} pattern="\d{4}" className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono tracking-widest text-center text-xl"/>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value as Role}))} className="w-full px-3 py-2.5 rounded-xl bg-[#0a1a10] border border-white/20 text-white text-sm focus:outline-none focus:border-green-500">
                <option value="cashier">Cashier (Quick Sale + Orders only)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
              {error&&<p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-full border border-white/20 text-gray-300 text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-full bg-green-700 text-white text-sm font-bold disabled:opacity-60">Add</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// ── Reports Tab ────────────────────────────────────────────────
function ReportsTab({ settings }: { settings?: Record<string,string> }) {
  const [date, setDate] = useState(today());
  const report = useQuery(api.orders.getEodReport, { date: new Date(date).toDateString() });
  const expenses = useQuery(api.expenses.list, { date });

  const totalExpenses = (expenses??[]).reduce((s,e)=>s+e.amount,0);
  const netPosition = (report?.revenue??0) - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-white font-bold text-lg">End-of-Day Report</h2>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500"/>
        <button onClick={()=>window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm hover:bg-white/20"><Printer className="w-4 h-4"/>Print Report</button>
      </div>

      {!report?<div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading...</div>:(
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"Total Orders",val:report.totalOrders,color:"text-white"},
              {label:"Revenue",val:formatPrice(report.revenue),color:"text-green-400"},
              {label:"Expenses",val:formatPrice(totalExpenses),color:"text-red-400"},
              {label:netPosition>=0?"Net Profit":"Net Loss",val:formatPrice(Math.abs(netPosition)),color:netPosition>=0?"text-green-400":"text-red-400"},
            ].map(s=>(
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className={`text-xl font-extrabold ${s.color}`}>{s.val}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payment breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center"><p className="text-white font-bold">{formatPrice(report.cash)}</p><p className="text-gray-400 text-xs">Cash</p></div>
            <div className="text-center"><p className="text-white font-bold">{formatPrice(report.transfer)}</p><p className="text-gray-400 text-xs">Transfer</p></div>
            <div className="text-center"><p className="text-white font-bold">{report.webOrders}</p><p className="text-gray-400 text-xs">Web Orders</p></div>
            <div className="text-center"><p className="text-white font-bold">{report.walkinOrders}</p><p className="text-gray-400 text-xs">Walk-ins</p></div>
          </div>

          {/* Expenses by category */}
          {expenses&&expenses.length>0&&(
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">Expenses Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(expenses.reduce((acc,e)=>({...acc,[e.category]:(acc[e.category]??0)+e.amount}),{} as Record<string,number>)).map(([cat,amt])=>(
                  <div key={cat} className="flex justify-between">
                    <span className="text-gray-300 capitalize">{cat}</span>
                    <span className="text-red-400 font-semibold">{formatPrice(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-500 text-xs text-center">Report for {date} · Generated {new Date().toLocaleString("en-NG")}</p>
        </div>
      )}
    </div>
  );
}

// ── Customers Tab ─────────────────────────────────────────────
const TAG_OPTIONS = ["new","loyal","vip","regular","inactive"];
const TAG_COLORS: Record<string,string> = {
  new:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  loyal:    "bg-green-500/20 text-green-300 border-green-500/30",
  vip:      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  regular:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function CustomersTab({ onReorder }: { onReorder: (items:{id:string;name:string;emoji:string;price:number;qty:number}[])=>void }) {
  const customers = useQuery(api.customers.list, {});
  const stats = useQuery(api.customers.getStats, {});
  const orders = useQuery(api.orders.list);
  const updateTags  = useMutation(api.customers.updateTags);
  const updateNotes = useMutation(api.customers.updateNotes);
  const removeCustomer = useMutation(api.customers.remove);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string|null>(null);
  const [editNotes, setEditNotes] = useState<{id:string;val:string}|null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const filtered = (customers ?? []).filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  // Get orders for a given phone number
  function getCustomerOrders(phone: string) {
    return (orders ?? []).filter((o: any) => o.customerPhone === phone);
  }

  // Export CSV
  function exportCSV() {
    const rows = [
      ["Name", "Phone", "Total Orders", "Total Spend (₦)", "Last Order", "Tags"],
      ...(customers ?? []).map(c => [
        c.name,
        c.phone,
        c.totalOrders,
        c.totalSpend,
        new Date(c.lastOrderAt).toLocaleDateString("en-NG"),
        (c.tags ?? []).join(", "),
      ])
    ];
    const csv = rows.map(r => r.map(f => `"${f}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `spot-on-customers-${today()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveNotes() {
    if (!editNotes) return;
    setSavingNotes(true);
    try { await updateNotes({ id: editNotes.id as any, notes: editNotes.val }); setEditNotes(null); }
    finally { setSavingNotes(false); }
  }

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-bold text-lg">Customers</h2>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-700/60 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
          <Download className="w-4 h-4"/> Export CSV
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:"Total Customers", val:stats.total,                          color:"text-white"},
            {label:"New This Month",  val:stats.newThisMonth,                   color:"text-blue-400"},
            {label:"Total Revenue",   val:formatPrice(stats.totalSpend),        color:"text-green-400"},
            {label:"Top Spender",     val:stats.topSpender?.name ?? "—",        color:"text-yellow-400"},
          ].map(s=>(
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-xl font-extrabold truncate ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
        {search&&<button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4"/></button>}
      </div>

      {!customers ? (
        <div className="flex items-center gap-2 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin"/>Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p>{search ? "No customers found." : "No customers yet — they'll appear automatically as orders come in."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const isExpanded = expanded === c._id;
            const custOrders = isExpanded ? getCustomerOrders(c.phone) : [];
            return (
              <div key={c._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={()=>setExpanded(isExpanded ? null : c._id)}>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{c.name}</span>
                      {(c.tags??[]).map(tag=>(
                        <span key={tag} className={`px-1.5 py-0.5 rounded-full text-xs border capitalize ${TAG_COLORS[tag]??TAG_COLORS.regular}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-gray-400 text-xs flex items-center gap-1"><Phone className="w-3 h-3"/>{c.phone}</span>
                      <span className="text-gray-500 text-xs">{c.totalOrders} order{c.totalOrders!==1?"s":""}</span>
                      <span className="text-green-400 text-xs font-semibold">{formatPrice(c.totalSpend)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-500 text-xs hidden sm:block">
                      {new Date(c.lastOrderAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500"/> : <ChevronDown className="w-4 h-4 text-gray-500"/>}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-4 py-4 space-y-4 bg-black/20">
                    {/* Last order + Re-order */}
                    {c.lastOrderItems && c.lastOrderItems.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Last Order</p>
                        <div className="space-y-1 mb-3">
                          {c.lastOrderItems.map((item,i)=>(
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-300">{item.emoji} {item.name} ×{item.quantity}</span>
                              <span className="text-white">{formatPrice(item.price*item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={()=>onReorder(c.lastOrderItems!.map(i=>({id:i.productId,name:i.name,emoji:i.emoji,price:i.price,qty:i.quantity})))}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-all active:scale-95">
                          <RepeatIcon className="w-3.5 h-3.5"/> Re-order in POS
                        </button>
                      </div>
                    )}

                    {/* Order history */}
                    {custOrders.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Order History ({custOrders.length})</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                          {custOrders.slice(0,10).map((o:any)=>(
                            <div key={o._id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5">
                              <span className="text-gray-400 font-mono">{o.orderNumber}</span>
                              <span className="text-gray-300">{o.items.length} items</span>
                              <span className="text-green-400 font-semibold">{formatPrice(o.total??o.subtotal)}</span>
                              <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map(tag=>{
                          const active = (c.tags??[]).includes(tag);
                          return (
                            <button key={tag} onClick={()=>{
                              const current = c.tags??[];
                              const next = active ? current.filter(t=>t!==tag) : [...current,tag];
                              updateTags({id:c._id,tags:next});
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${active?TAG_COLORS[tag]??TAG_COLORS.regular:"bg-white/5 text-gray-500 border-white/10 hover:border-white/20"}`}>
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1"><StickyNote className="w-3 h-3"/>Notes</p>
                      {editNotes?.id === c._id ? (
                        <div className="flex gap-2">
                          <input value={editNotes.val} onChange={e=>setEditNotes(n=>n?{...n,val:e.target.value}:n)}
                            onKeyDown={e=>{if(e.key==="Enter")saveNotes();if(e.key==="Escape")setEditNotes(null);}}
                            autoFocus className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500"/>
                          <button onClick={saveNotes} disabled={savingNotes} className="px-3 py-1.5 rounded-xl bg-green-700 text-white text-xs font-semibold disabled:opacity-60">
                            {savingNotes?<Loader2 className="w-3 h-3 animate-spin"/>:<Check className="w-3 h-3"/>}
                          </button>
                          <button onClick={()=>setEditNotes(null)} className="px-2 py-1.5 rounded-xl bg-white/10 text-gray-400 text-xs"><X className="w-3 h-3"/></button>
                        </div>
                      ) : (
                        <button onClick={()=>setEditNotes({id:c._id,val:c.notes??""})}
                          className="w-full text-left px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-white/20 transition-colors">
                          {c.notes ? <span className="text-gray-300">{c.notes}</span> : <span className="text-gray-600 italic">Click to add a note...</span>}
                        </button>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <button onClick={()=>{if(confirm(`Remove ${c.name} from customers?`))removeCustomer({id:c._id});}}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 text-red-400 text-xs hover:bg-red-900/30 transition-colors">
                        <Trash2 className="w-3 h-3"/>Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ───────────────────────────────────────────────
function SettingsTab() {
  const siteSettings = useQuery(api.settings.getAll, {});
  const setSetting   = useMutation(api.settings.setBulk);

  // Business info
  const [bizForm, setBizForm] = useState({ businessName:"", businessTagline:"", businessAddress:"", businessPhone:"", receiptFooter:"", defaultDeliveryFee:"" });
  const [bizSaving, setBizSaving] = useState(false);
  const [bizSaved, setBizSaved] = useState(false);

  // Bank account
  const [bankForm, setBankForm] = useState({ bankName:"", bankAccountNumber:"", bankAccountName:"" });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);

  // Expense categories
  const [expCats, setExpCats] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catSaved, setCatSaved] = useState(false);

  // Load settings into form when data arrives
  useEffect(() => {
    if (!siteSettings) return;
    setBizForm({
      businessName:      siteSettings.businessName      ?? "Spot-On",
      businessTagline:   siteSettings.businessTagline   ?? "Fresh Juices & Salads",
      businessAddress:   siteSettings.businessAddress   ?? "",
      businessPhone:     siteSettings.businessPhone     ?? "",
      receiptFooter:     siteSettings.receiptFooter     ?? "Thank you! Come again 🙏",
      defaultDeliveryFee:siteSettings.defaultDeliveryFee?? "500",
    });
    setBankForm({
      bankName:          siteSettings.bankName          ?? "",
      bankAccountNumber: siteSettings.bankAccountNumber ?? "",
      bankAccountName:   siteSettings.bankAccountName   ?? "",
    });
    try {
      const cats = JSON.parse(siteSettings.expenseCategories ?? "[]");
      setExpCats(Array.isArray(cats) && cats.length > 0 ? cats : DEFAULT_EXPENSE_CATS);
    } catch {
      setExpCats(DEFAULT_EXPENSE_CATS);
    }
  }, [siteSettings]);

  async function saveBizInfo(e: React.FormEvent) {
    e.preventDefault(); setBizSaving(true);
    try {
      await setSetting({ entries: Object.entries(bizForm).map(([key,value]) => ({key,value})) });
      setBizSaved(true); setTimeout(()=>setBizSaved(false), 2000);
    } finally { setBizSaving(false); }
  }

  async function saveBankInfo(e: React.FormEvent) {
    e.preventDefault(); setBankSaving(true);
    try {
      await setSetting({ entries: Object.entries(bankForm).map(([key,value]) => ({key,value})) });
      setBankSaved(true); setTimeout(()=>setBankSaved(false), 2000);
    } finally { setBankSaving(false); }
  }

  async function saveExpCats() {
    setCatSaving(true);
    try {
      await setSetting({ entries: [{ key: "expenseCategories", value: JSON.stringify(expCats) }] });
      setCatSaved(true); setTimeout(()=>setCatSaved(false), 2000);
    } finally { setCatSaving(false); }
  }

  function addCat() {
    const trimmed = newCat.trim().toLowerCase();
    if (!trimmed || expCats.includes(trimmed)) return;
    setExpCats(c => [...c, trimmed]);
    setNewCat("");
  }

  function removeCat(cat: string) {
    setExpCats(c => c.filter(x => x !== cat));
  }

  function moveCat(idx: number, dir: -1|1) {
    const arr = [...expCats];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    setExpCats(arr);
  }

  if (!siteSettings) return <div className="flex items-center gap-2 text-gray-400 py-8"><Loader2 className="w-5 h-5 animate-spin"/>Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-white font-bold text-lg">Settings</h2>

      {/* ── Business Profile ── */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-green-400"/>
          <h3 className="text-white font-bold">Business Profile</h3>
        </div>
        <form onSubmit={saveBizInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Business Name</label>
              <input value={bizForm.businessName} onChange={e=>setBizForm(f=>({...f,businessName:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="Spot-On"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Tagline</label>
              <input value={bizForm.businessTagline} onChange={e=>setBizForm(f=>({...f,businessTagline:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="Fresh Juices & Salads"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Phone Number</label>
              <input value={bizForm.businessPhone} onChange={e=>setBizForm(f=>({...f,businessPhone:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="+234 800 000 0000"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Default Delivery Fee (₦)</label>
              <input type="number" value={bizForm.defaultDeliveryFee} onChange={e=>setBizForm(f=>({...f,defaultDeliveryFee:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="500"/>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Address</label>
              <input value={bizForm.businessAddress} onChange={e=>setBizForm(f=>({...f,businessAddress:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="12 Mango Street, Lagos"/>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block flex items-center gap-1"><Receipt className="w-3 h-3"/>Receipt Footer Message</label>
              <input value={bizForm.receiptFooter} onChange={e=>setBizForm(f=>({...f,receiptFooter:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="Thank you! Come again 🙏"/>
            </div>
          </div>
          <button type="submit" disabled={bizSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-bold disabled:opacity-60 transition-all">
            {bizSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : bizSaved ? <Check className="w-4 h-4 text-green-300"/> : <Save className="w-4 h-4"/>}
            {bizSaved ? "Saved!" : "Save Business Info"}
          </button>
        </form>
      </section>

      {/* ── Bank Account ── */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400"/>
          <h3 className="text-white font-bold">Bank Transfer Details</h3>
        </div>
        <p className="text-gray-400 text-xs">These details are shown to customers who choose to pay by bank transfer.</p>
        <form onSubmit={saveBankInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Bank Name</label>
              <input value={bankForm.bankName} onChange={e=>setBankForm(f=>({...f,bankName:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="e.g. GTBank"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Account Number</label>
              <input value={bankForm.bankAccountNumber} onChange={e=>setBankForm(f=>({...f,bankAccountNumber:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-mono focus:outline-none focus:border-green-500" placeholder="0123456789"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Account Name</label>
              <input value={bankForm.bankAccountName} onChange={e=>setBankForm(f=>({...f,bankAccountName:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-green-500" placeholder="e.g. Spot-On Foods Ltd"/>
            </div>
          </div>
          <button type="submit" disabled={bankSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold disabled:opacity-60 transition-all">
            {bankSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : bankSaved ? <Check className="w-4 h-4 text-green-300"/> : <Save className="w-4 h-4"/>}
            {bankSaved ? "Saved!" : "Save Bank Details"}
          </button>
        </form>
      </section>

      {/* ── Expense Categories ── */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-400"/>
          <h3 className="text-white font-bold">Expense Categories</h3>
        </div>
        <p className="text-gray-400 text-xs">Customise the categories available when logging expenses. Drag to reorder.</p>

        <div className="space-y-2">
          {expCats.map((cat, idx) => (
            <div key={cat} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={()=>moveCat(idx,-1)} disabled={idx===0} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 leading-none text-xs">▲</button>
                <button type="button" onClick={()=>moveCat(idx,1)} disabled={idx===expCats.length-1} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 leading-none text-xs">▼</button>
              </div>
              <span className="flex-1 text-white capitalize text-sm">{cat}</span>
              <button type="button" onClick={()=>removeCat(cat)} className="p-1 rounded-lg hover:bg-red-900/30 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={newCat} onChange={e=>setNewCat(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCat())}
            placeholder="New category name..." className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          <button type="button" onClick={addCat} disabled={!newCat.trim()}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-green-400 hover:bg-white/20 disabled:opacity-40 text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4"/>Add
          </button>
        </div>

        <button onClick={saveExpCats} disabled={catSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold disabled:opacity-60 transition-all">
          {catSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : catSaved ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
          {catSaved ? "Saved!" : "Save Categories"}
        </button>
      </section>
    </div>
  );
}
