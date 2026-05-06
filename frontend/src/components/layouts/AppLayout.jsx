import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
// 1. Import the TooltipProvider
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppLayout() {
    return (
        /* 2. Wrap everything in the TooltipProvider */
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    <Sidebar />
                    <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        <TopNavbar />
                        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
                            <Outlet />
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}