"use client";

import { use, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { notFound, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { ChevronLeft, Share2, Tag, Info, ChevronRight, Plus, Minus, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProductImage from '@/components/ui/ProductImage';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Resolve params promise
    const { id } = use(params);
    const { products, loading } = useProductStore();
    const product = products.find(p => p.id === id);

    const { items, addItem, updateQuantity } = useCartStore();
    const qty = items.find(i => i.id === product?.id)?.quantity || 0;

    const [activeAccordion, setActiveAccordion] = useState<string | null>('offers');

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
    if (!product) return notFound();

    const discountPercentage = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;
    const finalPrice = product.discountPrice || product.price;

    return (
        <div className="min-h-screen bg-gray-50 pb-28 md:pb-10">
            {/* Mobile Top Header */}
            <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-200 md:hidden">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                        <Search className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto md:p-6 md:grid md:grid-cols-2 md:gap-8 lg:gap-12 md:mt-8">

                {/* Left Column: Image Gallery (Mobile top) */}
                <div className="bg-white md:rounded-3xl md:border md:border-gray-200 md:p-8 flex items-center justify-center p-12 py-20 relative overflow-hidden group">
                    {/* Background Blob */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-gray-50/50 -z-10"
                    />

                    {discountPercentage && (
                        <motion.div
                            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm tracking-wider z-10"
                        >
                            {discountPercentage}% OFF
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ y: 20, scale: 0.9, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-[260px] md:h-[340px] flex items-center justify-center"
                    >
                        <ProductImage imageUrl={product.imageUrl} alt={product.name} className="w-full h-full object-contain" emojiClassName="text-[180px] md:text-[250px] drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                    </motion.div>
                </div>

                {/* Right Column: Details */}
                <div className="p-5 md:p-0 space-y-6">
                    {/* Title & Brand */}
                    <div className="space-y-2">
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            Zelo Fresh <ChevronRight className="w-3 h-3" />
                        </motion.p>
                        <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                            {product.name}
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-bold text-gray-600 bg-gray-100 w-fit px-3 py-1 rounded-md">
                            Net Wt: {product.unit}
                        </motion.p>
                    </div>

                    {/* Price Block Zepto Style */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
                        <div className="flex flex-col gap-1">
                            {product.discountPrice ? (
                                <>
                                    <div className="flex items-end gap-3">
                                        <span className="text-3xl font-black text-emerald-700 tracking-tight">₹{product.discountPrice}</span>
                                        <div className="flex flex-col pb-1">
                                            <span className="text-xs text-gray-500 font-bold line-through">MRP ₹{product.price}</span>
                                            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Save ₹{product.price - product.discountPrice}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-semibold">(Inclusive of all taxes)</p>
                                </>
                            ) : (
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">₹{product.price}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg"><Tag className="w-4 h-4" /></span>
                                <span className="text-xs font-extrabold text-gray-700">Get at ₹{Math.max(1, finalPrice - 20)} with bank offers</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                    </motion.div>

                    {/* Why Zelo Trust Badges */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                            <span className="text-xl">🛵</span>
                            <span className="text-[10px] font-extrabold text-emerald-800 leading-tight">Batched<br />Delivery</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                            <span className="text-xl">💯</span>
                            <span className="text-[10px] font-extrabold text-blue-800 leading-tight">Premium<br />Quality</span>
                        </div>
                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                            <span className="text-xl">↩️</span>
                            <span className="text-[10px] font-extrabold text-purple-800 leading-tight">Easy<br />Returns</span>
                        </div>
                    </motion.div>

                    {/* Accordions */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {[
                            { id: 'offers', title: 'Coupons & Offers', icon: Tag, content: 'Get 10% off with VISA Canara Credit Cards. Get assured cashback upto ₹25 with BHIM.' },
                            { id: 'desc', title: 'Product Details', icon: Info, content: 'Freshly sourced daily from local farms. Handpicked and double-checked for supreme quality before delivery.' },
                        ].map((section) => (
                            <div key={section.id} className="border-b border-gray-200 last:border-0">
                                <button
                                    onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)}
                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                                        <section.icon className="w-4 h-4 text-emerald-500" /> {section.title}
                                    </h3>
                                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${activeAccordion === section.id ? 'rotate-90' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {activeAccordion === section.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-gray-50/50"
                                        >
                                            <p className="p-4 pt-0 text-xs font-semibold text-gray-600 leading-relaxed">
                                                {section.content}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>

                    {/* Desktop Add to Cart */}
                    <div className="hidden md:block pt-6">
                        {qty === 0 ? (
                            <button onClick={() => addItem(product)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-[0.98]">
                                Add to Cart
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-emerald-500 text-white rounded-xl shadow-md h-14 w-40 overflow-hidden border border-emerald-600">
                                    <button onClick={() => updateQuantity(product.id, qty - 1)} className="flex-1 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                        <Minus className="w-5 h-5" strokeWidth={3} />
                                    </button>
                                    <span className="w-10 text-center font-black text-lg">{qty}</span>
                                    <button onClick={() => updateQuantity(product.id, qty + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                        <Plus className="w-5 h-5" strokeWidth={3} />
                                    </button>
                                </div>
                                <Link href="/checkout" className="flex-1 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2">
                                    Checkout <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sticky Mobile Add To Cart Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40 md:hidden animate-in slide-in-from-bottom-5">
                {qty === 0 ? (
                    <button onClick={() => addItem(product)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-[0.98]">
                        Add to Cart
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-emerald-500 text-white rounded-xl shadow-md h-14 flex-1 overflow-hidden border border-emerald-600">
                            <button onClick={() => updateQuantity(product.id, qty - 1)} className="flex-1 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                <Minus className="w-5 h-5" strokeWidth={3} />
                            </button>
                            <span className="w-8 text-center font-black text-lg">{qty}</span>
                            <button onClick={() => updateQuantity(product.id, qty + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                <Plus className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </div>
                        <Link href="/checkout" className="flex-1 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5 h-14">
                            Checkout <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
