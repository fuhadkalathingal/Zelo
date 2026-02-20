export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-6 mt-4">All Categories</h1>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                    {[
                        { name: 'Vegetables', icon: '🥦', bg: 'bg-emerald-50' },
                        { name: 'Fruits', icon: '🍎', bg: 'bg-red-50' },
                        { name: 'Dairy & Milk', icon: '🧀', bg: 'bg-yellow-50' },
                        { name: 'Snacks', icon: '🍪', bg: 'bg-orange-50' },
                        { name: 'Cold Drinks', icon: '🥤', bg: 'bg-blue-50' },
                        { name: 'Meat', icon: '🍗', bg: 'bg-rose-50' },
                        { name: 'Personal Care', icon: '🧴', bg: 'bg-teal-50' },
                        { name: 'Household', icon: '🧹', bg: 'bg-indigo-50' },
                        { name: 'Baby Care', icon: '👶', bg: 'bg-pink-50' },
                    ].map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center gap-2">
                            <div className={`w-full aspect-square rounded-2xl ${cat.bg} border border-white shadow-sm flex items-center justify-center text-4xl hover:shadow-md transition-shadow cursor-pointer`}>
                                {cat.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-700 text-center leading-tight">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
