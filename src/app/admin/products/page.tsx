"use client";

import { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { CATEGORIES } from '@/lib/data';

export default function AdminProductsPage() {
    const { products, addProduct, updateProduct, deleteProduct, loading } = useProductStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0].name,
        price: '',
        discountPrice: '',
        imageUrl: '📦',
        unit: '1 pc',
        inStock: true
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: CATEGORIES[0].name, price: '', discountPrice: '', imageUrl: '📦', unit: '1 pc', inStock: true });
        setIsModalOpen(true);
    };

    const openEditModal = (prod: Product) => {
        setEditingProduct(prod);
        setFormData({
            name: prod.name,
            category: prod.category,
            price: prod.price.toString(),
            discountPrice: prod.discountPrice ? prod.discountPrice.toString() : '',
            imageUrl: prod.imageUrl,
            unit: prod.unit,
            inStock: prod.inStock
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteProduct(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
                imageUrl: formData.imageUrl,
                unit: formData.unit,
                inStock: formData.inStock
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await addProduct(payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Error saving product");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-10 w-full h-full relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
                    <p className="text-gray-500 font-medium">Manage your {products.length} active inventory items.</p>
                </div>
                <button onClick={openAddModal} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
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
                            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
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
                                                <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 shadow-sm">{prod.imageUrl}</div>
                                                <div>
                                                    <div className="font-extrabold text-sm text-gray-900">{prod.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 mt-0.5">{prod.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md whitespace-nowrap">
                                                {prod.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {prod.inStock ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 whitespace-nowrap">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 whitespace-nowrap">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-black text-sm text-gray-900">₹{prod.discountPrice || prod.price}</div>
                                            {prod.discountPrice && <div className="text-[10px] font-bold text-gray-400 line-through">MRP ₹{prod.price}</div>}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <button onClick={() => openEditModal(prod)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(prod.id, prod.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block ml-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="font-bold text-gray-500">No products found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xl font-black text-gray-900">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Product Name *</label>
                                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Category *</label>
                                        <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all">
                                            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Price (₹) *</label>
                                        <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Discount Price (₹)</label>
                                        <input type="number" min="0" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all" placeholder="Optional" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Icon/Emoji *</label>
                                        <input required type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Unit *</label>
                                        <input required type="text" placeholder="e.g. 1 kg, 500g" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all transition-all" />
                                    </div>
                                    <div className="col-span-2 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                                            <span className="font-bold text-sm text-gray-800">Product is In Stock</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:active:scale-100 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md">
                                        {isSubmitting ? 'Saving...' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
