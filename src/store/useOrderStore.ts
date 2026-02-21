import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { BatchType, Order, PaymentMethod, OrderStatus } from '@/types';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  initializeOrdersListener: () => () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: Partial<Order>) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: true,

  initializeOrdersListener: () => {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ ...doc.data(), orderId: doc.id } as Order);
      });

      // Sort by newest first
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      set({ orders: ordersData, loading: false });
    }, (error) => {
      console.error("Error listening to orders: ", error);
      set({ loading: false });
    });

    return unsubscribe;
  },

  updateOrderStatus: async (orderId, status, additionalData = {}) => {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      ...additionalData
    });
  }
}));
