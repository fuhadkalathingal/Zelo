"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft, MapPin } from 'lucide-react';
import { auth, db, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';

function LoginContent() {
    const [step, setStep] = useState<'LOGIN' | 'DETAILS'>('LOGIN');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Store temp user data between steps
    const [tempUid, setTempUid] = useState<string>('');
    const [tempName, setTempName] = useState<string>('');
    const [tempEmail, setTempEmail] = useState<string>('');
    const [tempPhoto, setTempPhoto] = useState<string>('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams?.get('redirect') || '/';
    const { setUser } = useAuthStore();

    const handleGoogleAuth = async () => {
        try {
            setIsProcessing(true);
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                // User already has profile setup
                const data = userDocSnap.data();
                setUser({
                    uid: user.uid,
                    phone: data.phone,
                    email: data.email || user.email || undefined,
                    name: data.name || user.displayName || 'Demo User',
                    photoURL: data.photoURL || user.photoURL || undefined,
                    role: data.role || 'customer',
                    savedAddresses: data.savedAddresses || [],
                    createdAt: data.createdAt
                });
                router.push(redirectUrl);
            } else {
                // New user - prompt for details
                setTempUid(user.uid);
                setTempName(user.displayName || 'New User');
                setTempEmail(user.email || '');
                setTempPhoto(user.photoURL || '');
                setStep('DETAILS');
            }
        } catch (error) {
            console.error("Auth Error", error);
            alert("Authentication failed. Please check your credentials or network.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // OpenStreetMap Nominatim reverse geocoding
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        setAddress(data.display_name);
                    } else {
                        alert("Could not determine address automatically.");
                    }
                } catch (error) {
                    console.error("Error detecting address", error);
                    alert("Failed to connect to location services.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            () => {
                setIsDetectingLocation(false);
                alert("Unable to retrieve your location. Please check browser permissions.");
            }
        );
    };

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10 || address.length < 5) return;

        try {
            setIsProcessing(true);
            const userDocRef = doc(db, 'users', tempUid);
            const newUserProfile = {
                uid: tempUid,
                phone: phone,
                email: tempEmail,
                name: tempName,
                photoURL: tempPhoto,
                role: 'customer' as const,
                savedAddresses: [
                    { id: 'addr-1', label: 'Home', address: address, type: 'Home' as const, flat: '', area: address, landmark: '', pincode: '000000' }
                ],
                createdAt: new Date().toISOString()
            };

            await setDoc(userDocRef, newUserProfile);

            setUser(newUserProfile);
            router.push(redirectUrl);
        } catch (error) {
            console.error("Save Details Error", error);
            alert("Could not process details.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col">
            <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm border-b border-gray-100 md:hidden">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="font-bold text-lg text-gray-900">Login / Sign up</h1>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-20 max-w-md mx-auto w-full">
                <div className="text-center mb-10 mt-8">
                    <div className="w-20 h-20 relative mx-auto mb-6 shadow-sm rounded-3xl overflow-hidden">
                        <Image src="/zelo.png" alt="Zelo" fill className="object-cover" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome to Zelo</h2>
                    <p className="text-gray-500 text-sm font-medium">Batched delivery for the community</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    {step === 'LOGIN' ? (
                        <div className="space-y-6">
                            <button
                                onClick={handleGoogleAuth}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all shadow-sm hover:bg-gray-50 active:scale-[0.98] disabled:opacity-70"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {isProcessing ? 'Connecting...' : 'Continue with Google'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveDetails} className="space-y-6">
                            <p className="text-sm text-gray-900 font-bold mb-4 text-center">We just need a couple more details for delivery.</p>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 tracking-wider mb-2">RECEIVING NUMBER</label>
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl text-gray-900 font-extrabold shrink-0">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Mobile Number"
                                        className="w-full border border-gray-300 placeholder-gray-500 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-extrabold"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-900 tracking-wider">DELIVERY ADDRESS</label>
                                    <button
                                        type="button"
                                        onClick={handleAutoDetectLocation}
                                        disabled={isDetectingLocation}
                                        className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-tight"
                                    >
                                        {isDetectingLocation ? '...' : <><MapPin className="w-3.5 h-3.5" /> Auto-Detect</>}
                                    </button>
                                </div>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your complete address"
                                    rows={3}
                                    className="w-full border border-gray-300 placeholder-gray-500 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={phone.length < 10 || address.length < 5 || isProcessing}
                                className="w-full bg-emerald-500 disabled:bg-emerald-200 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                            >
                                {isProcessing ? 'Saving...' : 'Start Shopping'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
                    By continuing, you agree to our <br />
                    <a href="#" className="underline">Terms of Service</a> & <a href="#" className="underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
