import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDrawer } from '../MobileDrawer';
import { TopNavbarNotification } from './TopNavbarNotification';
import { OrganizationDropdown } from './OrganizationDropdown';

export function TopNavbar() {
    const { user } = useAuthStore();
    const isMobile = useIsMobile();

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-border bg-surface/95 px-3 sm:px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-surface/75 text-surface-foreground shadow-xs">
            {/* Left Section */}
            <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0 min-w-0">
                {isMobile ? (
                    <MobileDrawer>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 md:hidden hover:bg-hover hover:text-hover-foreground active:bg-active p-0"
                        >
                            <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        </Button>
                    </MobileDrawer>
                ) : null}

                <Link
                    to="/dashboard"
                    className="font-heading text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground hover:opacity-85 transition-opacity shrink-0"
                >
                    MySaaS
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 min-w-0 shrink-0">
                <OrganizationDropdown />

                <TopNavbarNotification />

                {/* Divider */}
                <div className="h-5 w-px bg-border-subtle hidden md:block" />

                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}