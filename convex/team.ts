import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("teamMembers").collect(),
});

export const verifyPin = query({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const member = await ctx.db.query("teamMembers").withIndex("by_pin", (q) => q.eq("pin", pin)).first();
    if (!member || !member.active) return null;
    return member;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
    role: v.union(v.literal("admin"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("teamMembers").withIndex("by_pin", (q) => q.eq("pin", args.pin)).first();
    if (existing) throw new Error("PIN already in use");
    return ctx.db.insert("teamMembers", { ...args, active: true, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("teamMembers"),
    name: v.optional(v.string()),
    pin: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("cashier"))),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => ctx.db.patch(id, fields),
});

export const remove = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

export const seedOwner = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("teamMembers").first();
    if (existing) return { seeded: false };
    await ctx.db.insert("teamMembers", { name: "Owner", pin: "123400", role: "admin", active: true, createdAt: Date.now() });
    return { seeded: true };
  },
});
