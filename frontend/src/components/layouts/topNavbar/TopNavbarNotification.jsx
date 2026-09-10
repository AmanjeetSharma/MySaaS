import { useState, useEffect, useRef } from 'react';
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

    const prevCountRef = useRef(unreadCount);
    const [isPersistentOpen, setIsPersistentOpen] = useState(false);
    const [open, setOpen] = useState(false);

    // Trigger persistent popup when a new notification arrives
    useEffect(() => {
        if (unreadCount > prevCountRef.current && unreadCount > 0) {
            setIsPersistentOpen(true);
            setOpen(true);
        }
        prevCountRef.current = unreadCount;
    }, [unreadCount]);

    const handleOpenChange = (nextOpen) => {
        // Once the user interacts (hovers or leaves), dis-engage the persistent state
        if (isPersistentOpen && !nextOpen) {
            setIsPersistentOpen(false);
        }
        setOpen(nextOpen);
    };

    return (
        <Tooltip open={open} onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setIsPersistentOpen(false);
                        setOpen(false);
                        navigate('/notifications');
                    }}
                    className="group relative h-9 w-9 shrink-0 rounded-xl transition-all hover:bg-hover hover:text-hover-foreground active:bg-active active:scale-95 cursor-pointer"
                    aria-label={label}
                >
                    {/* Ringing bell icon */}
                    <Bell
                        className={`h-4.5 w-4.5 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${hasUnread
                            ? 'text-foreground animate-[wiggle_1s_ease-in-out_infinite] origin-top'
                            : ''
                            }`}
                    />

                    {/* Glowing unread indicator */}
                    {hasUnread && (
                        <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/75 opacity-75 duration-1000" />
                            <span className="relative inline-flex h-2 w-2 rounded-full border-2 border-surface bg-primary shadow-xs" />
                        </span>
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                sideOffset={2}
                className="z-50 text-[11px] font-medium"
            >
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}