"use client";

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
                                    <div>
                                        {order.deliveryAddress.flat}, {order.deliveryAddress.area},<br />
                                        {order.deliveryAddress.landmark} - {order.deliveryAddress.pincode}
                                    </div>
                                </div>
                            </div>

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
            </div>
        </div>
    );
}
