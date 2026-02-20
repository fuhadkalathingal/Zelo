import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Farm Fresh Tomato (Hybrid)', category: 'Fresh Vegetables', price: 24, discountPrice: 18, imageUrl: '🍅', inStock: true, unit: '500 g' },
  { id: 'p2', name: 'Red Onions', category: 'Fresh Vegetables', price: 40, discountPrice: 25, imageUrl: '🧅', inStock: true, unit: '1 kg' },
  { id: 'p3', name: 'Fresh Harvest Potato', category: 'Fresh Vegetables', price: 45, discountPrice: 30, imageUrl: '🥔', inStock: true, unit: '1 kg' },
  { id: 'p4', name: 'Amul Taaza Milk', category: 'Dairy & Bread', price: 25, discountPrice: 24, imageUrl: '🥛', inStock: true, unit: '500 ml' },
  { id: 'p5', name: 'Aashirvaad Shudh Chakki Atta', category: 'Atta, Rice & Dals', price: 295, discountPrice: 250, imageUrl: '🌾', inStock: true, unit: '5 kg' },
  { id: 'p6', name: 'Britannia Good Day Cashew', category: 'Snacks', price: 20, imageUrl: '🍪', inStock: true, unit: '60 g' },
  { id: 'p7', name: 'Fresh Apple', category: 'Fruits', price: 110, discountPrice: 95, imageUrl: '🍎', inStock: true, unit: '1 kg' },
  { id: 'p8', name: 'Lays Classic Salted', category: 'Snacks', price: 20, imageUrl: '🥔', inStock: true, unit: '52 g' },
  { id: 'p9', name: 'Eggs', category: 'Dairy & Bread', price: 72, imageUrl: '🥚', inStock: true, unit: '6 pcs' },
];

export const CATEGORIES = [
  { name: 'Fresh Vegetables', icon: '🥦', bg: 'bg-emerald-50' },
  { name: 'Fruits', icon: '🍎', bg: 'bg-red-50' },
  { name: 'Dairy & Bread', icon: '🥛', bg: 'bg-yellow-50' },
  { name: 'Snacks', icon: '🍪', bg: 'bg-orange-50' },
  { name: 'Atta, Rice & Dals', icon: '🌾', bg: 'bg-amber-50' },
];
