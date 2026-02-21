import { Product } from '@/types';

export interface Category {
    name: string;
    icon: string;
    bg?: string;
}

export const CATEGORIES: Category[] = [
    { name: 'Fruits & Vegetables', icon: '🥦', bg: 'bg-emerald-100 text-emerald-600' },
    { name: 'Dairy, Bread & Eggs', icon: '🍞', bg: 'bg-yellow-100 text-yellow-600' },
    { name: 'Atta, Rice, Oil & Dals', icon: '🌾', bg: 'bg-orange-100 text-orange-600' },
    { name: 'Meat, Fish & Eggs', icon: '🍗', bg: 'bg-red-100 text-red-600' },
    { name: 'Masala & Dry Fruits', icon: '🌶️', bg: 'bg-amber-100 text-amber-600' },
    { name: 'Breakfast & Sauces', icon: '🥣', bg: 'bg-blue-100 text-blue-600' },
    { name: 'Packaged Food', icon: '🥫', bg: 'bg-purple-100 text-purple-600' },
    { name: 'Tea, Coffee & More', icon: '☕', bg: 'bg-stone-100 text-stone-600' },
    { name: 'Ice Creams & More', icon: '🍦', bg: 'bg-pink-100 text-pink-600' },
    { name: 'Frozen Food', icon: '🧊', bg: 'bg-cyan-100 text-cyan-600' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Farm Fresh Tomato (Hybrid)', category: 'Fresh Vegetables', price: 24, discountPrice: 18, imageUrl: '🍅', inStock: true, unit: '500 g' },
    { id: 'p2', name: 'Red Onions', category: 'Fresh Vegetables', price: 40, discountPrice: 25, imageUrl: '🧅', inStock: true, unit: '1 kg' },
    { id: 'p3', name: 'Fresh Harvest Potato', category: 'Fresh Vegetables', price: 45, discountPrice: 30, imageUrl: '🥔', inStock: true, unit: '1 kg' },
    { id: 'p4', name: 'Amul Taaza Milk', category: 'Dairy & Bread', price: 25, discountPrice: 24, imageUrl: '🥛', inStock: true, unit: '500 ml' },
    { id: 'p5', name: 'Aashirvaad Shudh Chakki Atta', category: 'Atta, Rice & Dals', price: 295, discountPrice: 250, imageUrl: '🌾', inStock: true, unit: '5 kg' },
    { id: 'p6', name: 'Britannia Good Day Cashew', category: 'Snacks', price: 20, imageUrl: '🍪', inStock: true, unit: '60 g' },
    { id: 'p7', name: 'India Gate Jeera Rice | Short Grain', category: 'Atta, Rice & Dals', price: 267, discountPrice: 205, imageUrl: '🍚', inStock: true, unit: '1 kg' },
    { id: 'p8', name: 'Real Fruit Power Mixed Fruit', category: 'Breakfast & Sauces', price: 110, discountPrice: 95, imageUrl: '🧃', inStock: false, unit: '1 L' },
];

export const getProductById = (id: string): Product | undefined => {
    return MOCK_PRODUCTS.find(p => p.id === id);
};
