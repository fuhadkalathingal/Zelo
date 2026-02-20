export type BatchType = 'Morning' | 'Evening';
export type PaymentMethod = 'UPI' | 'COD';
export type OrderStatus = 'Placed' | 'Batch Processing' | 'Out for Delivery' | 'Delivered';
export type AddressType = 'Home' | 'Work' | 'Other';
export type UserRole = 'customer' | 'admin' | 'agent';

export interface Address {
    id?: string;
    label?: string;
    address?: string;
    type: AddressType;
    flat: string;
    area: string;
    landmark: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
}

export interface UserProfile {
    uid: string;
    phone: string;
    email?: string;
    name?: string;
    photoURL?: string;
    role: UserRole;
    savedAddresses: Address[];
    createdAt: string;
}

export interface AgentProfile {
    agentId: string;
    uid: string;
    name: string;
    phone: string;
    vehicleNo: string;
    isActive: boolean;
    currentLocation?: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    inStock: boolean;
    unit: string;
}

export interface OrderItem {
    productId: string;
    qty: number;
    price: number;
}

export interface Order {
    orderId: string;
    userId: string;
    customerName?: string;
    customerPhone?: string;
    assignedAgentId: string | null;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    batchType: BatchType;
    deliveryAddress: Address;
    createdAt: string;
    deliveredAt: string | null;
}

export interface Banner {
    id: string;
    imageUrl: string;
    linkToCategory: string;
    active: boolean;
}
