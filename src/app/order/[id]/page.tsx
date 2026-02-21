"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Truck, ChevronLeft, PhoneCall, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAgentStore } from '@/store/useAgentStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import ProductImage from '@/components/ui/ProductImage';

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { user } = useAuthStore();

    const liveOrder = useOrderStore(s => s.orders.find(o => o.orderId === id));
    const [fallbackOrder, setFallbackOrder] = useState<Order | null>(null);
    const [isCheckingOrder, setIsCheckingOrder] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const loadOrder = async () => {
            if (liveOrder) {
                setIsCheckingOrder(false);
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'orders', id));
                if (!cancelled) {
                    setFallbackOrder(snap.exists() ? ({ ...snap.data(), orderId: snap.id } as Order) : null);
                }
            } finally {
                if (!cancelled) setIsCheckingOrder(false);
            }
        };
        loadOrder();
        return () => {
            cancelled = true;
        };
    }, [id, liveOrder]);

    const currentOrder = liveOrder || fallbackOrder;
    const assignedAgent = useAgentStore(s => s.agents.find(a => a.agentId === currentOrder?.assignedAgentId));

    if (!user || isCheckingOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="font-bold text-gray-600">Locating your order live...</p>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 px-6 text-center">
                <h1 className="text-xl font-black text-gray-900">Order not found</h1>
                <p className="font-semibold text-gray-600">We couldn&apos;t find this order. It may take a moment to appear after checkout.</p>
                <button onClick={() => router.push('/orders')} className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold">Go to Orders</button>
            </div>
        );
    }

    const getStatusIndex = () => {
        switch (currentOrder.status) {
            case 'Placed': return 0;
            case 'Batch Processing': return 1;
            case 'Out for Delivery': return 2;
            case 'Delivered': return 3;
            default: return 0;
        }
    };
    const currentStatusIndex = getStatusIndex();

    const STEPS = [
        { id: 1, title: 'Order Confirmed', icon: CheckCircle2, status: currentStatusIndex >= 0 ? 'Completed' : 'Pending', time: new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: 2, title: 'Batch Processing', icon: Package, status: currentStatusIndex >= 1 ? 'Completed' : 'Pending', time: currentOrder.batchType },
        { id: 3, title: 'Out for Delivery', icon: Truck, status: currentStatusIndex >= 2 ? 'Completed' : 'Pending', time: assignedAgent ? 'Assigned to ' + assignedAgent.name : 'Waiting for Agent' },
        { id: 4, title: 'Delivered', icon: MapPin, status: currentStatusIndex >= 3 ? 'Completed' : 'Pending', time: currentOrder.deliveredAt ? new Date(currentOrder.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className={`p-4 pt-6 md:p-6 sticky top-0 z-10 shadow-sm text-white rounded-b-3xl transition-colors duration-500 ${currentOrder.status === 'Delivered' ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors bg-black/10">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-extrabold text-lg leading-none">Order Status</h1>
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">#{id}</span>
                    </div>
                </div>

                <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-lg border border-emerald-100 flex items-center justify-between mt-2">
                    <div>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">State</p>
                        <p className="text-xl font-black text-emerald-600 leading-none">{currentOrder.status}</p>
                    </div>
                    {currentOrder.status === 'Delivered' ? (
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-6 mt-6">
                {currentOrder.status === 'Out for Delivery' && currentOrder.deliveryPin && (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-indigo-600 rounded-3xl p-6 shadow-xl text-white text-center relative overflow-hidden">
                        <KeyRound className="w-8 h-8 text-indigo-200 mx-auto mb-3" />
                        <h3 className="font-extrabold text-sm uppercase tracking-widest text-indigo-100 mb-2">Delivery Secure PIN</h3>
                        <div className="font-black text-5xl tracking-[0.25em] pl-[0.25em]">{currentOrder.deliveryPin}</div>
                    </motion.div>
                )}

                {assignedAgent && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                        <div>
                            <p className="font-extrabold text-sm text-gray-900">{assignedAgent.name}</p>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Zelo Delivery Partner</p>
                            <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">{assignedAgent.vehicleNo}</p>
                        </div>
                        <a href={`tel:${assignedAgent.phone}`} className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <PhoneCall className="w-4 h-4" />
                        </a>
                    </motion.div>
                )}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <div className="relative pl-4 space-y-8">
                        <div className="absolute left-[31px] top-4 bottom-8 w-1 bg-gray-200 rounded-full z-0"></div>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(currentStatusIndex / 3) * 100}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute left-[31px] top-4 w-1 bg-emerald-500 rounded-full z-0"></motion.div>
                        {STEPS.map((step, idx) => {
                            const isCompleted = step.status === 'Completed';
                            const isActive = idx === currentStatusIndex;
                            return (
                                <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }} className="flex items-start gap-5 relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center border-4 border-white ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-gray-300 text-transparent'}`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </div>
                                    <div className="flex-1 pt-1 bg-white pr-2 pb-2">
                                        <h4 className={`font-extrabold text-base ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-600'}`}>{step.title}</h4>
                                        <p className={`text-xs font-bold mt-0.5 ${isCompleted || isActive ? 'text-emerald-700' : 'text-gray-500'}`}>{step.time}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Items Ordered ({currentOrder.items.length})</h3>
                    <div className="space-y-3">
                        {currentOrder.items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-white border border-gray-200">
                                        <ProductImage imageUrl={item.imageUrl} alt={item.name || 'Product'} className="w-full h-full object-cover" emojiClassName="text-lg" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-gray-900">{item.name}</p>
                                        <p className="text-[10px] text-gray-600 font-semibold">{item.unit} x {item.qty}</p>
                                    </div>
                                </div>
                                <span className="font-extrabold text-sm text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ClockIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
