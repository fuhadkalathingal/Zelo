"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft, MapPin, X, Plus, Minus, ArrowRight, Receipt, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, getCartTotal, getItemCount } = useCartStore();
    const { user } = useAuthStore();
    const total = getCartTotal();
    const count = getItemCount();

    const handleProceedToCheckout = () => {
        if (!user) {
            router.push('/login?redirect=/checkout');
        } else {
            router.push('/checkout');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-32">
            {/* Mobile Header */}
            <div className="bg-white p-4 flex flex-col gap-2 sticky top-0 z-10 shadow-sm md:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Cart</h1>
                </div>
                {user ? (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                        <div className="bg-emerald-200 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-0.5">Delivering to Home</p>
                            <p className="text-sm font-medium leading-tight truncate">Flat 101, Prestige Towers, Indiranagar</p>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => router.push('/login')} className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
                        <div className="font-semibold text-sm">Login to see saved addresses</div>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-64 h-64 bg-gray-100 rounded-full mb-6 flex items-center justify-center relative">
                        <span className="text-6xl absolute transition-transform hover:scale-110">🛒</span>
                        <div className="absolute overflow-hidden w-full h-full rounded-full opacity-50 bg-gradient-to-tr from-transparent via-emerald-100 to-transparent mix-blend-overlay"></div>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-[250px]">Looks like you haven't added anything to your cart yet.</p>
                    <button onClick={() => router.push('/')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all active:scale-[0.98]">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="p-4 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Items */}
                    <div className="flex-1 space-y-4">
                        {/* Free Delivery / Batch Banner */}
                        <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-1.5 rounded-full shadow-sm text-lg">🎉</div>
                                <p className="text-sm font-bold text-emerald-800 tracking-tight">You are saving <span className="text-emerald-600">₹60</span> on this batch!</p>
                            </div>
                            <span className="bg-white text-[9px] text-emerald-600 font-extrabold px-2 py-1 uppercase tracking-widest rounded border border-emerald-100 shadow-sm">BATCH PRICE APPLIED</span>
                        </div>

                        {/* Neighbors Progress Card (Cashback) */}
                        <div className="bg-white border text-center border-orange-100 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 to-orange-500"></div>
                            <div className="flex justify-between items-center w-full">
                                <span className="text-xs font-bold text-orange-600 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Unlock ₹20 Cashback</span>
                                <span className="text-[10px] font-extrabold text-orange-400">65% Full</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-orange-50 rounded-full h-2 mb-1 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full w-[65%] transition-all"></div>
                            </div>

                            <button className="w-full border border-orange-200 text-orange-600 font-bold text-xs py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
                                Invite a Neighbor to speed up!
                            </button>
                        </div>

                        {/* Cart Items List */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden divide-y divide-gray-50 mt-6">
                            <div className="p-4 bg-gray-50/30 flex justify-between items-center border-b border-gray-100">
                                <h2 className="font-extrabold text-lg text-gray-900">My Cart</h2>
                                <span className="text-gray-500 text-sm font-medium">{count} items</span>
                            </div>
                            {items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl shrink-0 p-1 flex items-center justify-center flex-col relative overflow-hidden border border-gray-100">
                                        <span className="text-3xl z-10 block leading-none select-none">{item.imageUrl}</span>
                                        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-gray-200/50 to-transparent"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate text-sm">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">₹{item.discountPrice || item.price}</span>
                                            {item.discountPrice && (
                                                <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm shrink-0 h-9">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-full flex items-center justify-center text-emerald-600 hover:bg-white rounded transition-colors">
                                            {item.quantity === 1 ? <X className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                        </button>
                                        <span className="w-6 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-full flex items-center justify-center text-emerald-600 hover:bg-white rounded transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Checkout details */}
                    <div className="w-full lg:w-[400px] shrink-0 space-y-4">
                        {/* Bill Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Receipt className="w-4 h-4" /> Bill Details
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Item Total</span>
                                    <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className="font-medium">{total >= 199 ? <span className="text-emerald-500 font-bold">FREE</span> : '₹29.00'}</span>
                                </div>
                                {total >= 199 && (
                                    <div className="flex justify-between text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                                        <span>Delivery Fee Waived Off</span>
                                        <span className="font-bold">-₹29.00</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Handling Charge</span>
                                    <span className="font-medium text-gray-900">₹4.00</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 mt-2 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>To Pay</span>
                                    <span>₹{(total + (total >= 199 ? 0 : 29) + 4).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Desktop Checkout Button */}
                            <button
                                onClick={handleProceedToCheckout}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold tracking-wide uppercase text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                Proceed to Pay <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Checkout Bottom Bar */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 sm:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-center lg:hidden">
                    <div className="max-w-xl w-full flex gap-4 items-center pl-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Total</span>
                            <span className="text-xl font-extrabold text-gray-900 text-left">₹{(total + (total >= 199 ? 0 : 29) + 4).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleProceedToCheckout}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ml-auto"
                        >
                            Confirm & Pay <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
