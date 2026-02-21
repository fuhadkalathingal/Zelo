import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { AgentProfile, UserRole } from '@/types';

interface AgentStore {
    agents: AgentProfile[];
    loading: boolean;
    initializeAgentsListener: () => () => void;
    addAgent: (agent: AgentProfile) => Promise<void>;
    updateAgent: (id: string, data: Partial<AgentProfile>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
    agents: [],
    loading: true,

    initializeAgentsListener: () => {
        const agentsRef = collection(db, 'agents');
        const unsubscribe = onSnapshot(agentsRef, (snapshot) => {
            const agentsData: AgentProfile[] = [];
            snapshot.forEach((doc) => {
                agentsData.push({ ...doc.data() } as AgentProfile);
            });

            set({ agents: agentsData, loading: false });
        }, (error) => {
            console.error("Error listening to agents: ", error);
            set({ loading: false });
        });

        return unsubscribe;
    },

    addAgent: async (agentData) => {
        const newDocRef = doc(db, 'agents', agentData.uid);
        await setDoc(newDocRef, agentData);

        // Elevate user role to agent
        const userRef = doc(db, 'users', agentData.uid);
        await updateDoc(userRef, { role: 'agent' as UserRole });
    },

    updateAgent: async (id, data) => {
        const docRef = doc(db, 'agents', id);
        await updateDoc(docRef, data);
    },

    deleteAgent: async (id) => {
        const docRef = doc(db, 'agents', id);
        await deleteDoc(docRef);

        // Revert user role to customer upon agent termination
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { role: 'customer' as UserRole });
    }
}));
