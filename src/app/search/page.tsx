"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const { items, addItem, updateQuantity } = useCartStore();
    const { products } = useProductStore();

    const filteredProducts = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(lowerQuery)
        );
    }, [query, products]);

    return (
        <div className="min-h-screen bg-white p-4 pb-24">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-inner group focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all">
                <span className="text-xl">🔍</span>
                <input
                    type="text"
                    placeholder="Search for 'Bread' or 'Milk'"
                    className="bg-transparent border-none outline-none w-full font-bold text-gray-900 placeholder:font-semibold placeholder:text-gray-500"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {query.trim() === '' ? (
                <div className="mt-8">
                    <h3 className="font-extrabold text-gray-900 mb-4 tracking-tight">Trending Searches</h3>
                    <div className="flex gap-2 flex-wrap">
                        {['Atta', 'Tomato', 'Onion', 'Lays', 'Milk', 'Eggs'].map(term => (
                            <button
                                key={term}
                                onClick={() => setQuery(term)}
                                className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    <h3 className="font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        Search Results
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">{filteredProducts.length} items</span>
                    </h3>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="font-bold text-gray-600">No products found for "{query}"</p>
                            <p className="text-xs font-semibold text-gray-500 mt-1">Try searching for something else!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {filteredProducts.map(product => {
                                const qty = items.find(i => i.id === product.id)?.quantity || 0;
                                return (
                                    <Link href={`/product/${product.id}`} key={product.id} className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-col gap-2 hover:shadow-md transition-shadow group">
                                        <div className="bg-gray-50 aspect-square rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform cursor-pointer">
                                            {product.imageUrl}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                                            <p className="text-[10px] font-bold text-gray-600 mt-0.5">{product.unit}</p>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="flex flex-col">
                                                {product.discountPrice ? (
                                                    <>
                                                        <span className="text-[10px] text-gray-500 line-through font-bold">₹{product.price}</span>
                                                        <span className="font-black text-sm text-gray-900 tracking-tight">₹{product.discountPrice}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-black text-sm text-gray-900 tracking-tight">₹{product.price}</span>
                                                )}
                                            </div>
                                            {qty === 0 ? (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); addItem(product); }}
                                                    className="bg-emerald-500 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm hover:bg-emerald-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            ) : (
                                                <div className="flex items-center bg-emerald-500 text-white rounded-lg h-7 overflow-hidden" onClick={(e) => e.preventDefault()}>
                                                    <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-6 h-full flex items-center justify-center font-bold">-</button>
                                                    <span className="w-5 text-center text-xs font-bold">{qty}</span>
                                                    <button onClick={() => updateQuantity(product.id, qty + 1)} className="w-6 h-full flex items-center justify-center font-bold">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
