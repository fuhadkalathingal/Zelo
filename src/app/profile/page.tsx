"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, LogOut, Edit3, MapPin, User, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/profile');
        } else {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
        }
    }, [user, router]);

    if (!user) return null;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const handleSaveProfile = async () => {
        if (!name.trim() || phone.length < 10) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name,
                phone,
                email
            });

            setUser({ ...user, name, phone, email });
            setIsEditing(false);
        } catch (error) {
            console.error("Profile update failed", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="font-extrabold text-lg text-gray-900">My Profile</h1>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                        <Edit3 className="w-5 h-5" />
                    </button>
                ) : (
                    <button onClick={handleSaveProfile} disabled={isSaving} className="text-sm font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5">
                        {isSaving ? '...' : <><CheckCircle2 className="w-4 h-4" /> Save</>}
                    </button>
                )}
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                    <div className="relative mt-8 mb-4">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white" />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-600">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-black text-gray-900 mb-1">{user.name || 'Zelo User'}</h2>
                    <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{user.role.toUpperCase()}</p>
                </div>

                {/* Details Form Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                    <h3 className="font-extrabold text-gray-900 flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
                        <User className="w-5 h-5 text-emerald-500" /> Personal Details
                    </h3>

                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                        <input
                            type="text"
                            disabled={!isEditing}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900 disabled:opacity-70 disabled:bg-gray-50/50"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                disabled={!isEditing}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900 disabled:opacity-70 disabled:bg-gray-50/50"
                            />
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                        <div className="relative">
                            <input
                                type="tel"
                                disabled={!isEditing}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900 disabled:opacity-70 disabled:bg-gray-50/50"
                            />
                            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Addresses Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                        <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" /> Saved Addresses
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {user.savedAddresses?.map((addr, idx) => (
                            <div key={addr.id || idx} className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-extrabold text-sm text-gray-900">{addr.type}</span>
                                            {idx === 0 && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Default</span>}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-600 leading-relaxed pr-8">
                                            {addr.flat ? `${addr.flat}, ` : ''}{addr.area}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out from Zelo
                    </button>
                </div>
            </div>
        </div>
    );
}
