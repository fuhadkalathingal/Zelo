"use client";

import { useState } from 'react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 w-full h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
                    <p className="text-gray-500 font-medium">Manage your {MOCK_PRODUCTS.length} active inventory items.</p>
                </div>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <button className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
                                <th className="p-4 rounded-tl-3xl">Item Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Price</th>
                                <th className="p-4 rounded-tr-3xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((prod, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={prod.id}
                                    className="hover:bg-emerald-50/30 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 shadow-sm">{prod.imageUrl}</div>
                                            <div>
                                                <div className="font-extrabold text-sm text-gray-900">{prod.name}</div>
                                                <div className="text-[10px] font-bold text-gray-500 mt-0.5">{prod.unit}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                                            {prod.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {prod.inStock ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-black text-sm text-gray-900">₹{prod.discountPrice || prod.price}</div>
                                        {prod.discountPrice && <div className="text-[10px] font-bold text-gray-400 line-through">MRP ₹{prod.price}</div>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="font-bold text-gray-500">No products found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
