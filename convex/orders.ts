import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const statusValues = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("completed"),
  v.literal("cancelled")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("orders").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery")),
    deliveryAddress: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        emoji: v.string(),
      })
    ),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    const orderNumber = `SO-${Date.now().toString().slice(-6)}`;
    const now = Date.now();
    return ctx.db.insert("orders", {
      ...args,
      orderNumber,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: statusValues },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    const today = new Date().toDateString();
    const todayOrders = all.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );
    return {
      total: todayOrders.length,
      pending: todayOrders.filter((o) => o.status === "pending").length,
      active: todayOrders.filter((o) =>
        ["confirmed", "preparing", "ready"].includes(o.status)
      ).length,
      completed: todayOrders.filter((o) => o.status === "completed").length,
      revenue: todayOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.subtotal, 0),
    };
  },
});
