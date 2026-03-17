import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    if (category && category !== "all") {
      return ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("category"), category))
        .collect();
    }
    return ctx.db.query("products").collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("juice"),
      v.literal("smoothie"),
      v.literal("salad"),
      v.literal("sandwich")
    ),
    description: v.string(),
    ingredients: v.array(v.string()),
    price: v.number(),
    costPrice: v.optional(v.number()),
    available: v.boolean(),
    emoji: v.string(),
    gradient: v.string(),
    badge: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("juice"),
        v.literal("smoothie"),
        v.literal("salad"),
        v.literal("sandwich")
      )
    ),
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    available: v.optional(v.boolean()),
    emoji: v.optional(v.string()),
    gradient: v.optional(v.string()),
    badge: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const toggleAvailable = mutation({
  args: { id: v.id("products"), available: v.boolean() },
  handler: async (ctx, { id, available }) => {
    await ctx.db.patch(id, { available });
  },
});

// Seed all menu items (run once from admin)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return { seeded: false, message: "Already seeded" };

    const items = [
      { name: "Zest of Life", category: "juice" as const, description: "Pure cold-pressed orange juice bursting with vitamin C.", ingredients: ["Orange"], price: 1500, emoji: "🍊", gradient: "from-orange-400 to-yellow-300", available: true },
      { name: "Pineapple Passion", category: "juice" as const, description: "Tropical pineapple freshness in every sip.", ingredients: ["Pineapple"], price: 1500, emoji: "🍍", gradient: "from-yellow-400 to-amber-300", available: true },
      { name: "Watermelon Coolness", category: "juice" as const, description: "Hydrating, refreshing watermelon — nature's sports drink.", ingredients: ["Watermelon"], price: 1500, emoji: "🍉", gradient: "from-red-400 to-pink-300", available: true },
      { name: "Tropical Twist", category: "juice" as const, description: "A fruity trio that takes your taste buds on vacation.", ingredients: ["Pineapple", "Watermelon", "Orange"], price: 1800, emoji: "🌴", gradient: "from-orange-500 to-yellow-400", badge: "Popular", available: true },
      { name: "Beet Whirlwind", category: "juice" as const, description: "Earthy beetroot meets sweet watermelon with a ginger kick.", ingredients: ["Beetroot", "Watermelon", "Ginger"], price: 2000, emoji: "🫚", gradient: "from-red-600 to-pink-500", available: true },
      { name: "Tangy Tamarind", category: "juice" as const, description: "Bold tamarind with warming cloves and ginger. Unique and addictive.", ingredients: ["Tamarind", "Cloves", "Ginger", "Sweetener"], price: 2000, emoji: "🌿", gradient: "from-amber-700 to-amber-500", available: true },
      { name: "The Buzz", category: "juice" as const, description: "Pure ginger shot — clean energy, no crash.", ingredients: ["Ginger", "Water", "Sweetener (Optional)"], price: 1500, emoji: "⚡", gradient: "from-yellow-500 to-lime-400", available: true },
      { name: "Exotic Fruit Blend", category: "juice" as const, description: "Six fruits, one glass. The ultimate nutrition bomb.", ingredients: ["Beetroot", "Carrot", "Apple", "Orange", "Pineapple", "Watermelon"], price: 2500, emoji: "🌈", gradient: "from-purple-500 to-orange-400", badge: "Best Value", available: true },
      { name: "Anti-Oxidant Elixir", category: "juice" as const, description: "Immune-boosting green blend for glow and vitality.", ingredients: ["Ginger", "Pineapple", "Cucumber", "Celery", "Lemon", "Green Leaf"], price: 2500, emoji: "💚", gradient: "from-green-500 to-lime-400", badge: "Immunity Boost", available: true },
      { name: "The Glow", category: "juice" as const, description: "Carrot-forward blend for radiant skin and sharp eyes.", ingredients: ["Carrot", "Orange", "Ginger", "Lemon"], price: 2000, emoji: "✨", gradient: "from-orange-400 to-amber-300", available: true },
      { name: "Cucumber Tropical Breeze", category: "juice" as const, description: "Cool cucumber meets sweet pineapple and crisp apple.", ingredients: ["Cucumber", "Pineapple", "Apple"], price: 1800, emoji: "🥒", gradient: "from-teal-400 to-green-300", available: true },
      { name: "Sunrise Smoothie", category: "smoothie" as const, description: "A morning blast of five tropical fruits. Thick, sweet, and filling.", ingredients: ["Watermelon", "Pineapple", "Banana", "Mango", "Pawpaw"], price: 2500, emoji: "🌅", gradient: "from-orange-400 to-pink-400", badge: "Best Seller", available: true },
      { name: "Creamy Delight", category: "smoothie" as const, description: "Yogurt base makes this ultra creamy and protein-rich.", ingredients: ["Yogurt", "Banana", "Mango", "Pawpaw", "Watermelon"], price: 2800, emoji: "🍦", gradient: "from-pink-400 to-rose-300", available: true },
      { name: "Green Goddess", category: "smoothie" as const, description: "The ultimate green smoothie — detox meets delicious.", ingredients: ["Ginger", "Pineapple", "Cucumber", "Green Leaf", "Banana", "Mango", "Pawpaw", "Celery"], price: 2800, emoji: "🌿", gradient: "from-green-500 to-emerald-400", badge: "Detox", available: true },
      { name: "Beet Bliss", category: "smoothie" as const, description: "Beetroot power meets tropical sweetness. Pre-workout perfection.", ingredients: ["Beetroot", "Watermelon", "Banana", "Mango", "Pawpaw"], price: 2500, emoji: "💜", gradient: "from-purple-600 to-pink-400", available: true },
      { name: "Parfait", category: "smoothie" as const, description: "Layered Greek yogurt, fresh seasonal fruits, and crunchy granola.", ingredients: ["Greek Yogurt", "Fruits", "Granola"], price: 3000, emoji: "🥣", gradient: "from-amber-400 to-yellow-300", badge: "Fan Favourite", available: true },
      { name: "Chopped Vegetable Salad", category: "salad" as const, description: "Hearty, fresh, and packed with protein. A full meal in a bowl.", ingredients: ["Lettuce", "Cucumber", "Carrots", "Apples", "Tomatoes", "Chicken Breast", "Eggs", "Baked Beans", "Sweet Corn"], price: 3500, emoji: "🥗", gradient: "from-green-500 to-lime-400", badge: "High Protein", available: true },
      { name: "Spot-On Caesar Salad", category: "salad" as const, description: "Our signature take on the classic Caesar — rich, crispy, and satisfying.", ingredients: ["Lettuce", "Croutons", "Cheese", "Cucumber", "Tomatoes", "Chicken / Beef"], price: 3500, emoji: "👑", gradient: "from-emerald-500 to-green-400", badge: "Signature", available: true },
      { name: "Spot-On Style Sandwich", category: "sandwich" as const, description: "Our house-made sandwich with today's freshest fillings. Ask for today's special.", ingredients: ["Fresh Bread", "House Fillings", "Chef's Choice"], price: 2500, emoji: "🥪", gradient: "from-amber-500 to-orange-400", badge: "Daily Special", available: true },
    ];

    for (const item of items) {
      await ctx.db.insert("products", item);
    }

    return { seeded: true, count: items.length };
  },
});
