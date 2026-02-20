import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Address, BatchType, Order, PaymentMethod } from '@/types';

interface PlaceOrderInput {
  userId: string;
  customerName?: string;
  customerPhone?: string;
  items: Order['items'];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  batchType: BatchType;
  deliveryAddress: Address;
}

interface OrderState {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  assignOrdersToAgent: (orderIds: string[], agentId: string) => void;
  markOutForDelivery: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
}

const nextOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      placeOrder: (input) => {
        const order: Order = {
          orderId: nextOrderId(),
          userId: input.userId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          assignedAgentId: null,
          items: input.items,
          totalAmount: input.totalAmount,
          paymentMethod: input.paymentMethod,
          status: 'Placed',
          batchType: input.batchType,
          deliveryAddress: input.deliveryAddress,
          createdAt: new Date().toISOString(),
          deliveredAt: null,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      assignOrdersToAgent: (orderIds, agentId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            orderIds.includes(order.orderId)
              ? { ...order, assignedAgentId: agentId, status: 'Batch Processing' }
              : order,
          ),
        }));
      },
      markOutForDelivery: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.orderId === orderId ? { ...order, status: 'Out for Delivery' } : order,
          ),
        }));
      },
      markDelivered: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: 'Delivered', deliveredAt: new Date().toISOString() }
              : order,
          ),
        }));
      },
    }),
    {
      name: 'zelo-order-store',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
);
