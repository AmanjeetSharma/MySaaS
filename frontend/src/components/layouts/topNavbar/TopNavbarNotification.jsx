import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNotificationStore } from '@/stores/notificationStore';

export function TopNavbarNotification() {
    const navigate = useNavigate();
    const unreadCount = useNotificationStore((state) => state.unreadCount);

    const hasUnread = unreadCount > 0;
    const label = hasUnread
        ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}`
        : 'Notifications';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/notifications')}
                    className="group relative h-10 w-10 rounded-xl transition-all hover:bg-hover hover:text-hover-foreground active:bg-active active:scale-95 cursor-pointer"
                    aria-label={label}
                >
                    <Bell className="h-5 w-5 text-subtle-foreground transition-colors group-hover:text-foreground" />

                    {hasUnread && (
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-surface bg-primary animate-pulse" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}