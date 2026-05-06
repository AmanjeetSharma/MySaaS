import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}