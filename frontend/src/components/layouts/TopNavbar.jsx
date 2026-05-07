import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDrawer } from './MobileDrawer';

export function TopNavbar() {
    const { user } = useAuthStore();
    const isMobile = useIsMobile();

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
                {!isMobile && <OrganizationSwitcher />}
                <div className="h-6 w-px bg-border hidden md:block" />
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}