"use client";

import { useCartStore } from '@/store/useCartStore';
import { Plus, Minus, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { CATEGORIES } from '@/lib/data';
import { Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';
import ProductImage from '@/components/ui/ProductImage';
import { Variants } from 'framer-motion';

export default function HomePage() {
  const { items, addItem, updateQuantity } = useCartStore();
  const { products, loading } = useProductStore();
  const getQuantity = (id: string) => items.find(i => i.id === id)?.quantity || 0;

  const [batchName, setBatchName] = useState('LUNCH BATCH');
  const [cutoffTime, setCutoffTime] = useState('11:00 AM');
  const [deliveryTime, setDeliveryTime] = useState('12:45 PM');
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const renderProducts = (products: Product[]) => {
    const container: Variants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05
        }
      }
    };

    const item: Variants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
      >
        {products.map((prod) => {
          const qty = getQuantity(prod.id);
          const discountPercentage = prod.discountPrice ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100) : null;

          return (
            <motion.div variants={item} key={prod.id} className="bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-200 flex flex-col relative group hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">

              {/* Discount Badge */}
              {discountPercentage && (
                <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none z-10 tracking-wider shadow-sm">
                  {discountPercentage}% OFF
                </div>
              )}

              {/* Image Space */}
              <Link href={`/product/${prod.id}`} className="w-full aspect-square bg-[#FAFAFA] rounded-2xl flex items-center justify-center text-7xl mb-4 overflow-hidden relative group-hover:bg-[#F3F4F6] transition-colors border border-gray-100 cursor-pointer">
                <ProductImage imageUrl={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300" emojiClassName="drop-shadow-lg scale-110 group-hover:scale-125 transition-transform duration-300" />
              </Link>

              {/* Delivery Meta */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3 h-3 text-orange-500" strokeWidth={3} />
                <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-wider">Order for 12:45 PM</span>
              </div>

              {/* Details */}
              <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{prod.name}</h3>
              <p className="text-xs text-gray-700 mt-1 mb-4 font-medium">{prod.unit}</p>

              {/* Price & Add Area */}
              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  {prod.discountPrice && <span className="text-[10px] text-gray-600 line-through font-semibold leading-none mb-0.5">₹{prod.price}</span>}
                  <span className="font-extrabold text-gray-900 text-base leading-none">₹{prod.discountPrice || prod.price}</span>
                </div>

                {/* Add To Cart Logic */}
                {qty === 0 ? (
                  <button
                    onClick={() => addItem(prod)}
                    className="bg-white border border-emerald-500 text-emerald-600 font-bold text-sm px-6 py-2 rounded-xl shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="flex items-center bg-emerald-500 text-white rounded-xl shadow-sm h-10 overflow-hidden border border-emerald-600">
                    <button onClick={() => updateQuantity(prod.id, qty - 1)} className="w-10 h-full flex items-center justify-center hover:bg-emerald-600 active:bg-emerald-700 transition-colors">
                      <Minus className="w-4 h-4" strokeWidth={3} />
                    </button>
                    <span className="w-6 text-center font-extrabold text-sm">{qty}</span>
                    <button onClick={() => updateQuantity(prod.id, qty + 1)} className="w-10 h-full flex items-center justify-center hover:bg-emerald-600 active:bg-emerald-700 transition-colors">
                      <Plus className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

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
        <div className="flex gap-4 sm:gap-5 overflow-x-auto hide-scrollbar pb-6 mb-8 snap-x">
          <button
            onClick={() => setActiveCategory(null)}
            className={`snap-start shrink-0 flex flex-col items-center gap-1.5 group w-14 sm:w-16 ${activeCategory === null ? 'opacity-100' : 'opacity-60 saturate-50'}`}
          >
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm border transition-all ${activeCategory === null ? 'bg-emerald-50 border-emerald-300 shadow-emerald-100' : 'bg-gray-50 border-gray-200 group-hover:border-emerald-200'}`}>
              🏠
            </div>
            <span className={`text-[10px] font-bold text-center leading-tight tracking-tight transition-colors ${activeCategory === null ? 'text-emerald-700' : 'text-gray-700 group-hover:text-emerald-600'}`}>
              All Items
            </span>
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`snap-start shrink-0 flex flex-col items-center gap-1.5 group w-14 sm:w-16 ${activeCategory === cat.name ? 'opacity-100' : 'opacity-60 saturate-50 hover:opacity-100 hover:saturate-100'}`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm border transition-all ${activeCategory === cat.name ? 'bg-emerald-50 border-emerald-300 shadow-emerald-100 scale-105' : 'bg-gray-50 border-gray-200 group-hover:border-emerald-200 group-hover:bg-emerald-50/30'}`}>
                {cat.icon}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight tracking-tight transition-colors ${activeCategory === cat.name ? 'text-emerald-700' : 'text-gray-700 group-hover:text-emerald-600'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {activeCategory ? (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl md:text-2xl text-gray-900 font-extrabold flex items-center gap-2">
                <span className="text-2xl">{CATEGORIES.find(c => c.name === activeCategory)?.icon || '🥦'}</span> {activeCategory}
              </h2>
              <button onClick={() => setActiveCategory(null)} className="text-xs font-bold text-gray-700 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-wide">
                Clear Filter
              </button>
            </div>
            {renderProducts(products.filter(p =>
              p.category === activeCategory ||
              (activeCategory === 'Dairy, Bread & Eggs' && p.category.includes('Dairy')) ||
              (activeCategory === 'Atta, Rice, Oil & Dals' && p.category.includes('Atta')) ||
              (activeCategory === 'Fruits & Vegetables' && (p.category.includes('Vegetable') || p.category.includes('Fruit')))
            ))}
          </div>
        ) : (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl md:text-2xl text-gray-900 font-extrabold flex items-center gap-2">
                <span className="text-2xl">🏠</span> All Items
              </h2>
            </div>
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              renderProducts(products)
            )}
          </div>
        )}
      </div>
    </main >
  );
}
