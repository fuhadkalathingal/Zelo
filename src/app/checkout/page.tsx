"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft, MapPin, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useOrderStore } from '@/store/useOrderStore';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getCartTotal, clearCart } = useCartStore();
    const { user, setUser } = useAuthStore();
    const placeOrder = useOrderStore((state) => state.placeOrder);

    const [isProcessing, setIsProcessing] = useState(false);
    const [batchInfo, setBatchInfo] = useState<{ title: string; time: string; batchType: 'Morning' | 'Evening' }>({
        title: 'Lunch Batch',
        time: 'Today, 12:45 PM',
        batchType: 'Morning',
    });
    const [addressLoading, setAddressLoading] = useState(false);
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

        setAddressLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setLatitude(lat);
                setLongitude(lng);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data?.display_name) {
                        setArea(data.display_name);
                        const pin = data?.address?.postcode;
                        if (typeof pin === 'string') setPincode(pin.replace(/\D/g, '').slice(0, 6));
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
        if (!user) return;
        if (!flat.trim() || !area.trim() || !landmark.trim() || pincode.length < 6) {
            alert('Please fill Flat, Area, Landmark and valid Pincode before placing order.');
            return;
        }

        const address = {
            id: 'addr-1',
            type: 'Home' as const,
            flat: flat.trim(),
            area: area.trim(),
            landmark: landmark.trim(),
            pincode: pincode.trim(),
            latitude,
            longitude,
            address: `${flat.trim()}, ${area.trim()}, ${landmark.trim()} - ${pincode.trim()}`,
        };

        setIsProcessing(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const updatedProfile = { ...user, savedAddresses: [address] };
            await setDoc(userDocRef, updatedProfile, { merge: true });
            setUser(updatedProfile);

            placeOrder({
                userId: user.uid,
                customerName: user.name,
                customerPhone: user.phone,
                items: items.map((item) => ({ productId: item.id, qty: item.quantity, price: item.discountPrice || item.price })),
                totalAmount: total,
                paymentMethod: 'UPI',
                batchType: batchInfo.batchType,
                deliveryAddress: address,
            });

            clearCart();
            alert('Order placed successfully!');
            router.push('/orders');
        } catch (error) {
            console.error(error);
            alert('Could not place order. Please try again.');
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
                <h1 className="font-extrabold text-lg text-gray-900">Secure Checkout</h1>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-orange-500" /> Delivery Slot</h3>
                    <p className="text-sm font-bold">{batchInfo.title}</p>
                    <p className="text-xs text-gray-500">{batchInfo.time}</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> Delivery Address</h3>
                        <button onClick={handleAutoDetectLocation} disabled={addressLoading} className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest disabled:opacity-50">
                            {addressLoading ? 'Detecting...' : 'Detect Pinpoint'}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <input value={flat} onChange={(e) => setFlat(e.target.value)} placeholder="Flat / House No" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / Street / City" className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" />
                    </div>

                    {(latitude && longitude) ? (
                        <a className="text-xs text-blue-600 font-semibold mt-3 inline-block" target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${latitude},${longitude}`}>
                            View exact pin on map ({latitude.toFixed(5)}, {longitude.toFixed(5)})
                        </a>
                    ) : null}
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Order Summary ({items.length} items)</h3>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-bold">₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-center">
                <div className="max-w-3xl w-full flex gap-4 items-center">
                    <div className="flex flex-col border border-emerald-100 bg-emerald-50 rounded-xl px-4 py-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1"><ShieldCheck className="w-8 h-8 opacity-10 text-emerald-800" /></div>
                        <span className="text-[10px] text-emerald-700 font-extrabold tracking-widest uppercase">To Pay</span>
                        <span className="text-xl font-black text-emerald-900 text-left">₹{total.toFixed(2)}</span>
                    </div>
                    <button onClick={handleConfirmOrder} disabled={isProcessing} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-extrabold uppercase text-sm py-4 rounded-xl flex items-center justify-center gap-2">
                        {isProcessing ? 'Processing...' : 'Place Order'} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
