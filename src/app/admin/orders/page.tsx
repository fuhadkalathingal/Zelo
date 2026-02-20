"use client";

import { useState } from 'react';
import { AgentProfile, Order } from '@/types';

// Mock Data
const MOCK_AGENTS: AgentProfile[] = [
    { agentId: 'ag1', uid: 'user1', name: 'Ravi Kumar', phone: '9876543210', vehicleNo: 'KA-01-AB-1234', isActive: true },
    { agentId: 'ag2', uid: 'user2', name: 'Suresh Das', phone: '9876543211', vehicleNo: 'KA-02-CD-5678', isActive: false },
];

const MOCK_ORDERS = [
    { orderId: 'ORD-101', status: 'Placed', batchType: 'Morning', paymentMethod: 'COD', totalAmount: 450, deliveryAddress: { area: 'Indiranagar' } },
    { orderId: 'ORD-102', status: 'Placed', batchType: 'Morning', paymentMethod: 'UPI', totalAmount: 1200, deliveryAddress: { area: 'Koramangala' } },
] as Order[];

export default function AdminOrdersPage() {
    const [activeBatch, setActiveBatch] = useState<'Morning' | 'Evening'>('Morning');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const handleAssign = (agentId: string) => {
        alert(`Assigned ${selectedOrders.length} orders to agent ${agentId}`);
        setSelectedOrders([]);
    };

    return (
        <div className="p-6 md:p-10 w-full h-full">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Batch Operations Hub</h1>

            <div className="flex gap-4 mb-6">
                <button
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${activeBatch === 'Morning' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-600 border'}`}
                    onClick={() => setActiveBatch('Morning')}
                >☀️ Morning Batch</button>
                <button
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${activeBatch === 'Evening' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 border'}`}
                    onClick={() => setActiveBatch('Evening')}
                >🌙 Evening Batch</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Unassigned Orders ({activeBatch})
                    </div>
                    <div className="divide-y divide-gray-100">
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
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">{order.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-sm font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Agents</span>
                        {selectedOrders.length > 0 && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">Assign {selectedOrders.length}</span>}
                    </div>
                    <div className="p-2 space-y-2">
                        {MOCK_AGENTS.map(agent => (
                            <div key={agent.agentId} className={`p-3 rounded-lg border ${agent.isActive ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50 opacity-60'} flex justify-between items-center`}>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">{agent.name}</div>
                                    <div className="text-xs text-gray-500">{agent.vehicleNo}</div>
                                </div>
                                {agent.isActive && selectedOrders.length > 0 ? (
                                    <button
                                        onClick={() => handleAssign(agent.agentId)}
                                        className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded shadow-sm text-sm font-medium transition-colors"
                                    >
                                        Assign
                                    </button>
                                ) : (
                                    <div className={`w-3 h-3 rounded-full ${agent.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
