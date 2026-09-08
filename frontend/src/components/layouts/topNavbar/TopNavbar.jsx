import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDrawer } from '../MobileDrawer';
import { TopNavbarNotification } from './TopNavbarNotification';

export function TopNavbar() {
    const { user } = useAuthStore();
    const isMobile = useIsMobile();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/95 px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-surface/75 text-surface-foreground shadow-xs">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4">
                {isMobile ? (
                    <MobileDrawer>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden hover:bg-hover hover:text-hover-foreground active:bg-active"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </MobileDrawer>
                ) : null}

                <Link
                    to="/dashboard"
                    className="font-heading text-lg md:text-xl font-bold tracking-tight text-foreground hover:opacity-85 transition-opacity"
                >
                    MySaaS
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
                <TopNavbarNotification />

                {/* Divider */}
                <div className="h-6 w-px bg-border-subtle hidden md:block" />

                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}