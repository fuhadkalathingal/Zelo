"use client";

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const user = useAuthStore((state) => state.user);
    const orders = useOrderStore((state) => state.orders);
    const router = useRouter();

    const myOrders = useMemo(() => orders.filter((order) => order.userId === user?.uid), [orders, user?.uid]);

    useEffect(() => {
        if (!user) router.push('/login?redirect=/orders');
    }, [router, user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-extrabold text-gray-900 mt-3 mb-4">Order History</h1>

                {myOrders.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 border border-gray-100 text-sm text-gray-500">No past orders yet.</div>
                ) : (
                    <div className="space-y-3">
                        {myOrders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{order.orderId}</p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">{order.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                <p className="text-sm mt-2">{order.deliveryAddress.flat}, {order.deliveryAddress.area}</p>
                                <p className="font-extrabold mt-2">₹{order.totalAmount.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
