"use client";

import { Order } from '@/types';
import { Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

// Mock Assigned Orders
const ASSIGNED_ORDERS = [
    { orderId: 'ORD-101', status: 'Batch Processing', paymentMethod: 'COD', totalAmount: 450, deliveryAddress: { flat: 'A-102', area: 'Indiranagar', landmark: 'Near Metro', pincode: '560038' } },
    { orderId: 'ORD-102', status: 'Batch Processing', paymentMethod: 'UPI', totalAmount: 1200, deliveryAddress: { flat: 'Villa 5', area: 'Koramangala', landmark: 'Sony World', pincode: '560034' } },
] as Order[];

export default function AgentDashboard() {
    const [orders, setOrders] = useState(ASSIGNED_ORDERS);

    const markDelivered = (orderId: string) => {
        setOrders(orders.filter(o => o.orderId !== orderId));
        alert(`Order ${orderId} marked as delivered!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* App Bar */}
            <div className="bg-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <h1 className="text-xl font-bold">Active Deliveries</h1>
                <p className="text-emerald-100 text-sm">Morning Batch • {orders.length} remaining</p>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 font-medium">All deliveries complete! 🎉</div>
                ) : (
                    orders.map(order => (
                        <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                            <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="font-extrabold text-gray-900 text-lg">{order.orderId}</div>
                                    <div className="text-sm text-gray-500 font-medium mt-1">Customer Name</div>
                                </div>
                                <div className={`px-3 py-1 rounded font-bold tracking-wide text-xs ${order.paymentMethod === 'COD' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {order.paymentMethod === 'COD' ? `COLLECT: ₹${order.totalAmount}` : 'PREPAID'}
                                </div>
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
                                <a href="tel:9999999999" className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors">
                                    <Phone className="w-5 h-5" /> Call
                                </a>
                                <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress.area)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors">
                                    <MapPin className="w-5 h-5" /> Navigate
                                </a>
                            </div>

                            <div className="p-3 pt-0">
                                <button
                                    onClick={() => markDelivered(order.orderId)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-lg font-bold text-lg shadow-sm transition-colors active:scale-[0.98]"
                                >
                                    <CheckCircle2 className="w-6 h-6" /> Mark Delivered
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
