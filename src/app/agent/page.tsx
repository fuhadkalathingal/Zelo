"use client";

<<<<<<< HEAD
import { Order } from '@/types';
import { Phone, MapPin, CheckCircle2, IndianRupee, Trophy, Navigation } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Assigned Orders
const ASSIGNED_ORDERS = [
    { orderId: 'ORD-101', status: 'Batch Processing', paymentMethod: 'COD', totalAmount: 450, customerName: 'Fuhad K.', customerPhone: '9876543210', deliveryAddress: { flat: 'A-102', area: 'Indiranagar', landmark: 'Near Metro', pincode: '560038' } },
    { orderId: 'ORD-102', status: 'Batch Processing', paymentMethod: 'UPI', totalAmount: 1200, customerName: 'Rahul M.', customerPhone: '9876543211', deliveryAddress: { flat: 'Villa 5', area: 'Koramangala', landmark: 'Sony World', pincode: '560034' } },
] as any[];

export default function AgentDashboard() {
    const [orders, setOrders] = useState(ASSIGNED_ORDERS);
    const [deliveredCount, setDeliveredCount] = useState(5); // Start with 5 for demo purposes

    const payoutPerDelivery = 50;
    const todaysEarnings = deliveredCount * payoutPerDelivery;

    const markDelivered = (orderId: string) => {
        setOrders(orders.filter(o => o.orderId !== orderId));
        setDeliveredCount(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* App Bar */}
            <div className="bg-gray-900 text-white p-5 sticky top-0 z-20 shadow-md rounded-b-3xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Agent Portal</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">ID: AG-8472 • Morning Batch</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-xl border-2 border-emerald-400">
                        Z
                    </div>
                </div>

                {/* Gamified Salary Tracker */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
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
                        <span className="text-2xl font-black text-white">{deliveredCount}</span>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4 mt-2">
                <h2 className="font-extrabold text-gray-900 flex items-center justify-between">
                    Active Deliveries
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{orders.length} Left</span>
                </h2>

                <AnimatePresence>
                    {orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-black text-gray-900">All deliveries complete!</h3>
                            <p className="text-sm font-semibold text-gray-500 mt-2">Time to head back to the hub.</p>
                        </motion.div>
                    ) : (
                        orders.map((order, idx) => (
                            <motion.div
                                key={order.orderId}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-5 border-b border-gray-50 flex justify-between items-start">
=======
import { Phone, MapPin, CheckCircle2, Bike } from 'lucide-react';
import { useMemo } from 'react';
import { useOrderStore } from '@/store/useOrderStore';

const CURRENT_AGENT_ID = 'ag1';

export default function AgentDashboard() {
    const orders = useOrderStore((state) => state.orders);
    const markOutForDelivery = useOrderStore((state) => state.markOutForDelivery);
    const markDelivered = useOrderStore((state) => state.markDelivered);

    const assignedOrders = useMemo(
        () => orders.filter((order) => order.assignedAgentId === CURRENT_AGENT_ID && order.status !== 'Delivered'),
        [orders],
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <h1 className="text-xl font-bold">Active Deliveries</h1>
                <p className="text-emerald-100 text-sm">{assignedOrders.length} remaining</p>
            </div>

            <div className="p-4 space-y-4">
                {assignedOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 font-medium">No assigned deliveries yet.</div>
                ) : (
                    assignedOrders.map((order) => (
                        <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="font-extrabold text-gray-900 text-lg">{order.orderId}</div>
                                    <div className="text-sm text-gray-500 font-medium mt-1">{order.customerName || 'Customer'}</div>
                                </div>
                                <div className="px-3 py-1 rounded font-bold text-xs bg-yellow-100 text-yellow-700">{order.status}</div>
                            </div>

                            <div className="p-4 bg-gray-50/50">
                                <div className="flex gap-3 text-gray-700 text-sm">
                                    <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
>>>>>>> 31b3ab587fdab182935d6e485f2e314a844c8886
                                    <div>
                                        <div className="font-black text-gray-900 text-xl tracking-tight">{order.orderId}</div>
                                        <div className="text-sm text-gray-500 font-bold mt-1">{order.customerName}</div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg border font-black tracking-widest text-[10px] uppercase shadow-sm ${order.paymentMethod === 'COD' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {order.paymentMethod === 'COD' ? `COLLECT ₹${order.totalAmount}` : 'PREPAID'}
                                    </div>
                                </div>

<<<<<<< HEAD
                                <div className="p-5 bg-gray-50/50">
                                    <div className="flex gap-3 text-gray-700 text-sm">
                                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                        <div className="font-bold text-gray-700">
                                            {order.deliveryAddress.flat}, {order.deliveryAddress.area},<br />
                                            {order.deliveryAddress.landmark} - {order.deliveryAddress.pincode}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white grid grid-cols-2 gap-3">
                                    <a href={`tel:${order.customerPhone}`} className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors active:scale-[0.98]">
                                        <Phone className="w-4 h-4" /> Call
                                    </a>
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress.area)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors active:scale-[0.98]">
                                        <Navigation className="w-4 h-4" /> Route
                                    </a>
                                </div>

                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => markDelivered(order.orderId)}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black border-b-4 border-gray-700 active:border-b-0 active:translate-y-1 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Mark Delivered
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
=======
                            <div className="p-3 bg-white flex gap-2">
                                <a href={`tel:${order.customerPhone || '9999999999'}`} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">
                                    <Phone className="w-5 h-5" /> Call
                                </a>
                                <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress.address || order.deliveryAddress.area)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">
                                    <MapPin className="w-5 h-5" /> Navigate
                                </a>
                            </div>

                            <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                                <button onClick={() => markOutForDelivery(order.orderId)} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold">
                                    <Bike className="w-5 h-5" /> Out
                                </button>
                                <button onClick={() => markDelivered(order.orderId)} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold">
                                    <CheckCircle2 className="w-5 h-5" /> Delivered
                                </button>
                            </div>
                        </div>
                    ))
                )}
>>>>>>> 31b3ab587fdab182935d6e485f2e314a844c8886
            </div>
        </div>
    );
}
