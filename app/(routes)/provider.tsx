"use client"
import React, { useEffect } from 'react'
import { useAuthContext } from '../provider';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import axios from "axios";
import AppHeader from '../_components/AppHeader';
import { AppSidebar } from '../_components/AppSidebar';
import { Loader2 } from 'lucide-react';

function DashboardProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { user, authLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                checkUser();
            } else {
                router.replace('/');
            }
        }
    }, [user, authLoading, router]);


    const checkUser = async () => {
        if (user) {
            await axios.post('/api/user', {
                userName: user.displayName,
                userEmail: user.email
            });
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }


    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full'>
                <AppHeader />
                {/* <SidebarTrigger /> */}
                <div className='p-10'>{children}</div>
            </main>
        </SidebarProvider>

    )
}

export default DashboardProvider