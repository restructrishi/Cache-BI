import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from './AuthContext';

interface AuthGuardProps {
    allowedRoles?: UserRole[];
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Loading state - could be a spinner
        return <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="animate-pulse text-muted-foreground font-medium">Loading session...</div>
        </div>;
    }

    if (!isAuthenticated) {
        // Redirect to appropriate login based on attempted route path
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Unauthorized role
        if (user.role === 'viewer') {
            return <Navigate to="/home" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
