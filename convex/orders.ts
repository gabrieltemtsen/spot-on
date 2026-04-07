import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const statusValues = v.union(
  v.literal("pending"), v.literal("confirmed"), v.literal("preparing"),
  v.literal("ready"), v.literal("dispatched"), v.literal("completed"), v.literal("cancelled")
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("orders").order("desc").collect(),
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery"), v.literal("walkin")),
    deliveryAddress: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    items: v.array(v.object({ productId: v.string(), name: v.string(), price: v.number(), quantity: v.number(), emoji: v.string() })),
    subtotal: v.number(),
    deliveryFee: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("pending"))),
    paymentStatus: v.optional(v.union(v.literal("unpaid"), v.literal("awaiting_confirmation"), v.literal("confirmed"), v.literal("rejected"))),
    paymentBank: v.optional(v.string()),
    receiptStorageId: v.optional(v.string()),

    promoCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    discountDescription: v.optional(v.string()),

    source: v.optional(v.union(v.literal("web"), v.literal("walkin"))),
    processedBy: v.optional(v.string()),
    processedByName: v.optional(v.string()),
    status: v.optional(statusValues),
  },
  handler: async (ctx, args) => {
    const orderNumber = `SO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = Date.now();
    const discount = Math.max(0, args.discountAmount ?? 0);
    const total = Math.max(0, (args.subtotal ?? 0) + (args.deliveryFee ?? 0) - discount);
    const orderId = await ctx.db.insert("orders", {
      ...args,
      orderNumber,
      total,
      status: args.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Auto-upsert customer profile when a real phone number is given
    if (args.customerPhone && args.customerPhone !== "Walk-in" && args.customerPhone.trim() !== "") {
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", args.customerPhone))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: args.customerName,
          totalOrders: existing.totalOrders + 1,
          totalSpend: existing.totalSpend + total,
          lastOrderAt: now,
          lastOrderItems: args.items,
        });
      } else {
        await ctx.db.insert("customers", {
          name: args.customerName,
          phone: args.customerPhone,
          totalOrders: 1,
          totalSpend: total,
          lastOrderAt: now,
          lastOrderItems: args.items,
          tags: ["new"],
          createdAt: now,
        });
      }
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: statusValues },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) return;

    if (order.status !== status) {
      const total = (order.subtotal ?? 0) + (order.deliveryFee ?? 0);
      const customer = await ctx.db.query("customers").withIndex("by_phone", q => q.eq("phone", order.customerPhone)).first();

      if (customer) {
        if (status === "cancelled") {
          await ctx.db.patch(customer._id, {
            totalOrders: Math.max(0, customer.totalOrders - 1),
            totalSpend: Math.max(0, customer.totalSpend - total),
          });
        } else if (order.status === "cancelled") {
          await ctx.db.patch(customer._id, {
            totalOrders: customer.totalOrders + 1,
            totalSpend: customer.totalSpend + total,
          });
        }
      }
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      if (order.receiptStorageId) {
        try { await ctx.storage.delete(order.receiptStorageId); } catch { /**/ }
        await ctx.db.patch(id, { receiptStorageId: undefined });
      }
    }
    
    return ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const assignRider = mutation({
  args: { id: v.id("orders"), riderName: v.string(), riderPhone: v.string() },
  handler: async (ctx, { id, riderName, riderPhone }) =>
    ctx.db.patch(id, { riderName, riderPhone, updatedAt: Date.now() }),
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    const today = new Date().toDateString();
    const todayOrders = all.filter((o) => new Date(o.createdAt).toDateString() === today);
    const webOrders = todayOrders.filter((o) => o.source !== "walkin");
    const walkinOrders = todayOrders.filter((o) => o.source === "walkin");
    const revenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    const cashRevenue = todayOrders.filter((o) => o.status !== "cancelled" && o.paymentMethod === "cash").reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    const transferRevenue = todayOrders.filter((o) => o.status !== "cancelled" && o.paymentMethod === "transfer").reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    return {
      total: todayOrders.length,
      pending: todayOrders.filter((o) => o.status === "pending").length,
      active: todayOrders.filter((o) => ["confirmed", "preparing", "ready", "dispatched"].includes(o.status)).length,
      completed: todayOrders.filter((o) => o.status === "completed").length,
      revenue, cashRevenue, transferRevenue,
      webOrders: webOrders.length,
      walkinOrders: walkinOrders.length,
    };
  },
});

export const getEodReport = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, { date }) => {
    const all = await ctx.db.query("orders").collect();
    const target = date ?? new Date().toDateString();
    const dayOrders = all.filter((o) => new Date(o.createdAt).toDateString() === target);
    const completed = dayOrders.filter((o) => o.status !== "cancelled");
    const revenue = completed.reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    const cash = completed.filter((o) => o.paymentMethod === "cash").reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    const transfer = completed.filter((o) => o.paymentMethod === "transfer").reduce((s, o) => s + (o.total ?? o.subtotal), 0);
    return {
      date: target,
      totalOrders: dayOrders.length,
      completedOrders: completed.length,
      cancelledOrders: dayOrders.filter((o) => o.status === "cancelled").length,
      revenue, cash, transfer,
      webOrders: dayOrders.filter((o) => o.source !== "walkin").length,
      walkinOrders: dayOrders.filter((o) => o.source === "walkin").length,
      orders: dayOrders,
    };
  },
});

// WhatsApp notification via Meta Business Cloud API
export const notifyWhatsApp = action({
  args: {
    orderNumber: v.string(),
    customerName: v.string(),
    items: v.array(v.object({ name: v.string(), quantity: v.number(), price: v.number(), emoji: v.string() })),
    subtotal: v.number(),
    deliveryType: v.string(),
    deliveryAddress: v.optional(v.string()),
    customerPhone: v.string(),
  },
  handler: async (_ctx, args) => {
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE; // e.g. 2348012345678

    if (!waToken || !waPhoneId || !adminPhone) return { sent: false, reason: "WhatsApp not configured" };

    const itemsList = args.items.map((i) => `  ${i.emoji} ${i.name} ×${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`).join("\n");
    const message = `🍊 *New Spot-On Order!*\n\n*Order:* ${args.orderNumber}\n*Customer:* ${args.customerName}\n*Phone:* ${args.customerPhone}\n*Type:* ${args.deliveryType}\n${args.deliveryAddress ? `*Address:* ${args.deliveryAddress}\n` : ""}\n*Items:*\n${itemsList}\n\n*Total: ₦${args.subtotal.toLocaleString()}*`;

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${waToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone,
          type: "text",
          text: { body: message },
        }),
      });
      const data = await res.json();
      return { sent: res.ok, data };
    } catch (e) {
      return { sent: false, reason: String(e) };
    }
  },
});

// Convenience action: create order + send WhatsApp notification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createWithNotify: any = action({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery"), v.literal("walkin")),
    deliveryAddress: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    items: v.array(v.object({ productId: v.string(), name: v.string(), price: v.number(), quantity: v.number(), emoji: v.string() })),
    subtotal: v.number(),
    deliveryFee: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("pending"))),
    source: v.optional(v.union(v.literal("web"), v.literal("walkin"))),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.runMutation(api.orders.create, args);
    const order = await ctx.runQuery(api.orders.get, { id: orderId });
    if (order) {
      await ctx.runAction(api.orders.notifyWhatsApp, {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items: order.items,
        subtotal: order.subtotal,
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress,
      });
    }
    return orderId;
  },
});

// Generate a one-time upload URL for receipt screenshots
export const generateReceiptUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

// Save receipt storage ID to order
export const saveReceiptStorageId = mutation({
  args: { id: v.id("orders"), storageId: v.string() },
  handler: async (ctx, { id, storageId }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    // Delete old receipt if it exists
    if (order.receiptStorageId) {
      try { await ctx.storage.delete(order.receiptStorageId); } catch { /**/ }
    }
    await ctx.db.patch(id, {
      receiptStorageId: storageId,
      paymentStatus: "awaiting_confirmation",
      updatedAt: Date.now(),
    });
  },
});

// Get receipt image URL
export const getReceiptUrl = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order?.receiptStorageId) return null;
    return ctx.storage.getUrl(order.receiptStorageId);
  },
});

export const confirmPayment = mutation({
  args: {
    id: v.id("orders"),
    confirmedBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, confirmedBy }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    // Auto-delete receipt image after confirmation
    if (order.receiptStorageId) {
      try { await ctx.storage.delete(order.receiptStorageId); } catch { /**/ }
    }
    await ctx.db.patch(id, {
      paymentStatus: "confirmed",
      paymentConfirmedBy: confirmedBy ?? "admin",
      paymentConfirmedAt: Date.now(),
      receiptStorageId: undefined,
      status: order.status === "pending" ? "confirmed" : order.status,
      updatedAt: Date.now(),
    });
  },
});

export const rejectPayment = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    // Auto-delete receipt image on rejection too
    if (order.receiptStorageId) {
      try { await ctx.storage.delete(order.receiptStorageId); } catch { /**/ }
    }
    await ctx.db.patch(id, {
      paymentStatus: "rejected",
      receiptStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});
