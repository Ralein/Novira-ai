"use client"
import { auth } from '@/configs/firebaseConfig';
import { AuthContext } from '@/context/AuthContext';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react'

interface AuthContextType {
    user: User | null;
    authLoading: boolean;
}

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setAuthLoading(false);
        });

        return () => unsubscribe(); // Cleanup
    }, []);

    return (
        <AuthContext.Provider value={{ user, authLoading }}>
            <div>
                {children}
            </div>
        </AuthContext.Provider>
    )
}

// Custom hook to use auth
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return {
        user: context.user,
        authLoading: context.authLoading
    };
};

export default Provider
