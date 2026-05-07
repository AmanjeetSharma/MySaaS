import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { TopNavbar } from './TopNavbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout() {
    const isMobile = useIsMobile();

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider defaultOpen={!isMobile}>
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    {!isMobile && <DesktopSidebar />}
                    <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        <TopNavbar />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
                            <div className="mx-auto max-w-400">
                                <Outlet />
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}