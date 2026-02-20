import { create } from 'zustand';
import { Product } from '@/types';

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (product) => {
        set((state) => {
            const existing = state.items.find((item) => item.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((item) =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                };
            }
            return { items: [...state.items, { ...product, quantity: 1 }] };
        });
    },
    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
        }));
    },
    updateQuantity: (productId, quantity) => {
        set((state) => {
            if (quantity <= 0) {
                return { items: state.items.filter((item) => item.id !== productId) };
            }
            return {
                items: state.items.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                ),
            };
        });
    },
    clearCart: () => set({ items: [] }),
    getCartTotal: () => {
        return get().items.reduce((total, item) => {
            const price = item.discountPrice || item.price;
            return total + price * item.quantity;
        }, 0);
    },
    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));
