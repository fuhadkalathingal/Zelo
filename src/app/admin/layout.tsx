"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">

                {/* Mobile Admin Header & Nav */}
                <div className="md:hidden bg-emerald-950 flex flex-col sticky top-0 z-50">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-sm shadow-md text-white">Z</div>
                        <div>
                            <h2 className="font-extrabold text-lg tracking-tight leading-none text-white">Zelo Admin</h2>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto hide-scrollbar px-3 pb-3 gap-2">
                        <Link href="/admin/orders" className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === '/admin/orders' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 bg-emerald-900/50'}`}>
                            Orders
                        </Link>
                        <Link href="/admin/products" className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === '/admin/products' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 bg-emerald-900/50'}`}>
                            Products
                        </Link>
                        <Link href="/admin/agents" className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === '/admin/agents' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 bg-emerald-900/50'}`}>
                            Agents
                        </Link>
                    </div>
                </div>

                {/* Advanced Sidebar (Desktop) */}
                <aside className="w-64 bg-emerald-950 text-white min-h-screen p-5 shadow-2xl hidden md:flex flex-col sticky top-0">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">Z</div>
                        <div>
                            <h2 className="font-extrabold text-xl tracking-tight leading-none text-white">Zelo Admin</h2>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Control Center</p>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <Link href="/admin/orders" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${pathname === '/admin/orders' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 hover:text-white hover:bg-emerald-800/50'}`}>
                            Orders Hub
                        </Link>
                        <Link href="/admin/products" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${pathname === '/admin/products' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 hover:text-white hover:bg-emerald-800/50'}`}>
                            Manage Products
                        </Link>
                        <Link href="/admin/agents" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${pathname === '/admin/agents' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100/70 hover:text-white hover:bg-emerald-800/50'}`}>
                            Agents & Staff
                        </Link>
                    </nav>
                </aside>

                <main className="flex-1 overflow-x-hidden relative md:pb-0 mb-20 md:mb-0">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
