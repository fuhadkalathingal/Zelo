"use client";

import { useMemo, useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { Minus, Plus } from 'lucide-react';

export default function CategoriesPage() {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].name);
    const { items, addItem, updateQuantity } = useCartStore();
    const { products, loading } = useProductStore();

    const filteredProducts = useMemo(
        () => products.filter((product) => product.category === activeCategory),
        [activeCategory, products],
    );

    const getQty = (id: string) => items.find((item) => item.id === id)?.quantity || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-4 mt-4">All Categories</h1>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
                    {CATEGORIES.map((cat) => (
                        <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className="flex flex-col items-center gap-2">
                            <div className={`w-full aspect-square rounded-2xl ${cat.bg || 'bg-gray-100 text-gray-600'} border ${activeCategory === cat.name ? 'border-emerald-400' : 'border-white'} shadow-sm flex items-center justify-center text-4xl`}>
                                {cat.icon}
                            </div>
                            <span className={`text-xs font-bold text-center leading-tight ${activeCategory === cat.name ? 'text-emerald-700' : 'text-gray-700'}`}>{cat.name}</span>
                        </button>
                    ))}
                </div>

                <h2 className="font-bold text-gray-900 mb-3">{activeCategory}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map((product) => {
                        const qty = getQty(product.id);
                        return (
                            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">{product.imageUrl}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-600">{product.unit}</p>
                                    <p className="font-extrabold text-sm text-gray-900 mt-1">₹{product.discountPrice || product.price}</p>
                                </div>
                                {qty === 0 ? (
                                    <button onClick={() => addItem(product)} className="text-xs px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 font-bold">ADD</button>
                                ) : (
                                    <div className="flex items-center bg-emerald-500 text-white rounded-lg h-9 overflow-hidden">
                                        <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-8 h-full flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                                        <button onClick={() => updateQuantity(product.id, qty + 1)} className="w-8 h-full flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
