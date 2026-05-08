import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '@/stores';

export function ProfileDropdown() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { userProfile } = useUserStore();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none rounded-full">
          {userProfile?.avatar?.url ? (
            <Avatar
              className="
          h-10 w-10 cursor-pointer
          ring-1 ring-white/15
          bg-white/3
          shadow-md
          transition-all duration-200
          hover:ring-white/25
          hover:scale-[1.02]
        "
            >
              <AvatarImage
                src={userProfile?.avatar?.url}
                className="object-cover"
              />
              <AvatarFallback className="bg-transparent text-sm">
                {getInitials(userProfile?.name) || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="
          h-10 w-10 rounded-full
          ring-1 ring-white/15
          bg-white/3
          shadow-md
          flex items-center justify-center
          cursor-pointer
          transition-all duration-200
          hover:ring-white/25
          hover:scale-[1.02]
        "
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/settings/system')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}