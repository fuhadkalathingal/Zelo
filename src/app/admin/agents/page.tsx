"use client";

import { useState } from 'react';
import { useAgentStore } from '@/store/useAgentStore';
import { AgentApplication, AgentProfile } from '@/types';
import { Plus, Search, X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';

import { useOrderStore } from '@/store/useOrderStore';

export default function AdminAgentsPage() {
    const { agents, addAgent, updateAgent, deleteAgent, loading } = useAgentStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [validAgentUids, setValidAgentUids] = useState<string[]>([]);
    const [pendingApplications, setPendingApplications] = useState<AgentApplication[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('role', '==', 'agent'));
        const unsub = onSnapshot(q, (snapshot) => {
            setValidAgentUids(snapshot.docs.map(d => d.id));
        });

        const qApps = query(collection(db, 'agent_applications'));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
            setPendingApplications(snapshot.docs.map(d => ({ ...d.data() } as AgentApplication)).filter((app) => app.status === 'pending'));
        });

        return () => {
            unsub();
            unsubApps();
        };
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        uid: '',
        name: '',
        phone: '',
        vehicleNo: '',
        isActive: false,
        payoutPerDelivery: 50
    });

    const filteredAgents = agents.filter(a => {
        const hasRole = validAgentUids.includes(a.uid);
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.uid.toLowerCase().includes(searchTerm.toLowerCase());
        return hasRole && matchesSearch;
    });

    const openAddModal = () => {
        setEditingAgent(null);
        setFormData({ uid: '', name: '', phone: '', vehicleNo: '', isActive: false, payoutPerDelivery: 50 });
        setIsModalOpen(true);
    };

    const openEditModal = (agent: AgentProfile) => {
        setEditingAgent(agent);
        setFormData({
            uid: agent.uid,
            name: agent.name,
            phone: agent.phone,
            vehicleNo: agent.vehicleNo,
            isActive: agent.isActive,
            payoutPerDelivery: agent.payoutPerDelivery || 50
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to permanently remove ${name} from the fleet? Their account will be downgraded to "customer".`)) {
            await deleteAgent(id);
        }
    };

    const toggleStatus = async (agent: AgentProfile) => {
        const newStatus = !agent.isActive;
        await updateAgent(agent.agentId, { isActive: newStatus });

        const { orders, updateOrderStatus } = useOrderStore.getState();

        if (newStatus) {
            // Agent is now Online - Assign them all pending unassigned orders
            const unassignedOrders = orders.filter(o => !o.assignedAgentId && o.status !== 'Delivered');
            for (const order of unassignedOrders) {
                await updateOrderStatus(order.orderId, 'Batch Processing', { assignedAgentId: agent.agentId });
            }
        } else {
            // Agent is now Offline - Reassign their active orders to someone else
            const activeAgents = useAgentStore.getState().agents.filter(a => a.isActive && a.agentId !== agent.agentId && validAgentUids.includes(a.uid));
            const agentPendingOrders = orders.filter(o => o.assignedAgentId === agent.agentId && o.status !== 'Delivered');

            for (const order of agentPendingOrders) {
                if (activeAgents.length > 0) {
                    const fallbackAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
                    await updateOrderStatus(order.orderId, 'Batch Processing', { assignedAgentId: fallbackAgent.agentId });
                } else {
                    await updateOrderStatus(order.orderId, 'Placed', { assignedAgentId: null });
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: AgentProfile = {
                agentId: formData.uid, // Using User UID as Document/Agent ID for 1:1 mapping
                uid: formData.uid,
                name: formData.name,
                phone: formData.phone,
                vehicleNo: formData.vehicleNo,
                isActive: formData.isActive,
                payoutPerDelivery: Number(formData.payoutPerDelivery)
            };

            if (editingAgent) {
                await updateAgent(editingAgent.agentId, payload);
            } else {
                await addAgent(payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Error saving agent. Please check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const approveApplication = async (app: AgentApplication) => {
        if (!confirm(`Approve ${app.name} as a Delivery Agent?`)) return;
        setIsSubmitting(true);
        try {
            const payload: AgentProfile = {
                agentId: app.uid,
                uid: app.uid,
                name: app.name,
                phone: app.phone,
                vehicleNo: app.vehicleNo,
                isActive: false,
                payoutPerDelivery: 50
            };
            await addAgent(payload);
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            await updateDoc(doc(db, 'agent_applications', app.uid), { status: 'approved', reviewedAt: new Date().toISOString() });
        } catch (error) {
            console.error("Failed to approve application", error);
            alert("Error approving logic.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-10 w-full h-full relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff & Agents</h1>
                    <p className="text-gray-700 font-medium">Manage your {agents.length} delivery fleet members.</p>
                </div>
                <button onClick={openAddModal} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Onboard Agent
                </button>
            </div>

            {pendingApplications.length > 0 && (
                <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-3xl p-6">
                    <h2 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Pending Applications ({pendingApplications.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingApplications.map(app => (
                            <div key={app.uid} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex flex-col gap-3">
                                <div>
                                    <h3 className="font-extrabold text-gray-900">{app.name}</h3>
                                    <p className="text-xs font-bold text-gray-700 mb-1">{app.phone} · {app.city}</p>
                                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mt-2">Veh: {app.vehicleNo}</p>
                                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mt-1">DL: {app.licenseNo}</p>
                                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mt-1">Zone: {app.zone}</p>
                                </div>
                                <button onClick={() => approveApplication(app)} disabled={isSubmitting} className="w-full mt-auto py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm">
                                    {isSubmitting ? 'Approving...' : 'Approve & Create Agent'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6 relative max-w-xl">
                <Search className="w-5 h-5 text-gray-700 absolute left-3 top-3.5" />
                <input
                    type="text"
                    placeholder="Search agents by Name or UID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map((agent, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={agent.agentId}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col gap-4 relative overflow-hidden group"
                        >
                            {/* Status Bar */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${agent.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>

                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm ${agent.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{agent.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest truncate max-w-[120px]" title={agent.uid}>{agent.uid}</p>
                                    </div>
                                </div>
                                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <button onClick={() => openEditModal(agent)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(agent.agentId, agent.name)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 mt-2 border border-gray-200">
                                <div>
                                    <p className="text-[10px] uppercase font-extrabold text-gray-800 tracking-widest mb-1">Vehicle No</p>
                                    <p className="font-bold text-sm text-gray-800">{agent.vehicleNo}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-extrabold text-gray-800 tracking-widest mb-1">Phone</p>
                                    <p className="font-bold text-sm text-gray-800">{agent.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-extrabold text-gray-800 tracking-widest mb-1">Status</p>
                                    <p className={`font-black text-sm ${agent.isActive ? 'text-emerald-600' : 'text-gray-700'}`}>
                                        {agent.isActive ? '🟢 Online' : '⚪ Offline'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-extrabold text-gray-800 tracking-widest mb-1">Payout Rate</p>
                                    <p className="font-bold text-sm text-gray-800">₹{agent.payoutPerDelivery || 50}/order</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto pt-2">
                                <button onClick={() => toggleStatus(agent)} className={`flex-1 border text-sm font-bold py-2.5 rounded-lg shadow-sm transition-colors ${agent.isActive ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>
                                    {agent.isActive ? 'Force Offline' : 'Mark Online'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {!loading && filteredAgents.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="font-bold text-gray-700">No agents found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="text-xl font-black text-gray-900">
                                    {editingAgent ? 'Edit Agent Profile' : 'Onboard New Agent'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">User UID *</label>
                                    <input disabled={!!editingAgent} placeholder="e.g. U7x2R..." required type="text" value={formData.uid} onChange={(e) => setFormData({ ...formData, uid: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50" />
                                    {!editingAgent && <p className="text-[10px] text-gray-700 mt-1">This must be the exact Firebase UID of the registered customer to elevate their role.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name *</label>
                                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Phone Number *</label>
                                        <input required type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Vehicle Number *</label>
                                        <input required type="text" value={formData.vehicleNo} onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Payout Per Order (₹) *</label>
                                        <input required type="number" min="0" value={formData.payoutPerDelivery} onChange={(e) => setFormData({ ...formData, payoutPerDelivery: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="col-span-2 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                                            <span className="font-bold text-sm text-gray-800">Immediately Start as &quot;Online&quot;</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:active:scale-100 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md">
                                        {isSubmitting ? 'Saving...' : 'Save Agent'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
