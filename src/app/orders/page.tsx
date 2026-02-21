"use client";

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useRouter } from 'next/navigation';
import ProductImage from '@/components/ui/ProductImage';

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
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">🛒</div>
                        <h3 className="font-extrabold text-gray-900 text-lg">No Orders Yet</h3>
                        <p className="text-sm font-semibold text-gray-700 mt-2 max-w-xs">Looks like you haven't bought anything yet. Go ahead and explore our catalog!</p>
                        <button onClick={() => router.push('/')} className="mt-6 bg-emerald-500 text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:bg-emerald-600 transition-colors">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myOrders.map((order) => {
                            const isDelivered = order.status === 'Delivered';
                            return (
                                <div key={order.orderId} className={`bg-white rounded-3xl p-5 md:p-6 border overflow-hidden relative ${isDelivered ? 'border-gray-200' : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30'}`}>
                                    {!isDelivered && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>}

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                                            <p className="font-extrabold text-sm md:text-base text-gray-900 mt-1 cursor-pointer hover:underline" onClick={() => router.push(`/order/${order.orderId}`)}>Order #{order.orderId}</p>
                                        </div>
                                        <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest ${isDelivered ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-800 shadow-sm'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <div className="flex -space-x-3">
                                            {order.items.slice(0, 4).map((item, idx) => (
                                                <div key={idx} className="w-10 h-10 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-lg shadow-sm z-10 overflow-hidden relative">
                                                    <ProductImage imageUrl={item.imageUrl || '📦'} alt={item.name || 'Product'} className="w-full h-full object-cover" emojiClassName="text-lg absolute inset-0 flex items-center justify-center" />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-700 shadow-sm z-0">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Total</p>
                                            <p className="font-black text-lg text-gray-900 tracking-tight">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[200px] md:max-w-xs flex items-center gap-1.5">
                                            📍 {order.deliveryAddress.flat ? `${order.deliveryAddress.flat}, ` : ''}{order.deliveryAddress.area}
                                        </p>
                                        <button
                                            onClick={() => router.push(`/order/${order.orderId}`)}
                                            className={`text-xs font-black px-5 py-2.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 w-max ${isDelivered
                                                ? 'bg-gray-50 text-emerald-600 hover:bg-emerald-50 border border-gray-200'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600'
                                                }`}
                                        >
                                            {isDelivered ? 'Order Receipt' : 'Track Order'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
