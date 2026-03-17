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
  available: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // JUICES
  {
    id: "juice-1",
    name: "Zest of Life",
    category: "juice",
    description: "Pure, freshly squeezed orange goodness — bright, tangy and energising.",
    ingredients: ["Orange"],
    price: 1500,
    emoji: "🍊",
    gradient: "from-orange-400 to-yellow-300",
    available: true,
  },
  {
    id: "juice-2",
    name: "Pineapple Passion",
    category: "juice",
    description: "Tropical pineapple pressed fresh — sweet, zingy and refreshing.",
    ingredients: ["Pineapple"],
    price: 1500,
    emoji: "🍍",
    gradient: "from-yellow-400 to-amber-300",
    available: true,
  },
  {
    id: "juice-3",
    name: "Watermelon Coolness",
    category: "juice",
    description: "Nothing beats fresh watermelon juice on a hot day.",
    ingredients: ["Watermelon"],
    price: 1500,
    emoji: "🍉",
    gradient: "from-red-400 to-pink-300",
    available: true,
  },
  {
    id: "juice-4",
    name: "Tropical Twist",
    category: "juice",
    description: "A trio of tropical fruits blended into pure sunshine.",
    ingredients: ["Pineapple", "Watermelon", "Orange"],
    price: 1800,
    emoji: "🌴",
    gradient: "from-orange-400 to-pink-300",
    available: true,
  },
  {
    id: "juice-5",
    name: "Beet Whirlwind",
    category: "juice",
    description: "Earthy beetroot meets sweet watermelon with a ginger kick.",
    ingredients: ["Beetroot", "Watermelon", "Ginger"],
    price: 2000,
    emoji: "🟣",
    gradient: "from-purple-500 to-red-400",
    available: true,
  },
  {
    id: "juice-6",
    name: "Tangy Tamarind",
    category: "juice",
    description: "Traditional tamarind drink with a warm spiced twist.",
    ingredients: ["Tamarind", "Cloves", "Ginger", "Sweetener"],
    price: 2000,
    emoji: "🌿",
    gradient: "from-amber-600 to-yellow-500",
    available: true,
  },
  {
    id: "juice-7",
    name: "The Buzz",
    category: "juice",
    description: "Raw ginger water — clean, fiery and refreshingly simple.",
    ingredients: ["Ginger", "Water", "Sweetener (Optional)"],
    price: 1500,
    emoji: "⚡",
    gradient: "from-yellow-500 to-lime-400",
    available: true,
  },
  {
    id: "juice-8",
    name: "Exotic Fruit Blend",
    category: "juice",
    description: "Six fruits united — the ultimate rainbow juice experience.",
    ingredients: ["Beetroot", "Carrot", "Apple", "Orange", "Pineapple", "Watermelon"],
    price: 2500,
    emoji: "🌈",
    gradient: "from-purple-400 to-orange-300",
    available: true,
  },
  {
    id: "juice-9",
    name: "Anti-Oxidant Elixir",
    category: "juice",
    description: "Your daily defence shot — cleansing, green and powerful.",
    ingredients: ["Ginger", "Pineapple", "Cucumber", "Celery", "Lemon", "Green Leaf"],
    price: 2500,
    emoji: "💚",
    gradient: "from-green-500 to-emerald-400",
    available: true,
  },
  {
    id: "juice-10",
    name: "The Glow",
    category: "juice",
    description: "Skin-loving carrot and citrus blend with a ginger punch.",
    ingredients: ["Carrot", "Orange", "Ginger", "Lemon"],
    price: 2000,
    emoji: "✨",
    gradient: "from-orange-500 to-yellow-400",
    available: true,
  },
  {
    id: "juice-11",
    name: "Cucumber Tropical Breeze",
    category: "juice",
    description: "Cool cucumber meets tropical pineapple and crisp apple.",
    ingredients: ["Cucumber", "Pineapple", "Apple"],
    price: 1800,
    emoji: "🥒",
    gradient: "from-green-400 to-yellow-300",
    available: true,
  },

  // SMOOTHIES
  {
    id: "smoothie-1",
    name: "Sunrise Smoothie",
    category: "smoothie",
    description: "A tropical sunrise in a glass — thick, fruity and beautiful.",
    ingredients: ["Watermelon", "Pineapple", "Banana", "Mango", "Pawpaw"],
    price: 2500,
    emoji: "🌅",
    gradient: "from-orange-400 to-pink-400",
    available: true,
  },
  {
    id: "smoothie-2",
    name: "Creamy Delight",
    category: "smoothie",
    description: "Yogurt-based, thick and creamy with rich tropical fruits.",
    ingredients: ["Yogurt", "Banana", "Mango", "Pawpaw", "Watermelon"],
    price: 2800,
    emoji: "🍌",
    gradient: "from-yellow-400 to-orange-300",
    available: true,
  },
  {
    id: "smoothie-3",
    name: "Green Goddess",
    category: "smoothie",
    description: "The ultimate green smoothie — detoxing, filling and delicious.",
    ingredients: ["Ginger", "Pineapple", "Cucumber", "Green Leaf", "Banana", "Mango", "Pawpaw", "Celery"],
    price: 2800,
    emoji: "🌿",
    gradient: "from-emerald-500 to-green-400",
    available: true,
  },
  {
    id: "smoothie-4",
    name: "Beet Bliss",
    category: "smoothie",
    description: "Vibrant beetroot smoothie packed with tropical goodness.",
    ingredients: ["Beetroot", "Watermelon", "Banana", "Mango", "Pawpaw"],
    price: 2500,
    emoji: "💜",
    gradient: "from-purple-500 to-pink-400",
    available: true,
  },
  {
    id: "smoothie-5",
    name: "Parfait",
    category: "smoothie",
    description: "Layers of Greek yogurt, fresh fruits and crunchy granola.",
    ingredients: ["Greek Yogurt", "Fresh Fruits", "Granola"],
    price: 3000,
    emoji: "🥣",
    gradient: "from-pink-400 to-rose-300",
    available: true,
  },

  // SALADS
  {
    id: "salad-1",
    name: "Chopped Vegetable Salad",
    category: "salad",
    description: "A hearty, protein-packed salad loaded with fresh veggies.",
    ingredients: ["Lettuce", "Cucumber", "Carrots", "Apples", "Tomatoes", "Chicken Breast", "Eggs", "Baked Beans", "Sweet Corn"],
    price: 3500,
    emoji: "🥗",
    gradient: "from-green-500 to-lime-400",
    available: true,
  },
  {
    id: "salad-2",
    name: "Spot-On Caesar Salad",
    category: "salad",
    description: "Our take on the classic Caesar — crisp, cheesy and satisfying.",
    ingredients: ["Lettuce", "Croutons", "Cheese", "Cucumber", "Tomatoes", "Chicken / Beef"],
    price: 3500,
    emoji: "🫙",
    gradient: "from-lime-500 to-green-400",
    available: true,
  },

  // SANDWICHES
  {
    id: "sandwich-1",
    name: "Spot-On Style Sandwich",
    category: "sandwich",
    description: "Our signature house-made sandwich. Ask for today's special filling.",
    ingredients: ["Fresh Bread", "House Filling", "Ask for today's special"],
    price: 2500,
    emoji: "🥪",
    gradient: "from-amber-500 to-orange-400",
    available: true,
  },
];

export const CATEGORIES = [
  { key: "all", label: "All Items", emoji: "🍽️" },
  { key: "juice", label: "Juices", emoji: "🥤" },
  { key: "smoothie", label: "Smoothies", emoji: "🥛" },
  { key: "salad", label: "Salads", emoji: "🥗" },
  { key: "sandwich", label: "Sandwiches", emoji: "🥪" },
] as const;

export const formatPrice = (price: number) =>
  `₦${price.toLocaleString("en-NG")}`;
