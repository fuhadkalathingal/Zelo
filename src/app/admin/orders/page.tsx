"use client";

import { useMemo, useState, useEffect } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { useAgentStore } from '@/store/useAgentStore';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAssignableOrders, getNextAgent } from '@/lib/dispatch';

export default function AdminOrdersPage() {
    const [activeBatch, setActiveBatch] = useState<'Morning' | 'Evening'>('Morning');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [validAgentUids, setValidAgentUids] = useState<string[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('role', '==', 'agent'));
        const unsub = onSnapshot(q, (snapshot) => {
            setValidAgentUids(snapshot.docs.map(d => d.id));
        });
        return () => unsub();
    }, []);

    const orders = useOrderStore((state) => state.orders);
    const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
    const agents = useAgentStore((state) => state.agents).filter(a => validAgentUids.includes(a.uid));
    const activeAgents = agents.filter((a) => a.isActive);

    const unassignedOrders = useMemo(
        () => orders.filter((o) => {
            const matchesBatch = o.batchType === activeBatch || (!o.batchType && activeBatch === 'Morning');
            return matchesBatch && !o.assignedAgentId && o.status !== 'Delivered';
        }),
        [orders, activeBatch],
    );

    const activeOrders = useMemo(
        () => orders.filter((o) => o.assignedAgentId && o.status !== 'Delivered'),
        [orders]
    );

    const handleAssign = async (agentId: string) => {
        if (selectedOrders.length === 0) return;
        setIsAssigning(true);
        try {
            await Promise.all(
                selectedOrders.map(orderId => updateOrderStatus(orderId, 'Batch Processing', { assignedAgentId: agentId }))
            );
            setSelectedOrders([]);
        } finally {
            setIsAssigning(false);
        }
    };

    const autoAssign = async () => {
        setIsAssigning(true);
        try {
            if (activeAgents.length === 0) {
                alert('No active agents available. Please wait for agents to go active.');
                return;
            }
            const available = getAssignableOrders(unassignedOrders);
            for (const order of available) {
                const selected = getNextAgent(activeAgents, order);
                if (!selected) break;
                await updateOrderStatus(order.orderId, 'Batch Processing', { assignedAgentId: selected.agentId });
            }
            setSelectedOrders([]);
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="p-6 md:p-10 w-full h-full space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Order Assignment Console</h1>

            <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="flex gap-3">
                    <button className={`px-6 py-2 rounded-full font-semibold ${activeBatch === 'Morning' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800 border'}`} onClick={() => setActiveBatch('Morning')}>Morning Batch</button>
                    <button className={`px-6 py-2 rounded-full font-semibold ${activeBatch === 'Evening' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800 border'}`} onClick={() => setActiveBatch('Evening')}>Evening Batch</button>
                </div>
                <button onClick={autoAssign} disabled={isAssigning || unassignedOrders.length === 0} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:bg-emerald-300 font-bold">{isAssigning ? 'Assigning...' : 'Auto Assign Active Orders'}</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold uppercase">Unassigned Orders ({activeBatch})</div>
                    <div className="divide-y">
                        {unassignedOrders.length === 0 ? <p className="p-4 text-sm font-bold text-gray-700">No unassigned orders.</p> : unassignedOrders.map((order) => (
                            <div key={order.orderId} className="p-4 flex items-center gap-4">
                                <input type="checkbox" checked={selectedOrders.includes(order.orderId)} onChange={(e) => setSelectedOrders((prev) => e.target.checked ? [...prev, order.orderId] : prev.filter(id => id !== order.orderId))} />
                                <div className="flex-1">
                                    <div className="font-extrabold">{order.orderId}</div>
                                    <div className="text-sm font-semibold text-gray-700">{order.deliveryAddress.area} · ₹{order.totalAmount}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold uppercase">Active Agents</div>
                    <div className="p-2 space-y-2">
                        {activeAgents.length === 0 ? <p className="p-2 text-sm font-bold text-amber-600">No active agents. Admin will wait for agents to go active.</p> : activeAgents.map((agent) => (
                            <div key={agent.agentId} className="p-3 rounded-lg border bg-emerald-50 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">{agent.name}</div>
                                    <div className="text-xs text-gray-800">{agent.vehicleNo}</div>
                                </div>
                                <button onClick={() => handleAssign(agent.agentId)} disabled={selectedOrders.length === 0 || isAssigning} className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:bg-emerald-300">Assign</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="bg-gray-50 p-4 border-b text-sm font-semibold uppercase">Active Orders ({activeOrders.length})</div>
                <div className="divide-y">
                    {activeOrders.length === 0 ? <p className="p-4 text-sm font-bold text-gray-700">No active assigned orders.</p> : activeOrders.slice(0, 20).map((order) => (
                        <div key={order.orderId} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-extrabold">{order.orderId}</p>
                                <p className="text-sm font-semibold text-gray-800">{order.deliveryAddress.area}</p>
                            </div>
                            <p className="text-xs font-black uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded">{order.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
