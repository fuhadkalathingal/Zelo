"use client";

import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Phone, MapPin, CheckCircle2, Trophy, Navigation, Truck, KeyRound } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/store/useAgentStore';

export default function AgentDashboard() {
    const user = useAuthStore(s => s.user);
    const { orders, updateOrderStatus } = useOrderStore();

    const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
    const { agents } = useAgentStore();

    const myOrders = useMemo(() =>
        orders.filter(o => o.assignedAgentId === user?.uid && o.status !== 'Delivered')
        , [orders, user]);

    const deliveredTodayCount = useMemo(() =>
        orders.filter(o => o.assignedAgentId === user?.uid && o.status === 'Delivered').length
        , [orders, user]);

    const me = useMemo(() => agents.find(a => a.agentId === user?.uid), [agents, user]);
    const payoutPerDelivery = me?.payoutPerDelivery || 50;
    const todaysEarnings = deliveredTodayCount * payoutPerDelivery;

    const handleMarkOutForDelivery = async (orderId: string) => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        await updateOrderStatus(orderId, 'Out for Delivery', { deliveryPin: pin });
    };

    const handleMarkDelivered = async (orderId: string, correctPin?: string) => {
        const enteredPin = pinInputs[orderId];
        if (!correctPin || enteredPin !== correctPin) {
            alert("Incorrect Delivery PIN.\n\nPlease ask the customer for the 4-digit code shown on their order tracking page to complete this delivery.");
            return;
        }

        await updateOrderStatus(orderId, 'Delivered', { deliveredAt: new Date().toISOString() });

        setPinInputs(prev => {
            const next = { ...prev };
            delete next[orderId];
            return next;
        });
    };

    const [hasApplied, setHasApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [appForm, setAppForm] = useState({ name: user?.name || '', phone: user?.phone || '', vehicleNo: '', licenseNo: '' });

    useEffect(() => {
        if (user && user.role !== 'agent') {
            import('firebase/firestore').then(({ doc, getDoc }) => {
                import('@/lib/firebase').then(({ db }) => {
                    getDoc(doc(db, 'agent_applications', user.uid)).then(d => {
                        if (d.exists()) setHasApplied(true);
                    });
                });
            });
        }
    }, [user]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApplying(true);
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            await setDoc(doc(db, 'agent_applications', user!.uid), {
                uid: user!.uid,
                ...appForm,
                status: 'pending',
                appliedAt: new Date().toISOString()
            });
            setHasApplied(true);
        } catch (error) {
            console.error(error);
            alert("Failed to submit application.");
        } finally {
            setIsApplying(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl">🛵</div>
                <h1 className="text-xl font-black text-gray-900">Partner with Zelo</h1>
                <p className="text-sm font-semibold text-gray-500 max-w-sm">Please log in to your account first to apply as a Delivery Agent.</p>
                <a href="/login" className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl mt-4">Login or Register</a>
            </div>
        );
    }

    if (user.role !== 'agent') {
        if (hasApplied) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 text-center p-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-3xl">⏳</div>
                    <h1 className="text-2xl font-black text-gray-900">Application Pending</h1>
                    <p className="text-sm font-semibold text-gray-500 max-w-sm">We are reviewing your application. You'll be notified once your Agent profile is activated.</p>
                    <a href="/" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl mt-4">Return Home</a>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-emerald-500 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🛵</div>
                        <h2 className="text-2xl font-black tracking-tight">Become a Delivery Partner</h2>
                        <p className="text-emerald-100 font-medium text-sm mt-2">Earn weekly payouts and manage your own flexible schedule.</p>
                    </div>
                    <form onSubmit={handleApply} className="p-8 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name *</label>
                            <input required type="text" value={appForm.name} onChange={e => setAppForm({ ...appForm, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Phone Number *</label>
                            <input required type="tel" value={appForm.phone} onChange={e => setAppForm({ ...appForm, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Vehicle Registration No. *</label>
                            <input required type="text" placeholder="e.g. MH 12 AB 1234" value={appForm.vehicleNo} onChange={e => setAppForm({ ...appForm, vehicleNo: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Driving License No. *</label>
                            <input required type="text" placeholder="DL Number" value={appForm.licenseNo} onChange={e => setAppForm({ ...appForm, licenseNo: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase" />
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={isApplying} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-black rounded-xl shadow-[0_4px_0_rgb(4,120,87)] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest text-sm">
                                {isApplying ? 'Submitting...' : 'Submit Agent Application'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-semibold text-center mt-4">By applying, you agree to Zelo's Delivery Partner Terms & Conditions.</p>
                    </form>
                </div>
            </div>
        );
    }

    const handleToggleStatus = async () => {
        if (!me) return;

        const newStatus = !me.isActive;
        const { updateAgent } = useAgentStore.getState();
        await updateAgent(me.agentId, { isActive: newStatus });

        // Trigger Auto-Assignment logic from the driver app side too
        const { orders, updateOrderStatus } = useOrderStore.getState();
        if (newStatus) {
            const unassignedOrders = orders.filter(o => !o.assignedAgentId && o.status !== 'Delivered');
            for (const order of unassignedOrders) {
                await updateOrderStatus(order.orderId, 'Batch Processing', { assignedAgentId: me.agentId });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <div className="bg-gray-900 text-white p-5 sticky top-0 z-20 shadow-md rounded-b-3xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Agent Portal</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-none">ID: {user.uid.slice(0, 6)}</p>
                            <button onClick={handleToggleStatus} className={`px-2 py-1 rounded shadow-sm text-[10px] font-black uppercase tracking-widest ${me?.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'} active:scale-95 transition-all`}>
                                {me?.isActive ? '● Active' : '○ Offline'}
                            </button>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-xl border-2 border-emerald-400 uppercase">
                        {user.name ? user.name.charAt(0) : 'Z'}
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-inner">
                    <div>
                        <p className="text-[10px] text-gray-300 font-extrabold uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-[#FFDD33]" /> Today's Earnings
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-emerald-400">₹{todaysEarnings}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-300 font-extrabold uppercase tracking-widest mb-1">Deliveries</p>
                        <span className="text-3xl font-black text-white">{deliveredTodayCount}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 mt-2">
                <h2 className="font-extrabold text-gray-900 flex items-center justify-between">
                    Active Deliveries
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-black shadow-sm">{myOrders.length} Pending</span>
                </h2>

                <AnimatePresence>
                    {myOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">☕</div>
                            <h3 className="text-xl font-black text-gray-900">Queue is empty</h3>
                            <p className="text-sm font-semibold text-gray-500 mt-2">Wait for the dispatcher to assign you a batch.</p>
                        </motion.div>
                    ) : (
                        myOrders.map((order, idx) => (
                            <motion.div
                                key={order.orderId}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-extrabold text-gray-900 text-lg tracking-tight leading-none">{order.orderId}</div>
                                            {order.status === 'Out for Delivery' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                        </div>
                                        <div className="text-sm text-gray-500 font-bold">{order.customerName}</div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl border font-black tracking-widest text-[10px] uppercase shadow-sm ${order.paymentMethod === 'COD' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {order.paymentMethod === 'COD' ? `COLLECT ₹${order.totalAmount}` : 'PREPAID'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex gap-3 text-gray-700 text-sm">
                                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                        <div className="font-bold text-gray-700">
                                            <span className="text-gray-900">{order.deliveryAddress.flat}</span>, {order.deliveryAddress.area},<br />
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">{order.deliveryAddress.landmark}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-b border-gray-50">
                                    <a href={`tel:${order.customerPhone}`} className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-[0.98]">
                                        <Phone className="w-4 h-4" /> Call
                                    </a>
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress.area + ' ' + order.deliveryAddress.pincode)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-blue-100 active:scale-[0.98]">
                                        <Navigation className="w-4 h-4" /> Route
                                    </a>
                                </div>

                                <div className="p-4 bg-gray-50/50">
                                    {order.status === 'Batch Processing' ? (
                                        <button
                                            onClick={() => handleMarkOutForDelivery(order.orderId)}
                                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all active:scale-[0.98]"
                                        >
                                            <Truck className="w-5 h-5" /> Start Delivery
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <KeyRound className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    placeholder="Enter 4-Digit Customer PIN"
                                                    value={pinInputs[order.orderId] || ''}
                                                    onChange={(e) => setPinInputs({ ...pinInputs, [order.orderId]: e.target.value })}
                                                    className="w-full bg-white border-2 border-gray-200 pl-12 pr-4 py-4 rounded-xl text-center font-black tracking-[0.5em] text-lg text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:tracking-normal placeholder:font-semibold placeholder:text-sm placeholder:text-gray-400"
                                                    maxLength={4}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleMarkDelivered(order.orderId, order.deliveryPin)}
                                                disabled={(pinInputs[order.orderId]?.length || 0) < 4}
                                                className="w-full flex items-center justify-center gap-2 bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 text-white shadow-lg py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all active:scale-[0.98]"
                                            >
                                                <CheckCircle2 className="w-5 h-5" /> Confirm Delivery
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
