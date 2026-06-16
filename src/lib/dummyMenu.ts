export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export const DUMMY_CATEGORIES = [
  "All",
  "Coffee",
  "Non Coffee",
  "Food",
  "Snack",
  "Dessert",
];

export const DUMMY_MENU: MenuItem[] = [
  // Coffee
  {
    id: "M001",
    name: "Espresso",
    category: "Coffee",
    price: 15000,
    stock: 50,
    image: "☕",
  },
  {
    id: "M002",
    name: "Americano",
    category: "Coffee",
    price: 20000,
    stock: 45,
    image: "☕",
  },
  {
    id: "M003",
    name: "Cappuccino",
    category: "Coffee",
    price: 25000,
    stock: 30,
    image: "☕",
  },
  {
    id: "M004",
    name: "Cafe Latte",
    category: "Coffee",
    price: 25000,
    stock: 30,
    image: "☕",
  },
  {
    id: "M005",
    name: "Kopi Kedai Loman Signature",
    category: "Coffee",
    price: 28000,
    stock: 20,
    image: "🧋",
  },

  // Non Coffee
  {
    id: "M101",
    name: "Matcha Latte",
    category: "Non Coffee",
    price: 28000,
    stock: 25,
    image: "🍵",
  },
  {
    id: "M102",
    name: "Taro Latte",
    category: "Non Coffee",
    price: 28000,
    stock: 15,
    image: "🥛",
  },
  {
    id: "M103",
    name: "Lychee Tea",
    category: "Non Coffee",
    price: 22000,
    stock: 40,
    image: "🍹",
  },
  {
    id: "M104",
    name: "Lemon Tea",
    category: "Non Coffee",
    price: 20000,
    stock: 50,
    image: "🍋",
  },

  // Food
  {
    id: "M201",
    name: "Nasi Goreng Spesial",
    category: "Food",
    price: 35000,
    stock: 20,
    image: "🍛",
  },
  {
    id: "M202",
    name: "Mie Goreng Jawa",
    category: "Food",
    price: 30000,
    stock: 15,
    image: "🍜",
  },
  {
    id: "M203",
    name: "Chicken Katsu Curry",
    category: "Food",
    price: 42000,
    stock: 10,
    image: "🍛",
  },

  // Snack
  {
    id: "M301",
    name: "French Fries",
    category: "Snack",
    price: 20000,
    stock: 30,
    image: "🍟",
  },
  {
    id: "M302",
    name: "Chicken Wings",
    category: "Snack",
    price: 32000,
    stock: 15,
    image: "🍗",
  },
  {
    id: "M303",
    name: "Snack Platter",
    category: "Snack",
    price: 45000,
    stock: 10,
    image: "🥟",
  },

  // Dessert
  {
    id: "M401",
    name: "Croissant",
    category: "Dessert",
    price: 22000,
    stock: 0,
    image: "🥐",
  }, // Out of stock
  {
    id: "M402",
    name: "Choco Lava Cake",
    category: "Dessert",
    price: 30000,
    stock: 8,
    image: "🧁",
  },
  {
    id: "M403",
    name: "Kaya Toast Premium",
    category: "Dessert",
    price: 25000,
    stock: 12,
    image: "🍞",
  },
];
