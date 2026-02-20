"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                {/* Advanced Sidebar */}
                <aside className="w-64 bg-emerald-950 text-white min-h-screen p-5 shadow-2xl hidden md:flex flex-col">
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

                <main className="flex-1 overflow-x-hidden relative">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
