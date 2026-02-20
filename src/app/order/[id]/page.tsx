"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Truck, ChevronLeft, PhoneCall } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// In a real app, you would fetch this order directly from Firebase using params.id
// But since the assignment requires instant feedback, I'll pull it from the user's cached orders.

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { user } = useAuthStore();

    // Find the current order from user's cache
    const currentOrder = user?.orders?.find(o => o.orderId === id);

    if (!user || !currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="font-bold text-gray-500">Locating your order...</p>
            </div>
        );
    }

    const STEPS = [
        { id: 1, title: 'Order Confirmed', icon: CheckCircle2, status: 'Completed', time: 'Just now' },
        { id: 2, title: 'Batch Processing', icon: Package, status: 'Active', time: 'Expected very soon' },
        { id: 3, title: 'Agent Assigned', icon: MapPin, status: 'Pending', time: 'Waiting for Agent' },
        { id: 4, title: 'Out for Delivery', icon: Truck, status: 'Pending', time: currentOrder.batchType },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-emerald-500 p-4 pt-6 md:p-6 sticky top-0 z-10 shadow-sm text-white rounded-b-3xl">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-emerald-600 rounded-full transition-colors bg-emerald-600/50">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-extrabold text-lg leading-none">Order Status</h1>
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">#{id}</span>
                    </div>
                </div>

                <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-lg border border-emerald-100 flex items-center justify-between mt-2">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Estimated Delivery</p>
                        <p className="text-xl font-black text-emerald-600 leading-none">{currentOrder.batchType}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <ClockIcon className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-6 mt-6">

                {/* Gamified Timeline */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        Tracking Details
                    </h3>

                    <div className="relative pl-6 space-y-8">
                        {/* Vertical Line */}
                        <div className="absolute left-[34px] top-2 bottom-6 w-0.5 bg-gray-100 -z-10"></div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "30%" }} // Partially filled based on status
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute left-[34px] top-2 w-0.5 bg-emerald-500 -z-10"
                        ></motion.div>

                        {STEPS.map((step, idx) => {
                            const isActive = step.status === 'Active';
                            const isCompleted = step.status === 'Completed';

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.2 }}
                                    className={`flex items-start gap-4 ${isCompleted || isActive ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : isActive ? 'bg-white border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' : 'bg-gray-100 border-white text-gray-400'}`}>
                                        <step.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <h4 className={`font-extrabold text-sm ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.title}</h4>
                                        <p className="text-xs font-semibold text-gray-500 mt-1">{step.time}</p>
                                    </div>
                                    {isActive && (
                                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded mt-2">In Progress</span>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Delivery Agent (Mock Pending) */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                    className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 flex items-center gap-4"
                >
                    <div className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-extrabold text-sm text-gray-900">Agent Details Pending</p>
                        <p className="text-xs font-semibold text-gray-500">Will be assigned shortly</p>
                    </div>
                    <button disabled className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <PhoneCall className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Order Summary Dropdown */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                        Items Ordered ({currentOrder.items.length})
                    </h3>
                    <div className="space-y-3">
                        {currentOrder.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl w-8 h-8 flex items-center justify-center">{item.imageUrl}</span>
                                    <div>
                                        <p className="font-bold text-xs text-gray-900">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 font-semibold">{item.unit} x {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-extrabold text-sm text-gray-900">₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button onClick={() => router.push('/')} className="text-emerald-600 font-extrabold text-sm uppercase tracking-widest hover:underline">
                        Continue Shopping
                    </button>
                </div>
            </main>
        </div>
    );
}

function ClockIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
