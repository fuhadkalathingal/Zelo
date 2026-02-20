import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['agent']}>
            {children}
        </ProtectedRoute>
    );
}
