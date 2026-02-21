"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, ShoppingBag, UserCircle2, MapPinned, Menu } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAgentStore } from '@/store/useAgentStore';
import { useOrderStore } from '@/store/useOrderStore';

export default function Header() {
    const pathname = usePathname();
    const cartItemCount = useCartStore((state) => state.getItemCount());
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const unsubscribeProducts = useProductStore.getState().initializeProductsListener();
        const unsubscribeAgents = useAgentStore.getState().initializeAgentsListener();
        const unsubscribeOrders = useOrderStore.getState().initializeOrdersListener();
        return () => {
            unsubscribeProducts();
            unsubscribeAgents();
            unsubscribeOrders();
        };
    }, []);

    // Hide on admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/agent')) return null;

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20 gap-4">

                    {/* Logo & Location (Left) */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-sm">
                                <Image src="/zelo.png" alt="Zelo Logo" fill className="object-cover" />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight hidden sm:block">Zelo</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                            <MapPinned className="w-5 h-5 text-emerald-600" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 leading-none">LUNCH BATCH</span>
                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">Select Location</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar (Middle) */}
                    <div className="flex-1 max-w-3xl hidden sm:block mx-8">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium sm:text-sm shadow-sm"
                                placeholder="Search for 'milk', 'chips', 'vegetables'..."
                            />
                        </div>
                    </div>

                    {/* Mobile Search Icon (Shows on very small screens instead of full bar) */}
                    <Link href="/search" className="sm:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-full ml-auto">
                        <Search className="w-6 h-6" />
                    </Link>

                    {/* Navigation Actions (Right) */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {user ? (
                            <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-semibold px-2 sm:px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-200" />
                                ) : (
                                    <UserCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                                )}
                                <span className="hidden leading-tight text-xs sm:block max-w-[80px] truncate">{user.name?.split(' ')[0] || 'Profile'}</span>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                                    <UserCircle2 className="w-6 h-6" />
                                    <span>Login</span>
                                </Link>

                                <Link href="/login" className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-full">
                                    <UserCircle2 className="w-6 h-6" />
                                </Link>
                            </>
                        )}

                        <Link href="/cart" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 group">
                            <div className="relative">
                                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-emerald-500">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <span className="hidden sm:block">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
