import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-100">
                {/* Simple Sidebar for context */}
                <aside className="w-64 bg-emerald-900 text-white min-h-screen p-4 shadow-xl hidden md:block">
                    <div className="mb-8 font-bold text-2xl tracking-tighter text-emerald-300">Zelo Admin</div>
                    <nav className="space-y-2">
                        <div className="p-3 bg-emerald-800 rounded shadow-inner font-medium cursor-pointer">Batch Ops</div>
                        <div className="p-3 hover:bg-emerald-800/50 rounded transition-colors cursor-pointer text-emerald-100">Products</div>
                        <div className="p-3 hover:bg-emerald-800/50 rounded transition-colors cursor-pointer text-emerald-100">Banners</div>
                    </nav>
                </aside>

                <main className="flex-1 overflow-x-hidden relative">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
