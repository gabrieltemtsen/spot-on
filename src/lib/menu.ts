export type Category = "juice" | "smoothie" | "salad" | "sandwich";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  ingredients: string[];
  price: number;
  emoji: string;
  gradient: string;
  badge?: string;
}

export const MENU: MenuItem[] = [
  // JUICES
  {
    id: "j1", name: "Zest of Life", category: "juice",
    description: "Pure cold-pressed orange juice bursting with vitamin C.",
    ingredients: ["Orange"],
    price: 1500, emoji: "🍊",
    gradient: "from-orange-400 to-yellow-300",
  },
  {
    id: "j2", name: "Pineapple Passion", category: "juice",
    description: "Tropical pineapple freshness in every sip.",
    ingredients: ["Pineapple"],
    price: 1500, emoji: "🍍",
    gradient: "from-yellow-400 to-amber-300",
  },
  {
    id: "j3", name: "Watermelon Coolness", category: "juice",
    description: "Hydrating, refreshing watermelon — nature's sports drink.",
    ingredients: ["Watermelon"],
    price: 1500, emoji: "🍉",
    gradient: "from-red-400 to-pink-300",
  },
  {
    id: "j4", name: "Tropical Twist", category: "juice",
    description: "A fruity trio that takes your taste buds on vacation.",
    ingredients: ["Pineapple", "Watermelon", "Orange"],
    price: 1800, emoji: "🌴",
    gradient: "from-orange-500 to-yellow-400",
    badge: "Popular",
  },
  {
    id: "j5", name: "Beet Whirlwind", category: "juice",
    description: "Earthy beetroot meets sweet watermelon with a ginger kick.",
    ingredients: ["Beetroot", "Watermelon", "Ginger"],
    price: 2000, emoji: "🫚",
    gradient: "from-red-600 to-pink-500",
  },
  {
    id: "j6", name: "Tangy Tamarind", category: "juice",
    description: "Bold tamarind with warming cloves and ginger. Unique and addictive.",
    ingredients: ["Tamarind", "Cloves", "Ginger", "Sweetener"],
    price: 2000, emoji: "🌿",
    gradient: "from-amber-700 to-amber-500",
  },
  {
    id: "j7", name: "The Buzz", category: "juice",
    description: "Pure ginger shot — clean energy, no crash.",
    ingredients: ["Ginger", "Water", "Sweetener (Optional)"],
    price: 1500, emoji: "⚡",
    gradient: "from-yellow-500 to-lime-400",
  },
  {
    id: "j8", name: "Exotic Fruit Blend", category: "juice",
    description: "Six fruits, one glass. The ultimate nutrition bomb.",
    ingredients: ["Beetroot", "Carrot", "Apple", "Orange", "Pineapple", "Watermelon"],
    price: 2500, emoji: "🌈",
    gradient: "from-purple-500 to-orange-400",
    badge: "Best Value",
  },
  {
    id: "j9", name: "Anti-Oxidant Elixir", category: "juice",
    description: "Immune-boosting green blend for glow and vitality.",
    ingredients: ["Ginger", "Pineapple", "Cucumber", "Celery", "Lemon", "Green Leaf"],
    price: 2500, emoji: "💚",
    gradient: "from-green-500 to-lime-400",
    badge: "Immunity Boost",
  },
  {
    id: "j10", name: "The Glow", category: "juice",
    description: "Carrot-forward blend for radiant skin and sharp eyes.",
    ingredients: ["Carrot", "Orange", "Ginger", "Lemon"],
    price: 2000, emoji: "✨",
    gradient: "from-orange-400 to-amber-300",
  },
  {
    id: "j11", name: "Cucumber Tropical Breeze", category: "juice",
    description: "Cool cucumber meets sweet pineapple and crisp apple.",
    ingredients: ["Cucumber", "Pineapple", "Apple"],
    price: 1800, emoji: "🥒",
    gradient: "from-teal-400 to-green-300",
  },

  // SMOOTHIES
  {
    id: "s1", name: "Sunrise Smoothie", category: "smoothie",
    description: "A morning blast of five tropical fruits. Thick, sweet, and filling.",
    ingredients: ["Watermelon", "Pineapple", "Banana", "Mango", "Pawpaw"],
    price: 2500, emoji: "🌅",
    gradient: "from-orange-400 to-pink-400",
    badge: "Best Seller",
  },
  {
    id: "s2", name: "Creamy Delight", category: "smoothie",
    description: "Yogurt base makes this ultra creamy and protein-rich.",
    ingredients: ["Yogurt", "Banana", "Mango", "Pawpaw", "Watermelon"],
    price: 2800, emoji: "🍦",
    gradient: "from-pink-400 to-rose-300",
  },
  {
    id: "s3", name: "Green Goddess", category: "smoothie",
    description: "The ultimate green smoothie — detox meets delicious.",
    ingredients: ["Ginger", "Pineapple", "Cucumber", "Green Leaf", "Banana", "Mango", "Pawpaw", "Celery"],
    price: 2800, emoji: "🌿",
    gradient: "from-green-500 to-emerald-400",
    badge: "Detox",
  },
  {
    id: "s4", name: "Beet Bliss", category: "smoothie",
    description: "Beetroot power meets tropical sweetness. Pre-workout perfection.",
    ingredients: ["Beetroot", "Watermelon", "Banana", "Mango", "Pawpaw"],
    price: 2500, emoji: "💜",
    gradient: "from-purple-600 to-pink-400",
  },
  {
    id: "s5", name: "Parfait", category: "smoothie",
    description: "Layered Greek yogurt, fresh seasonal fruits, and crunchy granola.",
    ingredients: ["Greek Yogurt", "Fruits", "Granola"],
    price: 3000, emoji: "🥣",
    gradient: "from-amber-400 to-yellow-300",
    badge: "Fan Favourite",
  },

  // SALADS
  {
    id: "sa1", name: "Chopped Vegetable Salad", category: "salad",
    description: "Hearty, fresh, and packed with protein. A full meal in a bowl.",
    ingredients: ["Lettuce", "Cucumber", "Carrots", "Apples", "Tomatoes", "Chicken Breast", "Eggs", "Baked Beans", "Sweet Corn"],
    price: 3500, emoji: "🥗",
    gradient: "from-green-500 to-lime-400",
    badge: "High Protein",
  },
  {
    id: "sa2", name: "Spot-On Caesar Salad", category: "salad",
    description: "Our signature take on the classic Caesar — rich, crispy, and satisfying.",
    ingredients: ["Lettuce", "Croutons", "Cheese", "Cucumber", "Tomatoes", "Chicken / Beef"],
    price: 3500, emoji: "👑",
    gradient: "from-emerald-500 to-green-400",
    badge: "Signature",
  },

  // SANDWICHES
  {
    id: "sw1", name: "Spot-On Style Sandwich", category: "sandwich",
    description: "Our house-made sandwich with today's freshest fillings. Ask for today's special.",
    ingredients: ["Fresh Bread", "House Fillings", "Chef's Choice"],
    price: 2500, emoji: "🥪",
    gradient: "from-amber-500 to-orange-400",
    badge: "Daily Special",
  },
];

export const CATEGORIES = [
  { key: "all", label: "All", emoji: "🍃" },
  { key: "juice", label: "Juices", emoji: "🍊" },
  { key: "smoothie", label: "Smoothies", emoji: "🥤" },
  { key: "salad", label: "Salads", emoji: "🥗" },
  { key: "sandwich", label: "Sandwiches", emoji: "🥪" },
] as const;

export function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`;
}
