"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft, MapPin, ArrowRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getCartTotal, clearCart } = useCartStore();
    const { user, setUser } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [batchInfo, setBatchInfo] = useState({ title: 'Lunch Batch', time: 'Today, 12:45 PM' });
    const [addressLoading, setAddressLoading] = useState(false);

    const total = getCartTotal();

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 11) {
            setBatchInfo({ title: 'Lunch Batch', time: 'Today, 12:45 PM' });
        } else if (currentHour < 17) {
            setBatchInfo({ title: 'Evening Batch', time: 'Today, 6:45 PM' });
        } else {
            setBatchInfo({ title: 'Tomorrow Morning', time: 'Tommorow, 8:45 AM' });
        }
    }, []);

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation || !user) return;

        setAddressLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        const userDocRef = doc(db, 'users', user.uid);
                        const updatedAddresses = [...(user.savedAddresses || [])];
                        if (updatedAddresses.length > 0) {
                            updatedAddresses[0].area = data.display_name;
                        } else {
                            // Fallback if somehow there's no address array
                            updatedAddresses.push({ id: 'addr-1', type: 'Home' as const, flat: '', area: data.display_name, landmark: '', pincode: '000000' });
                        }

                        const updatedProfile = { ...user, savedAddresses: updatedAddresses };
                        await setDoc(userDocRef, updatedProfile);
                        setUser(updatedProfile);
                    }
                } catch (error) {
                    console.error("Error", error);
                    alert("Location detection failed.");
                } finally {
                    setAddressLoading(false);
                }
            },
            () => {
                setAddressLoading(false);
                alert("Please enable location services to auto-detect.");
            }
        );
    };

    const handleConfirmOrder = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert("Order placed successfully! 🚀");
            clearCart();
            router.push('/');
        }, 1500);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Nothing to Checkout</h2>
                    <button onClick={() => router.push('/')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl mt-4">Go to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex flex-col">
                    <h1 className="font-extrabold text-lg text-gray-900 leading-none">Secure Checkout</h1>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Batched Delivery</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4 lg:py-8 lg:space-y-6">

                {/* Savings Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="bg-emerald-500 p-1.5 rounded-full shadow-sm text-white">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-extrabold text-emerald-800 tracking-tight">You are saving ₹60 on this order!</p>
                        <p className="text-xs font-semibold text-emerald-600/80">Batched delivery prices applied.</p>
                    </div>
                </div>

                {/* Delivery Slot Card */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-orange-500" /> Delivery Slot
                    </h3>
                    <div className="border border-orange-100 bg-orange-50/30 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                        <div>
                            <p className="font-extrabold text-sm text-gray-900 tracking-tight">{batchInfo.title}</p>
                            <p className="text-xs font-semibold text-gray-500">{batchInfo.time}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-extrabold px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-sm">LOCKED</span>
                    </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" /> Delivery Address
                        </h3>
                        <div className="flex gap-3">
                            <button onClick={handleAutoDetectLocation} disabled={addressLoading} className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-50">
                                {addressLoading ? 'Detecting...' : 'Auto Detect'}
                            </button>
                            <button className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap">Edit Manual</button>
                        </div>
                    </div>

                    {user?.savedAddresses?.[0] ? (
                        <p className="text-sm font-medium text-gray-700 p-4 border border-gray-100 rounded-xl bg-gray-50/50 leading-relaxed shadow-inner">
                            {user.savedAddresses[0].flat ? `${user.savedAddresses[0].flat}, ` : ''}{user.savedAddresses[0].area}
                            <br />
                            Contact: {user.phone}
                        </p>
                    ) : (
                        <p className="text-sm font-medium text-orange-600 p-4 border border-orange-100 rounded-xl bg-orange-50 mb-2">
                            Please verify your location to proceed.
                        </p>
                    )}
                </div>

                {/* Order Summary Small */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                        Order Summary ({items.length} items)
                    </h3>
                    <div className="space-y-3">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white border border-gray-100 w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm">{item.imageUrl}</div>
                                    <div>
                                        <p className="font-bold text-xs text-gray-900">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">{item.unit} x {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-extrabold text-sm text-gray-900">₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Pay Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 sm:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-center">
                <div className="max-w-3xl w-full flex gap-4 items-center">
                    <div className="flex flex-col border border-emerald-100 bg-emerald-50 rounded-xl px-4 py-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1"><ShieldCheck className="w-8 h-8 opacity-10 text-emerald-800" /></div>
                        <span className="text-[10px] text-emerald-700 font-extrabold tracking-widest uppercase">To Pay</span>
                        <span className="text-xl font-black text-emerald-900 text-left">₹{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-extrabold tracking-wide uppercase text-sm py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Processing Payment...' : 'Swipe to Pay'} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
