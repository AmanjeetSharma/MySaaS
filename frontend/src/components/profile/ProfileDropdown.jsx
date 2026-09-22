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
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';

const menuItemClass =
  'group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs sm:text-sm transition-colors hover:bg-accent focus:bg-accent cursor-pointer select-none';

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
      label: 'Security',
      icon: Shield,
      action: () => navigate('/settings/account/security'),
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'rounded-full outline-none cursor-pointer',
            'transition-transform duration-200',
            'hover:scale-[1.03] active:scale-95',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
          )}
          aria-label="User profile"
        >
          <Avatar
            className={cn(
              'h-8 w-8 sm:h-9 sm:w-9 shrink-0',
              'ring-1 ring-border/60',
              'shadow-xs',
              'bg-background'
            )}
          >
            <AvatarImage
              src={userProfile?.avatar?.url}
              className="object-cover"
            />

            <AvatarFallback className="bg-muted text-[11px] sm:text-xs font-medium">
              {userProfile?.avatar?.url ? initials : <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          'w-56 sm:w-60 rounded-xl border border-border bg-popover/95 p-1.5',
          'backdrop-blur-xl shadow-xl'
        )}
      >
        <DropdownMenuLabel className="px-2.5 py-2">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold leading-none text-foreground truncate">
              {userProfile?.name || 'User'}
            </p>

            <p className="text-[11px] text-muted-foreground truncate">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        <div className="py-0.5 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.action}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-foreground transition-colors" />

                  <span>{item.label}</span>
                </div>

                <ChevronRight
                  className="
                    h-3.5 w-3.5 text-muted-foreground/60
                    opacity-0 transition-opacity
                    group-hover:opacity-100
                  "
                />
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        <DropdownMenuItem
          onClick={logout}
          className={cn(
            menuItemClass,
            'text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive'
          )}
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Sign out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}