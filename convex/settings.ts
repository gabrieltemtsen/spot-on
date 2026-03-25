import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default settings
export const DEFAULTS: Record<string, string> = {
  businessName: "Spot-On",
  businessTagline: "Fresh Juices & Salads",
  businessAddress: "",
  businessPhone: "",
  receiptFooter: "Thank you! Come again 🙏",
  defaultDeliveryFee: "500",
  expenseCategories: JSON.stringify([
    "ingredients", "rent", "transport", "packaging",
    "staff", "utilities", "marketing", "misc"
  ]),
  // Bank transfer details shown to customers at checkout
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
};

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return row?.value ?? (DEFAULTS[key] ?? null);
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key, value });
    }
  },
});

export const setBulk = mutation({
  args: { entries: v.array(v.object({ key: v.string(), value: v.string() })) },
  handler: async (ctx, { entries }) => {
    for (const { key, value } of entries) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("settings", { key, value });
      }
    }
  },
});
