"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAgentStore } from '@/store/useAgentStore';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentApplication } from '@/types';
import { getAssignableOrders, getNextAgent } from '@/lib/dispatch';

const defaultForm: Omit<AgentApplication, 'uid' | 'status' | 'appliedAt'> = {
  name: '',
  phone: '',
  email: '',
  dob: '',
  city: '',
  zone: '',
  vehicleType: 'Bike',
  vehicleNo: '',
  licenseNo: '',
  emergencyContact: '',
  hasSmartphone: true,
};

export default function AgentPage() {
  const user = useAuthStore((s) => s.user);
  const { orders, updateOrderStatus } = useOrderStore();
  const { agents, updateAgent } = useAgentStore();

  const me = useMemo(() => agents.find((a) => a.uid === user?.uid), [agents, user]);
  const myOrders = useMemo(() => orders.filter((o) => o.assignedAgentId === me?.agentId && o.status !== 'Delivered'), [orders, me]);

  const [application, setApplication] = useState<AgentApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!user || user.role === 'agent') return;
    setLoadingApplication(true);
    const unsub = onSnapshot(doc(db, 'agent_applications', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AgentApplication;
        setApplication(data);
      } else {
        setApplication(null);
      }
      setLoadingApplication(false);
    });

    return () => unsub();
  }, [user]);

  const autoAssignOrders = async () => {
    const activeAgents = agents.filter((a) => a.isActive);
    const unassigned = getAssignableOrders(orders);
    for (const order of unassigned) {
      const selectedAgent = getNextAgent(activeAgents, order);
      if (!selectedAgent) break;
      await updateOrderStatus(order.orderId, 'Batch Processing', { assignedAgentId: selectedAgent.agentId });
    }
  };

  const handleToggleStatus = async () => {
    if (!me) return;
    const next = !me.isActive;
    await updateAgent(me.agentId, { isActive: next });
    if (next) {
      await autoAssignOrders();
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'agent_applications', user.uid), {
        ...form,
        uid: user.uid,
        name: form.name || user.name || '',
        phone: form.phone || user.phone || '',
        email: form.email || user.email || '',
        status: 'pending',
        appliedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center gap-4 bg-gray-50">
        <h1 className="text-2xl font-black">Agent Login / Registration</h1>
        <p className="text-sm text-gray-800 font-semibold">Login to register as a delivery partner or continue as existing agent.</p>
        <Link href="/login?redirect=/agent" className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold">Login with Google</Link>
      </div>
    );
  }

  if (user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Delivery Agent Registration</h1>
              <p className="text-sm font-semibold text-gray-700">After registration, your profile will be sent to admin approval.</p>
            </div>
            <Link href="/login?redirect=/agent" className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">Existing agent login</Link>
          </div>

          {loadingApplication ? <p className="text-sm font-bold text-gray-700">Checking application status...</p> : null}

          {application?.status === 'pending' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-black text-amber-700">Your application is pending admin approval.</p>
              <p className="text-sm font-semibold text-amber-700/90 mt-1">You will be able to take orders after approval.</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="border rounded-xl px-4 py-3 font-semibold" />
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Preferred zone/area" className="border rounded-xl px-4 py-3 font-semibold" />
              <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value as AgentApplication['vehicleType'] })} className="border rounded-xl px-4 py-3 font-semibold">
                <option>Bike</option><option>Scooter</option><option>Cycle</option>
              </select>
              <input required value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} placeholder="Vehicle number" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="License number" className="border rounded-xl px-4 py-3 font-semibold" />
              <input required value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Emergency contact" className="border rounded-xl px-4 py-3 font-semibold" />
              <label className="md:col-span-2 text-sm font-semibold flex items-center gap-2"><input type="checkbox" checked={form.hasSmartphone} onChange={(e) => setForm({ ...form, hasSmartphone: e.target.checked })} /> I have a smartphone with internet</label>
              <button disabled={isSubmitting} className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black">{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Agent Order Desk</h1>
          <p className="text-sm font-semibold text-gray-700">Switch Active ON to receive automated order assignment.</p>
        </div>
        <button onClick={handleToggleStatus} className={`px-4 py-2 rounded-xl text-white font-black ${me?.isActive ? 'bg-emerald-600' : 'bg-gray-500'}`}>{me?.isActive ? 'Active' : 'Offline'}</button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border p-5">
        <h2 className="font-black text-lg mb-3">My Active Orders ({myOrders.length})</h2>
        {myOrders.length === 0 ? <p className="text-sm font-semibold text-gray-700">No active orders assigned yet.</p> : (
          <div className="space-y-3">
            {myOrders.map((order) => (
              <div key={order.orderId} className="border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-extrabold">{order.orderId}</p>
                  <p className="text-sm font-semibold text-gray-800">{order.deliveryAddress.area} · {order.paymentMethod}</p>
                </div>
                <span className="text-xs font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded">{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
