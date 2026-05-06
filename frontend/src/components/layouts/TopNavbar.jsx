import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useAuthStore } from '@/stores';

export function TopNavbar({ onMenuClick }) {
    const { user } = useAuthStore();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
                <OrganizationSwitcher />
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}