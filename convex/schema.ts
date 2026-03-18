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
    costPrice: v.optional(v.number()), // cost of goods for margin tracking
    available: v.boolean(),
    emoji: v.string(),
    gradient: v.string(),
    badge: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    imageStorageId: v.optional(v.string()), // Convex storage ID for product image
  })
    .index("by_category", ["category"])
    .index("by_available", ["available"]),

  orders: defineTable({
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery"), v.literal("walkin")),
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
    deliveryFee: v.optional(v.number()),
    total: v.optional(v.number()), // subtotal + deliveryFee
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("pending"))),
    source: v.optional(v.union(v.literal("web"), v.literal("walkin"))),
    processedBy: v.optional(v.string()), // team member id
    processedByName: v.optional(v.string()),
    riderName: v.optional(v.string()),
    riderPhone: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("dispatched"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_source", ["source"]),

  expenses: defineTable({
    date: v.string(), // YYYY-MM-DD
    category: v.string(), // flexible — customisable via Settings
    amount: v.number(),
    note: v.optional(v.string()),
    addedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  teamMembers: defineTable({
    name: v.string(),
    pin: v.string(), // 4-digit PIN (stored as string)
    role: v.union(v.literal("admin"), v.literal("cashier")),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_pin", ["pin"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
