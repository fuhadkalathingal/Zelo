"use client";

import { useState } from 'react';
import { AgentProfile } from '@/types';
import { Plus, Search, MapPin, Star, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

// Expanded Mock Agents
const MOCK_AGENTS: AgentProfile[] = [
    { agentId: 'ag1', uid: 'user1', name: 'Ravi Kumar', phone: '9876543210', vehicleNo: 'KA-01-AB-1234', isActive: true },
    { agentId: 'ag2', uid: 'user2', name: 'Suresh Das', phone: '9876543211', vehicleNo: 'KA-02-CD-5678', isActive: false },
    { agentId: 'ag3', uid: 'user3', name: 'Fuhad K.', phone: '9999999999', vehicleNo: 'KL-10-XY-9000', isActive: true },
];

export default function AdminAgentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgents = MOCK_AGENTS.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.agentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 w-full h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff & Agents</h1>
                    <p className="text-gray-500 font-medium">Manage your delivery fleet and monitor assignments.</p>
                </div>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Onboard Agent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={agent.agentId}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden group"
                    >
                        {/* Status Bar */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${agent.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>

                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm ${agent.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{agent.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{agent.agentId}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 mt-2 border border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Vehicle No</p>
                                <p className="font-bold text-sm text-gray-800">{agent.vehicleNo}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Phone</p>
                                <p className="font-bold text-sm text-gray-800">{agent.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Today's Jobs</p>
                                <p className="font-black text-emerald-600 text-lg leading-none">{agent.isActive ? '12/15' : '0/0'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest mb-1">Rating</p>
                                <p className="font-black text-gray-800 flex items-center gap-1"><Star className="w-4 h-4 text-orange-400 fill-orange-400" /> 4.9</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto pt-2">
                            <button className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-sm py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                View History
                            </button>
                            {agent.isActive ? (
                                <button className="flex-1 bg-red-50 text-red-600 border border-red-100 font-bold text-sm py-2.5 rounded-lg shadow-sm hover:bg-red-100 hover:border-red-200 transition-colors">
                                    Off Duty
                                </button>
                            ) : (
                                <button className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-sm py-2.5 rounded-lg shadow-sm hover:bg-emerald-100 hover:border-emerald-200 transition-colors">
                                    Mark Active
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
