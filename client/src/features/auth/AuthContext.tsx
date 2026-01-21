import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'viewer' | 'admin';

export interface User {
    email: string;
    role: UserRole;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, role: UserRole) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('cache_bi_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, role: UserRole) => {
        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const newUser: User = {
            email,
            role,
            name: email.split('@')[0]
        };

        setUser(newUser);
        localStorage.setItem('cache_bi_user', JSON.stringify(newUser));

        if (role === 'admin') {
            navigate('/admin'); // Redirect admin to builder area
        } else {
            navigate('/home'); // Redirect viewer to dashboard home
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cache_bi_user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
