import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDrawer } from './MobileDrawer';

export function TopNavbar() {
    const { user } = useAuthStore();
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4">
                {isMobile ? (
                    <MobileDrawer>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </MobileDrawer>
                ) : null}

                <Link
                    to="/dashboard"
                    className="text-lg md:text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                >
                    MySaaS
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/notifications')}
                    className="group relative h-10 w-10 rounded-xl transition-all active:scale-90"
                    aria-label="View notifications"
                >
                    <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />

                    {/* Pulsing Dot */}
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-background bg-primary animate-pulse" />
                </Button>

                {/* Divider */}
                <div className="h-7 w-px bg-border hidden md:block" />

                <ProfileDropdown user={user} />

            </div>
        </header>
    );
}