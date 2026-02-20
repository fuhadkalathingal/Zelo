"use client";

import { useMemo, useState } from 'react';
import { AgentProfile } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';

const AGENTS: AgentProfile[] = [
    { agentId: 'ag1', uid: 'user1', name: 'Ravi Kumar', phone: '9876543210', vehicleNo: 'KA-01-AB-1234', isActive: true },
    { agentId: 'ag2', uid: 'user2', name: 'Suresh Das', phone: '9876543211', vehicleNo: 'KA-02-CD-5678', isActive: true },
];

export default function AdminOrdersPage() {
    const [activeBatch, setActiveBatch] = useState<'Morning' | 'Evening'>('Morning');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const orders = useOrderStore((state) => state.orders);
    const assignOrdersToAgent = useOrderStore((state) => state.assignOrdersToAgent);

    const unassignedOrders = useMemo(
        () => orders.filter((o) => o.batchType === activeBatch && !o.assignedAgentId && o.status !== 'Delivered'),
        [orders, activeBatch],
    );

    const handleAssign = (agentId: string) => {
        if (selectedOrders.length === 0) return;
        assignOrdersToAgent(selectedOrders, agentId);
        setSelectedOrders([]);
    };

    return (
        <div className="p-6 md:p-10 w-full h-full">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Batch Operations Hub</h1>

            <div className="flex gap-4 mb-6">
                <button className={`px-6 py-2 rounded-full font-semibold ${activeBatch === 'Morning' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border'}`} onClick={() => setActiveBatch('Morning')}>☀️ Morning Batch</button>
                <button className={`px-6 py-2 rounded-full font-semibold ${activeBatch === 'Evening' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border'}`} onClick={() => setActiveBatch('Evening')}>🌙 Evening Batch</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold text-gray-500 uppercase tracking-wider">Unassigned Orders ({activeBatch})</div>
                    <div className="divide-y divide-gray-100">
<<<<<<< HEAD
                        {MOCK_ORDERS.filter(o => o.batchType === activeBatch).map(order => (
                            <div key={order.orderId} className="p-4 flex items-center gap-4 hover:bg-emerald-50/50 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500 border-gray-300"
                                    checked={selectedOrders.includes(order.orderId)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelectedOrders(prev => checked ? [...prev, order.orderId] : prev.filter(id => id !== order.orderId))
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="font-extrabold text-gray-900">{order.orderId}</div>
                                    <div className="text-sm font-semibold text-gray-800">{order.deliveryAddress.area} • <span className="text-gray-900">₹{order.totalAmount}</span> • {order.paymentMethod}</div>
=======
                        {unassignedOrders.length === 0 ? <p className="p-4 text-sm text-gray-500">No pending orders in this batch.</p> : unassignedOrders.map((order) => (
                            <div key={order.orderId} className="p-4 flex items-center gap-4">
                                <input type="checkbox" checked={selectedOrders.includes(order.orderId)} onChange={(e) => setSelectedOrders((prev) => e.target.checked ? [...prev, order.orderId] : prev.filter((id) => id !== order.orderId))} />
                                <div className="flex-1">
                                    <div className="font-bold text-gray-800">{order.orderId}</div>
                                    <div className="text-sm text-gray-500">{order.deliveryAddress.area} • ₹{order.totalAmount}</div>
>>>>>>> 31b3ab587fdab182935d6e485f2e314a844c8886
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold text-gray-500 uppercase tracking-wider">Agents</div>
                    <div className="p-2 space-y-2">
                        {AGENTS.map((agent) => (
                            <div key={agent.agentId} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">{agent.name}</div>
                                    <div className="text-xs text-gray-500">{agent.vehicleNo}</div>
                                </div>
                                <button onClick={() => handleAssign(agent.agentId)} disabled={selectedOrders.length === 0} className="text-white bg-emerald-600 disabled:bg-emerald-300 px-3 py-1 rounded text-sm font-medium">
                                    Assign
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
