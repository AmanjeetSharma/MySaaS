import { CheckCheck, BellDot } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getNotificationMeta, formatRelativeTime } from '../helper/notification.helper.js';

export function NotificationItem({
    notification,
    isSelected,
    onToggleSelect,
    onMarkRead,
}) {
    const { _id, title, message, type, createdAt, read } = notification;
    const { icon: EventIcon } = getNotificationMeta(type);

    const displayTitle = title || 'Untitled Notification';
    const displayMessage = message || '';
    const relativeTime = formatRelativeTime(createdAt);

    const handleRowClick = () => {
        if (!read && onMarkRead) {
            onMarkRead([_id]);
        }
    };

    return (
        <div
            role={!read ? 'button' : undefined}
            tabIndex={!read ? 0 : undefined}
            onClick={handleRowClick}
            onKeyDown={(e) => {
                if (!read && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleRowClick();
                }
            }}
            className={cn(
                'group flex min-h-[58px] items-center justify-between gap-2.5 px-3 py-2.5 sm:min-h-[66px] sm:gap-3.5 sm:px-4 sm:py-3 transition-colors select-none',
                read
                    ? 'bg-transparent text-muted-foreground hover:bg-hover/40 cursor-default'
                    : 'bg-surface-elevated/40 text-foreground hover:bg-hover/60 cursor-pointer',
                isSelected && 'bg-selected/20 hover:bg-selected/25'
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                {/* Checkbox: Unread only */}
                <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!read ? (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(_id)}
                            aria-label={`Select ${displayTitle}`}
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:border-primary/70 transition-colors cursor-pointer"
                        />
                    ) : (
                        <div className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                    )}
                </div>

                {/* Event Icon */}
                <div
                    className={cn(
                        'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        read
                            ? 'border-border-subtle bg-surface-sunken text-muted-foreground/60'
                            : 'border-primary/25 bg-primary/10 text-primary'
                    )}
                >
                    <EventIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                {/* Content Hierarchy */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p
                        className={cn(
                            'truncate text-xs sm:text-sm leading-snug',
                            read ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
                        )}
                    >
                        {displayTitle}
                    </p>

                    {displayMessage && (
                        <p className="truncate text-[11px] sm:text-xs leading-snug text-subtle-foreground">
                            {displayMessage}
                        </p>
                    )}
                </div>
            </div>

            {/* Timestamp, Separator & Status aligned together */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-subtle-foreground">
                {relativeTime && (
                    <span className="tabular-nums">{relativeTime}</span>
                )}

                <Separator
                    orientation="vertical"
                    className="h-2.5 sm:h-3 w-px bg-border-strong select-none"
                />

                <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center">
                    {read ? (
                        <CheckCheck
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70"
                            aria-label="Read"
                        />
                    ) : (
                        <BellDot
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary animate-pulse cursor-pointer"
                            aria-label="Unread"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}