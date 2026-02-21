import { AgentProfile, Order } from '@/types';

export const getAssignableOrders = (orders: Order[]) =>
  orders.filter((o) => !o.assignedAgentId && o.status !== 'Delivered');

export const getNextAgent = (activeAgents: AgentProfile[], order: Order) => {
  if (activeAgents.length === 0) return null;
  const seed = order.orderId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return activeAgents[seed % activeAgents.length];
};
