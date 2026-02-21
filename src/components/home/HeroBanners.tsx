import Image from 'next/image';

export default function HeroBanners() {
    return (
        <div className="w-full h-48 sm:h-64 bg-emerald-50 rounded-xl overflow-hidden relative mb-8 flex items-center p-6 sm:p-10 border border-emerald-100 shadow-sm">
            <div className="z-10 w-full md:w-1/2">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    Zelo Advantage
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
                    Fresh Groceries.<br />
                    <span className="text-emerald-600">Batched for Efficiency.</span>
                </h2>
                <p className="text-gray-700 mt-2 text-sm sm:text-base">
                    Zero delivery fees on orders above ₹199.
                </p>
            </div>
            {/* Placeholder for banner illustration */}
            <div className="absolute right-0 bottom-0 opacity-20 md:opacity-100 md:w-1/2 h-full flex justify-end">
                <div className="w-64 h-64 bg-emerald-200 rounded-full translate-x-10 translate-y-10 blur-3xl"></div>
            </div>
        </div>
    );
}
