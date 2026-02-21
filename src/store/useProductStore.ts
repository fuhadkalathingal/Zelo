import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/data';

interface ProductStore {
    products: Product[];
    loading: boolean;
    initializeProductsListener: () => () => void;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    seedInitialProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    loading: true,

    initializeProductsListener: () => {
        const productsRef = collection(db, 'products');
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productsData: Product[] = [];
            snapshot.forEach((doc) => {
                productsData.push({ ...doc.data(), id: doc.id } as Product);
            });

            if (productsData.length === 0 && get().loading) {
                get().seedInitialProducts();
            } else {
                set({ products: productsData, loading: false });
            }
        }, (error) => {
            console.error("Error listening to products: ", error);
            set({ loading: false });
        });

        return unsubscribe;
    },

    addProduct: async (productData) => {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, { ...productData, id: newDocRef.id });
    },

    updateProduct: async (id, data) => {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, data);
    },

    deleteProduct: async (id) => {
        const docRef = doc(db, 'products', id);
        await deleteDoc(docRef);
    },

    seedInitialProducts: async () => {
        try {
            for (const prod of MOCK_PRODUCTS) {
                // Keep the exact same ID so cart doesn't break initially
                await setDoc(doc(db, 'products', prod.id), prod);
            }
        } catch (error) {
            console.error("Failed to seed products", error);
        }
    }
}));
