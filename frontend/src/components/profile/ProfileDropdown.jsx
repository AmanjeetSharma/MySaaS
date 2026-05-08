import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import {
  User,
  Palette,
  Sliders,
  AlertCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';

const menuItemClass =
  'group flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent cursor-pointer';

export function ProfileDropdown() {
  const navigate = useNavigate();

  const { logout } = useAuthStore();
  const { userProfile } = useUserStore();

  const initials =
    userProfile?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      action: () => navigate('/settings/account/profile'),
    },
    {
      label: 'Appearance',
      icon: Palette,
      action: () => navigate('/settings/system/appearance'),
    },
    {
      label: 'Preferences',
      icon: Sliders,
      action: () => navigate('/settings/system/preferences'),
    },
    {
      label: 'Manage Sessions',
      icon: AlertCircle,
      action: () => navigate('/settings/account/sessions'),
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'rounded-full outline-none cursor-pointer',
            'transition-transform duration-200',
            'hover:scale-[1.03]',
            'focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <Avatar
            className={cn(
              'h-10 w-10',
              'ring-1 ring-border/60',
              'shadow-sm',
              'bg-background'
            )}
          >
            <AvatarImage
              src={userProfile?.avatar?.url}
              className="object-cover"
            />

            <AvatarFallback className="bg-muted text-xs font-medium">
              {userProfile?.avatar?.url ? <User className="h-4 w-4 text-muted-foreground" /> : (
                initials
              )}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          'w-64 rounded-xl border bg-background/95 p-2',
          'backdrop-blur-xl shadow-2xl'
        )}
      >
        <DropdownMenuLabel className="px-2 py-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-none">
              {userProfile?.name || 'User'}
            </p>

            <p className="text-xs text-muted-foreground truncate">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.action}
                className={menuItemClass}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />

                  <span>{item.label}</span>
                </div>

                <ChevronRight
                  className="
                    h-4 w-4 text-muted-foreground/60
                    opacity-0 transition-opacity
                    group-hover:opacity-100
                  "
                />
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className={cn(
            menuItemClass,
            'text-red-500 focus:text-red-500 cursor-pointer',
          )}
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}