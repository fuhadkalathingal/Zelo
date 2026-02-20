"use client";

import { useCartStore } from '@/store/useCartStore';
import { Plus, Minus, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { CATEGORIES, PRODUCTS } from '@/lib/catalog';

export default function HomePage() {
  const { items, addItem, updateQuantity } = useCartStore();
  const getQuantity = (id: string) => items.find(i => i.id === id)?.quantity || 0;

  const [batchName, setBatchName] = useState('LUNCH BATCH');
  const [cutoffTime, setCutoffTime] = useState('11:00 AM');
  const [deliveryTime, setDeliveryTime] = useState('12:45 PM');
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentHour = now.getHours();

      const target = new Date(now);

      if (currentHour < 11) {
        setBatchName('LUNCH BATCH');
        setCutoffTime('11:00 AM');
        setDeliveryTime('Today at 12:45 PM');
        target.setHours(11, 0, 0, 0);
      } else if (currentHour < 17) {
        setBatchName('EVENING BATCH');
        setCutoffTime('05:00 PM');
        setDeliveryTime('Today at 06:45 PM');
        target.setHours(17, 0, 0, 0);
      } else {
        setBatchName('TOMORROW LUNCH BATCH');
        setCutoffTime('11:00 AM');
        setDeliveryTime('Tomorrow at 12:45 PM');
        target.setDate(target.getDate() + 1);
        target.setHours(11, 0, 0, 0);
      }

      const diff = target.getTime() - now.getTime();
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white pb-24 overflow-x-hidden pt-4 md:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Banner Area */}
        <div className="mb-8">
          <div className="w-full bg-[#0FB47F] rounded-[24px] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[200px] md:min-h-[280px]">
            <div className="z-10 relative max-w-lg text-white">
              <div className="flex items-center gap-2 bg-black/10 w-fit px-3 py-1.5 rounded-full mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">LIVE BATCH</span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{batchName} CLOSING SOON</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic leading-tight mb-2 tracking-tight">Order by <span className="text-[#FFDD33]">{cutoffTime}</span></h2>
              <p className="text-base md:text-lg font-semibold text-emerald-50 mb-6">For delivery {deliveryTime}</p>

              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md w-fit px-4 py-2.5 rounded-xl border border-white/20 shadow-sm">
                <Clock className="w-5 h-5 text-[#FFDD33]" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-white/80 leading-none">Time Left</span>
                  <span className="text-base font-black tracking-widest text-white">{timeLeft}</span>
                </div>
              </div>
            </div>
            {/* Decorative Banner Background */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-600/30 to-transparent z-0"></div>
            <div className="absolute -right-10 -bottom-20 text-[250px] md:text-[350px] opacity-10 -rotate-12 z-0">🥦</div>
          </div>
        </div>

        {/* Horizontal Categories List */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-6 mb-10 snap-x">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href="/categories" className="snap-start shrink-0 flex flex-col items-center gap-2 group w-16 sm:w-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl sm:text-4xl shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-emerald-200 transition-all">
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-700 text-center leading-tight tracking-tight group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Product Sections */}
        {['Fresh Vegetables', 'Dairy & Bread'].map((sectionCategory) => {
          const sectionProducts = PRODUCTS.filter((p) => p.category === sectionCategory || (sectionCategory === 'Dairy & Bread' && p.category.includes('Dairy')));
          if (sectionProducts.length === 0) return null;

          let sectionIcon = '🥦';
          if (sectionCategory === 'Dairy & Bread') sectionIcon = '🥛';

          return (
            <div key={sectionCategory} className="mb-10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl text-gray-900 font-extrabold flex items-center gap-2">
                  <span className="text-2xl">{sectionIcon}</span> {sectionCategory}
                </h2>
                <Link href="/categories" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center uppercase tracking-wide">
                  VIEW ALL <span className="ml-0.5">&rsaquo;</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {sectionProducts.map((prod) => {
                  const qty = getQuantity(prod.id);
                  const discountPercentage = prod.discountPrice ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100) : null;

                  return (
                    <div key={prod.id} className="bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col relative group hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">

                      {/* Discount Badge */}
                      {discountPercentage && (
                        <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none z-10 tracking-wider">
                          {discountPercentage}% OFF
                        </div>
                      )}

                      {/* Image Space */}
                      <div className="w-full aspect-square bg-[#FAFAFA] rounded-2xl flex items-center justify-center text-7xl mb-4 overflow-hidden relative group-hover:bg-[#F3F4F6] transition-colors border border-gray-50">
                        <span className="drop-shadow-lg scale-110 group-hover:scale-125 transition-transform duration-300">{prod.imageUrl}</span>
                      </div>

                      {/* Delivery Meta */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="w-3 h-3 text-orange-500" strokeWidth={3} />
                        <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-wider">Order for 12:45 PM PM</span>
                      </div>

                      {/* Details */}
                      <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{prod.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 mb-4 font-medium">{prod.unit}</p>

                      {/* Price & Add Area */}
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex flex-col">
                          {prod.discountPrice && <span className="text-[10px] text-gray-400 line-through font-semibold leading-none mb-0.5">₹{prod.price}</span>}
                          <span className="font-extrabold text-gray-900 text-base leading-none">₹{prod.discountPrice || prod.price}</span>
                        </div>

                        {/* Add To Cart Logic */}
                        {qty === 0 ? (
                          <button
                            onClick={() => addItem(prod)}
                            className="bg-white border border-emerald-500 text-emerald-600 font-bold text-sm px-6 py-2 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-emerald-500 text-white rounded-xl shadow-sm h-10 overflow-hidden border border-emerald-600">
                            <button onClick={() => updateQuantity(prod.id, qty - 1)} className="w-10 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                              <Minus className="w-4 h-4" strokeWidth={3} />
                            </button>
                            <span className="w-6 text-center font-extrabold text-sm">{qty}</span>
                            <button onClick={() => updateQuantity(prod.id, qty + 1)} className="w-10 h-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                              <Plus className="w-4 h-4" strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
