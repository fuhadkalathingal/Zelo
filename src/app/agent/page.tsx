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
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, IndianRupee, Star, ThumbsUp, MapPin, Phone, Car, Edit2, CheckCircle2, Package, Clock } from 'lucide-react';

const defaultForm: Omit<AgentApplication, 'uid' | 'status' | 'appliedAt'> = {
  name: '', phone: '', email: '', dob: '', city: '', zone: '',
  vehicleType: 'Bike', vehicleNo: '', licenseNo: '', emergencyContact: '', hasSmartphone: true,
};

export default function AgentPage() {
  const user = useAuthStore((s) => s.user);
  const { orders, updateOrderStatus } = useOrderStore();
  const { agents, updateAgent } = useAgentStore();

  const me = useMemo(() => agents.find((a) => a.uid === user?.uid), [agents, user]);

  const myActiveOrders = useMemo(() => orders.filter((o) => o.assignedAgentId === me?.agentId && o.status !== 'Delivered'), [orders, me]);
  const myPastOrders = useMemo(() => orders.filter((o) => o.assignedAgentId === me?.agentId && o.status === 'Delivered').sort((a, b) => new Date(b.deliveredAt || b.createdAt).getTime() - new Date(a.deliveredAt || a.createdAt).getTime()), [orders, me]);

  const [application, setApplication] = useState<AgentApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');

  const [editProfile, setEditProfile] = useState(false);
  const [editVehicle, setEditVehicle] = useState(me?.vehicleNo || '');
  const [editPhone, setEditPhone] = useState(me?.phone || '');

  useEffect(() => {
    if (!user || user.role === 'agent') return;
    setLoadingApplication(true);
    const unsub = onSnapshot(doc(db, 'agent_applications', user.uid), (snap) => {
      if (snap.exists()) setApplication(snap.data() as AgentApplication);
      else setApplication(null);
      setLoadingApplication(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (me && !editVehicle) setEditVehicle(me.vehicleNo);
    if (me && !editPhone) setEditPhone(me.phone);
  }, [me]);

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
    if (next) await autoAssignOrders();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'agent_applications', user.uid), {
        ...form, uid: user.uid, status: 'pending', appliedAt: new Date().toISOString(),
        name: form.name || user.name || '', phone: form.phone || user.phone || '', email: form.email || user.email || '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = async () => {
    if (!me) return;
    setIsSubmitting(true);
    try {
      await updateAgent(me.agentId, { vehicleNo: editVehicle, phone: editPhone });
      setEditProfile(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] p-6 flex flex-col items-center justify-center text-center gap-6 bg-gray-50">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
          <Car className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Join Zelo Delivery</h1>
          <p className="text-gray-600 font-semibold mt-2 max-w-sm mx-auto">Register with your Google account to start earning today.</p>
        </div>
        <Link href="/login?redirect=/agent" className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-95">Register with Google</Link>
      </div>
    );
  }

  if (user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agent Application</h1>
              <p className="text-sm font-semibold text-gray-600 mt-1">Complete your profile to start delivering.</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <img src={user.photoURL || '/default-avatar.png'} alt="Profile" className="w-6 h-6 rounded-full" />
              <span className="text-xs font-bold text-gray-800">{user.name}</span>
            </div>
          </div>

          {loadingApplication ? <p className="text-sm font-bold text-gray-700 animate-pulse">Checking application status...</p> : null}

          {application?.status === 'pending' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-black text-amber-900 text-lg">Application Under Review</h3>
              <p className="text-sm font-semibold text-amber-700 max-w-sm mx-auto">Your details have been submitted to the admin team. We will notify you once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">REGISTERED NAME</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">PHONE NUMBER</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">EMAIL ADDRESS</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">DATE OF BIRTH</label><input required type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">CITY</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">PREFERRED ZONE</label><input required value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Area/Zone" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">VEHICLE TYPE</label><select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value as AgentApplication['vehicleType'] })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"><option>Bike</option><option>Scooter</option><option>Cycle</option></select></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">VEHICLE NUMBER</label><input required value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} placeholder="Ex: KL 11 AB 1234" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">LICENSE NUMBER</label><input required value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="License ID" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <div className="space-y-1.5"><label className="text-xs font-extrabold text-gray-600 ml-1">EMERGENCY CONTACT</label><input required value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Spouse/Parent Phone" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>

              <label className="md:col-span-2 text-sm font-bold text-gray-800 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition"><input type="checkbox" checked={form.hasSmartphone} onChange={(e) => setForm({ ...form, hasSmartphone: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /> I confirm I have a working smartphone with internet access.</label>
              <button disabled={isSubmitting} className="md:col-span-2 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-black mt-2 transition-colors">{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // AGENT DASHBOARD 
  const totalDeliveries = me?.totalDeliveries || myPastOrders.length;
  const rating = me?.rating || 4.9;
  const earnings = (me?.totalEarnings) || (myPastOrders.length * (me?.payoutPerDelivery || 50));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-gray-900 text-white px-5 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Agent Portal</h1>
            <p className="text-gray-400 text-sm font-semibold">{me?.name}</p>
          </div>
          <button onClick={handleToggleStatus} className={`relative flex items-center justify-between w-20 h-10 rounded-full p-1 transition-colors duration-300 shadow-inner ${me?.isActive ? 'bg-emerald-500' : 'bg-gray-700'}`}>
            <span className={`absolute text-[10px] font-black uppercase text-white ${me?.isActive ? 'left-3' : 'right-3'}`}>{me?.isActive ? 'ON' : 'OFF'}</span>
            <motion.div layout className="w-8 h-8 bg-white rounded-full shadow-md z-10" animate={{ x: me?.isActive ? 40 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
        </div>

        {/* Floating Quick Stats */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
            <IndianRupee className="w-5 h-5 text-emerald-400 mb-2" />
            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-0.5">Earnings</span>
            <span className="text-xl font-black text-white tracking-tight">₹{earnings}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-blue-400 mb-2" />
            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-0.5">Delivered</span>
            <span className="text-xl font-black text-white tracking-tight">{totalDeliveries}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
            <Star className="w-5 h-5 text-amber-400 mb-2" />
            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-0.5">Rating</span>
            <span className="text-xl font-black text-white tracking-tight">{rating}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-full shadow-sm border border-gray-100 p-1.5 flex text-sm font-bold">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2.5 rounded-full transition-colors ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 rounded-full transition-colors ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>History</button>
          <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2.5 rounded-full transition-colors ${activeTab === 'profile' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>Profile</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="db" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Active Duty ({myActiveOrders.length})</h2>
                {me?.isActive && myActiveOrders.length === 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-pulse">Scanning for orders...</span>}
              </div>

              {myActiveOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-900 font-black text-lg">No Ongoing Deliveries</h3>
                  <p className="text-gray-600 text-sm font-semibold mt-1">Stay active in your zone to receive orders.</p>
                </div>
              ) : (
                myActiveOrders.map(order => (
                  <Link href={`/order/${order.orderId}`} key={order.orderId} className="block bg-white rounded-3xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-transform hover:-translate-y-1">
                    <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded">{order.status}</span>
                      <span className="text-xs font-black text-emerald-800 tracking-tight">{order.orderId}</span>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-gray-900" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Delivering To</p>
                          <p className="font-bold text-gray-900 leading-snug">{order.customerName}</p>
                          <p className="text-sm text-gray-700 font-semibold">{order.deliveryAddress.flat}, {order.deliveryAddress.area}, {order.deliveryAddress.landmark}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Amount</span>
                            <span className="font-black text-gray-900">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Type</span>
                            <span className={`font-black ${order.paymentMethod === 'COD' ? 'text-amber-600' : 'text-emerald-600'}`}>{order.paymentMethod}</span>
                          </div>
                        </div>
                        <button className="bg-gray-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-colors">Start Ride</button>
                      </div>
                    </div>
                  </Link>
                ))
              )}

              {/* Mock Feedback */}
              <h2 className="text-lg font-black text-gray-900 tracking-tight mt-8 mb-4 px-1">Recent Feedback</h2>
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm mb-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center"><ThumbsUp className="w-5 h-5 text-orange-500" /></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">"Very fast delivery, polite agent!"</p>
                    <p className="text-xs text-gray-500 font-semibold">Today • Customer ID: 9482</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="hist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-black text-lg text-gray-900">Past Deliveries</h2>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">Showing your {myPastOrders.length} completed orders.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {myPastOrders.length === 0 ? <p className="p-8 text-center font-bold text-gray-500">No past deliveries found.</p> :
                  myPastOrders.map(order => (
                    <div key={order.orderId} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-sm text-gray-900 mb-1">{order.orderId}</p>
                        <p className="text-xs font-semibold text-gray-600">{order.deliveryAddress.area}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">{new Date(order.deliveredAt || order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 rounded mb-2 w-fit">Delivered</span>
                        <p className="font-black text-gray-900">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="prof" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="font-black text-xl text-gray-900">Agent Profile</h2>
                  {!editProfile && <button onClick={() => setEditProfile(true)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><Edit2 className="w-4 h-4 text-gray-700" /></button>}
                </div>

                {editProfile ? (
                  <div className="space-y-4 relative z-10">
                    <div><label className="text-xs font-extrabold text-gray-600 uppercase tracking-widest ml-1 mb-1.5 block">Mobile Number</label><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white outline-none" /></div>
                    <div><label className="text-xs font-extrabold text-gray-600 uppercase tracking-widest ml-1 mb-1.5 block">Vehicle Number</label><input value={editVehicle} onChange={(e) => setEditVehicle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white outline-none uppercase" /></div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditProfile(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                      <button onClick={saveProfile} disabled={isSubmitting} className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700">{isSubmitting ? 'Saving...' : 'Save Details'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border"><Phone className="w-4 h-4 text-gray-600" /></div>
                      <div><p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">Mobile Number</p><p className="font-bold text-gray-900">{me?.phone}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border"><Car className="w-4 h-4 text-gray-600" /></div>
                      <div><p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">Vehicle Details</p><p className="font-bold text-gray-900 uppercase">{me?.vehicleNo}</p></div>
                    </div>
                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border"><IndianRupee className="w-4 h-4 text-gray-600" /></div>
                      <div><p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-0.5">Payout Plan</p><p className="font-bold text-gray-900 uppercase">₹{me?.payoutPerDelivery || 50} per delivery</p></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
