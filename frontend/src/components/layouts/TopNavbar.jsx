import { Link } from 'react-router-dom';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';

export function TopNavbar() {
    const { user } = useAuthStore();

    return (
        <header className="flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
            {/* Left side: Pure Branding */}
            <div className="flex items-center gap-2">
                <Link
                    to="/dashboard"
                    className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                >
                    MySaaS
                </Link>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
                <OrganizationSwitcher />
                <div className="h-6 w-px bg-border" />
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}