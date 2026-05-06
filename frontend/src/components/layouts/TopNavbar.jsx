import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';
import { Separator } from '@/components/ui/separator';

export function TopNavbar() {
    const { user } = useAuthStore();

    return (
        <header className="flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Link 
                    to="/dashboard" 
                    className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
                >
                    MySaaS
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {/* Order: OrgSwitcher -> Avatar/Profile (inside ProfileDropdown usually) */}
                <OrganizationSwitcher />
                <div className="h-8 w-px bg-border mx-1" />
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}