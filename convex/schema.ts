import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
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
    available: v.boolean(),
    emoji: v.string(),
    gradient: v.string(),
    badge: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_available", ["available"]),

  orders: defineTable({
    orderNumber: v.string(),
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
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),
});
