import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, { date }) => {
    if (date) {
      return ctx.db.query("expenses").withIndex("by_date", (q) => q.eq("date", date)).collect();
    }
    return ctx.db.query("expenses").order("desc").collect();
  },
});

export const listByRange = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    const all = await ctx.db.query("expenses").collect();
    return all.filter((e) => e.date >= from && e.date <= to);
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    category: v.string(), // flexible — customisable via Settings
    amount: v.number(),
    note: v.optional(v.string()),
    addedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("expenses", { ...args, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

export const getDailySummary = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const expenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.eq("date", date)).collect();
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount; });
    return { total, byCategory, expenses };
  },
});
