export default function SearchPage() {
    return (
        <div className="min-h-screen bg-white p-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-inner">
                <span className="text-xl">🔍</span>
                <input type="text" placeholder="Search for 'Bread' or 'Milk'" className="bg-transparent border-none outline-none w-full font-semibold text-gray-700" autoFocus />
            </div>

            <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4">Trending Searches</h3>
                <div className="flex gap-2 flex-wrap">
                    {['Atta', 'Tomato', 'Onion', 'Lays', 'Milk', 'Eggs'].map(term => (
                        <span key={term} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 cursor-pointer transition-colors">
                            {term}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
