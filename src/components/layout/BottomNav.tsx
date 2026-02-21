"use client";

import { Home, Search, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function BottomNav() {
    const pathname = usePathname();
    const cartItemCount = useCartStore((state) => state.getItemCount());

    // Hide on admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/agent')) return null;

    const tabs = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Search', path: '/search', icon: Search },
        { name: 'Categories', path: '/categories', icon: LayoutGrid },
        { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartItemCount },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 md:hidden">
            <div className="flex justify-around items-center px-2 py-3 max-w-xl mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));

                    return (
                        <Link key={tab.name} href={tab.path} className="relative flex flex-col items-center gap-1 min-w-[64px]">
                            {tab.badge ? (
                                <span className="absolute top-0 right-2 -mt-2 -mr-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                    {tab.badge}
                                </span>
                            ) : null}
                            <Icon className={`w-6 h-6 transition-all ${isActive ? 'text-emerald-500 scale-110' : 'text-gray-600 hover:text-gray-700'}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-600'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
