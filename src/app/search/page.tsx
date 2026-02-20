"use client";

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { PRODUCTS } from '@/lib/catalog';
import { Minus, Plus, Search } from 'lucide-react';

const TRENDING = ['Atta', 'Tomato', 'Onion', 'Lays', 'Milk', 'Eggs'];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const { items, addItem, updateQuantity } = useCartStore();

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return PRODUCTS;
        return PRODUCTS.filter((product) =>
            product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q),
        );
    }, [query]);

    const getQty = (id: string) => items.find((item) => item.id === id)?.quantity || 0;

    return (
        <div className="min-h-screen bg-white p-4 pb-24">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-inner">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search for bread, milk, tomato..."
                    className="bg-transparent border-none outline-none w-full font-semibold text-gray-700"
                    autoFocus
                />
            </div>

            <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Trending Searches</h3>
                <div className="flex gap-2 flex-wrap">
                    {TRENDING.map((term) => (
                        <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 cursor-pointer transition-colors"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {results.length === 0 ? (
                    <p className="text-sm text-gray-500">No products found for &quot;{query}&quot;.</p>
                ) : (
                    results.map((product) => {
                        const qty = getQty(product.id);
                        return (
                            <div key={product.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">{product.imageUrl}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.category} • {product.unit}</p>
                                    <p className="font-extrabold text-sm text-gray-900 mt-1">₹{product.discountPrice || product.price}</p>
                                </div>
                                {qty === 0 ? (
                                    <button onClick={() => addItem(product)} className="text-xs px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 font-bold">
                                        ADD
                                    </button>
                                ) : (
                                    <div className="flex items-center bg-emerald-500 text-white rounded-lg h-9 overflow-hidden">
                                        <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-8 h-full flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                                        <button onClick={() => updateQuantity(product.id, qty + 1)} className="w-8 h-full flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
