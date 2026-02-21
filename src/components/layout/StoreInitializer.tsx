"use client";

import { useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAgentStore } from '@/store/useAgentStore';
import { useOrderStore } from '@/store/useOrderStore';

export default function StoreInitializer() {
    useEffect(() => {
        const unsubscribeProducts = useProductStore.getState().initializeProductsListener();
        const unsubscribeAgents = useAgentStore.getState().initializeAgentsListener();
        const unsubscribeOrders = useOrderStore.getState().initializeOrdersListener();

        return () => {
            unsubscribeProducts();
            unsubscribeAgents();
            unsubscribeOrders();
        };
    }, []);

    return null;
}
