import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getNotificationMeta, formatRelativeTime } from '../helper/notification.helper.js';

export function NotificationItem({
    notification,
    isSelected,
    onToggleSelect,
    onMarkRead,
}) {
    const { _id, title, message, type, createdAt, read } = notification;
    const { icon: EventIcon, label: defaultCategoryLabel } = getNotificationMeta(type);

    const displayTitle = title || message;
    const categoryLabel = type ? type.replace(/_/g, ' ') : defaultCategoryLabel;
    const relativeTime = formatRelativeTime(createdAt);

    return (
        <div
            onClick={() => !read && onMarkRead?.(_id)}
            className={cn(
                'group flex min-h-[66px] cursor-pointer items-center justify-between gap-3.5 px-4 py-3 transition-colors',
                read
                    ? 'bg-transparent text-muted-foreground hover:bg-hover/50'
                    : 'bg-surface-elevated/40 text-foreground hover:bg-hover/70',
                isSelected && 'bg-selected/20'
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* High-visibility Checkbox */}
                <div
                    className="flex shrink-0 items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(_id)}
                        aria-label={`Select ${displayTitle}`}
                        className="h-4 w-4 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:border-primary/70 transition-colors"
                    />
                </div>

                {/* Event Icon with clear container border */}
                <div
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        read
                            ? 'border-border-subtle bg-surface-sunken text-muted-foreground'
                            : 'border-primary/25 bg-primary/10 text-primary'
                    )}
                >
                    <EventIcon className="h-4 w-4" />
                </div>

                {/* Hierarchy */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p
                        className={cn(
                            'truncate text-sm leading-snug',
                            read ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
                        )}
                    >
                        {displayTitle}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-subtle-foreground">
                        <span className="capitalize">{categoryLabel}</span>
                        {relativeTime && (
                            <>
                                <span>·</span>
                                <span className="tabular-nums">{relativeTime}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Unread Indicator */}
            <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                {!read && (
                    <span
                        aria-label="Unread"
                        className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
                    />
                )}
            </div>
        </div>
    );
}