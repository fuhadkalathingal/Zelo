"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgentStore } from '@/store/useAgentStore';
import { ChevronLeft, MapPin, ArrowRight, Clock, ShieldCheck, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { BatchType, OrderStatus } from '@/types';
import ProductImage from '@/components/ui/ProductImage';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getCartTotal, clearCart } = useCartStore();
    const { user, setUser } = useAuthStore();


    const [isProcessing, setIsProcessing] = useState(false);
    const [batchInfo, setBatchInfo] = useState<{ title: string; time: string; batchType: 'Morning' | 'Evening' }>({
        title: 'Lunch Batch',
        time: 'Today, 12:45 PM',
        batchType: 'Morning',
    });
    const [addressLoading, setAddressLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
    const [flat, setFlat] = useState('');
    const [area, setArea] = useState('');
    const [landmark, setLandmark] = useState('');
    const [pincode, setPincode] = useState('');
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);

    const total = getCartTotal();

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/checkout');
            return;
        }

        const currentAddress = user.savedAddresses?.[0];
        if (currentAddress) {
            setFlat(currentAddress.flat || '');
            setArea(currentAddress.area || '');
            setLandmark(currentAddress.landmark || '');
            setPincode(currentAddress.pincode || '');
            setLatitude(currentAddress.latitude);
            setLongitude(currentAddress.longitude);
        }

        const currentHour = new Date().getHours();
        if (currentHour < 11) {
            setBatchInfo({ title: 'Lunch Batch', time: 'Today, 12:45 PM', batchType: 'Morning' });
        } else if (currentHour < 17) {
            setBatchInfo({ title: 'Evening Batch', time: 'Today, 6:45 PM', batchType: 'Evening' });
        } else {
            setBatchInfo({ title: 'Tomorrow Morning', time: 'Tomorrow, 8:45 AM', batchType: 'Morning' });
        }
    }, [router, user]);

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        if (!user) {
            alert('Please login to detect your location.');
            return;
        }

        setAddressLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setLatitude(lat);
                setLongitude(lng);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        const userDocRef = doc(db, 'users', user.uid);
                        const updatedAddresses = [...(user.savedAddresses || [])];
                        if (updatedAddresses.length > 0) {
                            updatedAddresses[0].area = data.display_name;
                        } else {
                            updatedAddresses.push({ id: 'addr-1', type: 'Home' as const, flat: '', area: data.display_name, landmark: '', pincode: '000000' });
                        }

                        const updatedProfile = { ...user, savedAddresses: updatedAddresses };
                        await setDoc(userDocRef, updatedProfile);
                        setUser(updatedProfile);
                    }
                } catch (error) {
                    console.error('Error', error);
                    alert('Location detection failed.');
                } finally {
                    setAddressLoading(false);
                }
            },
            () => {
                setAddressLoading(false);
                alert('Please enable location services to auto-detect.');
            }
        );
    };

    const handleConfirmOrder = async () => {
        if (!user || !user.savedAddresses?.[0]) {
            alert("Please add a delivery address first.");
            return;
        }

        setIsProcessing(true);
        try {
            // Create a neat 'Flipkart-style' Order ID rather than a messy hash
            const neatOrderId = 'OD' + Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const orderRef = doc(db, 'orders', neatOrderId);

            // Auto-assign to an active agent if any exist
            const activeAgents = useAgentStore.getState().agents.filter(a => a.isActive);
            const assignedAgent = activeAgents.length > 0 ? activeAgents[Math.floor(Math.random() * activeAgents.length)].agentId : null;

            const newOrder = {
                orderId: orderRef.id,
                userId: user.uid,
                customerName: user.name || 'Customer',
                customerPhone: user.phone,
                items: items.map(item => ({
                    productId: item.id,
                    qty: item.quantity,
                    price: item.discountPrice || item.price,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    unit: item.unit
                })),
                totalAmount: total,
                status: assignedAgent ? 'Batch Processing' : 'Placed' as OrderStatus,
                batchType: batchInfo.batchType as BatchType,
                paymentMethod: paymentMethod,
                deliveryAddress: user.savedAddresses[0],
                assignedAgentId: assignedAgent,
                deliveredAt: null,
                createdAt: new Date().toISOString()
            };

            await setDoc(orderRef, newOrder);

            // Keep user profile history updated
            const userRef = doc(db, 'users', user.uid);
            const userOrders = user.orders || [];

            await setDoc(userRef, {
                ...user,
                orders: [...userOrders, newOrder]
            });

            setUser({ ...user, orders: [...userOrders, newOrder] });

            // Push to Tracking Page first
            router.push(`/order/${orderRef.id}`);

            // Clear cart slightly after so the UI doesn't flash the empty state while routing
            setTimeout(() => {
                clearCart();
            }, 500);

        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to place order.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Nothing to Checkout</h2>
                    <button onClick={() => router.push('/')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl mt-4 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">Go to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="font-extrabold text-lg text-gray-900">Secure Checkout</h1>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-orange-500" /> Delivery Slot</h3>
                    <p className="text-sm font-bold">{batchInfo.title}</p>
                    <p className="text-xs text-gray-600">{batchInfo.time}</p>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" /> Delivery Address
                        </h3>
                        <div className="flex gap-3">
                            <button onClick={handleAutoDetectLocation} disabled={addressLoading} className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-50">
                                {addressLoading ? 'Detecting...' : 'Auto Detect'}
                            </button>
                        </div>
                    </div>

                    {user?.savedAddresses?.[0] ? (
                        <p className="text-sm font-semibold text-gray-900 p-4 border border-gray-200 rounded-xl bg-gray-50/50 leading-relaxed shadow-inner">
                            {user.savedAddresses[0].flat ? `${user.savedAddresses[0].flat}, ` : ''}{user.savedAddresses[0].area}
                            <br />
                            Contact: <span className="font-bold text-gray-900">{user.phone}</span>
                        </p>
                    ) : (
                        <p className="text-sm font-medium text-orange-600 p-4 border border-orange-100 rounded-xl bg-orange-50 mb-2">
                            Please verify your location to proceed.
                        </p>
                    )}
                </div>

                {/* Payment Method Selector */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">
                        Payment Method
                    </h3>
                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'UPI' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${paymentMethod === 'UPI' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${paymentMethod === 'UPI' ? 'text-emerald-900' : 'text-gray-900'}`}>Pay via UPI</p>
                                    <p className="text-[10px] font-semibold text-gray-600">Google Pay, PhonePe, Paytm</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-emerald-500' : 'border-gray-300'}`}>
                                {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <input type="radio" className="hidden" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                        </label>

                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${paymentMethod === 'COD' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                                    <Banknote className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${paymentMethod === 'COD' ? 'text-emerald-900' : 'text-gray-900'}`}>Cash on Delivery</p>
                                    <p className="text-[10px] font-semibold text-gray-600">Pay at your doorstep</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-emerald-500' : 'border-gray-300'}`}>
                                {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <input type="radio" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                        </label>
                    </div>
                </div>

                {/* Order Summary Small */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">
                        Order Summary ({items.length} items)
                    </h3>
                    <div className="space-y-3">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-200/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white border border-gray-200 w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm overflow-hidden">
                                        <ProductImage imageUrl={item.imageUrl} alt={item.name || 'Product'} className="w-full h-full object-cover" emojiClassName="text-lg" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                        <p className="text-xs font-semibold text-gray-700">{item.unit} x {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-extrabold text-sm text-gray-900">₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-center pb-6">
                <div className="max-w-3xl w-full flex gap-4 items-center">
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing || !user?.savedAddresses?.[0]}
                        className="flex-1 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-600 text-white font-black tracking-widest uppercase text-sm py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-between px-8"
                    >
                        <span>{isProcessing ? 'Processing Payment...' : (paymentMethod === 'COD' ? 'Place Order' : 'Pay Securely')}</span>
                        {!isProcessing && <span className="text-emerald-400">₹{total.toFixed(2)}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
