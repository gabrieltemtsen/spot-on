import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("customers").order("desc").collect();
  },
});

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const all = await ctx.db.query("customers").collect();
    const term = q.toLowerCase();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
  },
});

// Auto-upsert: called internally from orders.create
export const upsert = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    orderTotal: v.number(),
    orderItems: v.array(v.object({
      productId: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      emoji: v.string(),
    })),
  },
  handler: async (ctx, { name, phone, orderTotal, orderItems }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name, // update name in case it changed
        totalOrders: existing.totalOrders + 1,
        totalSpend: existing.totalSpend + orderTotal,
        lastOrderAt: now,
        lastOrderItems: orderItems,
      });
      return existing._id;
    } else {
      return ctx.db.insert("customers", {
        name,
        phone,
        totalOrders: 1,
        totalSpend: orderTotal,
        lastOrderAt: now,
        lastOrderItems: orderItems,
        tags: ["new"],
        createdAt: now,
      });
    }
  },
});

export const updateTags = mutation({
  args: { id: v.id("customers"), tags: v.array(v.string()) },
  handler: async (ctx, { id, tags }) => {
    await ctx.db.patch(id, { tags });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("customers"), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, { notes });
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

// Stats summary
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("customers").collect();
    const total = all.length;
    const totalSpend = all.reduce((s, c) => s + c.totalSpend, 0);
    const topSpender = all.reduce((top, c) => (!top || c.totalSpend > top.totalSpend ? c : top), null as typeof all[0] | null);
    const newThisMonth = all.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, totalSpend, topSpender, newThisMonth };
  },
});
