import { useState } from 'react';
import { CheckCheck, BellDot } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getNotificationMeta, formatRelativeTime } from '../helper/notification.helper.js';

export function NotificationItem({
    notification,
    isSelected,
    onToggleSelect,
    onMarkRead,
    style,
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { _id, title, message, type, createdAt, read } = notification;
    const { icon: EventIcon } = getNotificationMeta(type);

    const displayTitle = title || 'Untitled Notification';
    const displayMessage = message || '';
    const relativeTime = formatRelativeTime(createdAt);

    // Character limits: 100 for title, 300 for message
    const isLongContent = displayTitle.length > 55 || displayMessage.length > 90;

    const handleMarkAsRead = (e) => {
        e.stopPropagation();
        if (!read && onMarkRead) {
            onMarkRead([_id]);
        }
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
    };

    return (
        <div
            style={isExpanded ? { ...style, height: 'auto', minHeight: style?.height } : style}
            className={cn(
                'group flex items-start justify-between gap-2.5 px-3 py-2.5 sm:gap-3.5 sm:px-4 sm:py-3 transition-colors select-none border-b border-border/60',
                read
                    ? 'bg-transparent text-muted-foreground hover:bg-hover/40 cursor-default'
                    : 'bg-surface-elevated/40 text-foreground hover:bg-hover/60',
                isSelected && 'bg-selected/20 hover:bg-selected/25',
                isExpanded && 'z-10 bg-surface-elevated shadow-md'
            )}
        >
            <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
                {/* Checkbox: Unread only */}
                <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center pt-1 cursor-pointer"
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
                        'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5',
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
                            'text-xs sm:text-sm leading-snug break-words',
                            read ? 'font-normal text-muted-foreground' : 'font-medium text-foreground',
                            !isExpanded && 'truncate max-w-[95%]'
                        )}
                    >
                        {displayTitle}
                    </p>

                    {displayMessage && (
                        <div className="flex flex-col items-start gap-1">
                            <p
                                className={cn(
                                    'text-[11px] sm:text-xs leading-snug text-subtle-foreground break-words',
                                    !isExpanded && 'line-clamp-1 max-w-[95%]'
                                )}
                            >
                                {displayMessage}
                            </p>

                            {/* Read more toggle if text length demands it */}
                            {isLongContent && (
                                <button
                                    type="button"
                                    onClick={toggleExpand}
                                    className="cursor-pointer text-[10px] sm:text-[11px] font-medium text-primary hover:underline self-start"
                                >
                                    {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Meta Block */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-subtle-foreground pt-0.5">
                {/* Desktop hover trigger */}
                {!read && (
                    <div className="hidden sm:group-hover:flex items-center gap-1.5 sm:gap-2 transition-opacity duration-150">
                        <button
                            type="button"
                            onClick={handleMarkAsRead}
                            className="cursor-pointer font-medium text-primary hover:underline"
                        >
                            Mark as read
                        </button>
                        <Separator
                            orientation="vertical"
                            className="h-2.5 sm:h-3 w-px bg-border-strong select-none"
                        />
                    </div>
                )}

                {/* Timestamp */}
                {relativeTime && (
                    <span className="tabular-nums">{relativeTime}</span>
                )}

                <Separator
                    orientation="vertical"
                    className="h-2.5 sm:h-3 w-px bg-border-strong select-none"
                />

                {/* Status Indicator */}
                <div className="flex items-center justify-center">
                    {read ? (
                        <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center">
                            <CheckCheck
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70"
                                aria-label="Read"
                            />
                        </div>
                    ) : (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={handleMarkAsRead}
                                    aria-label="Mark as read"
                                    className="-m-2 flex h-8 w-8 sm:h-4 sm:w-4 sm:m-0 items-center justify-center cursor-pointer rounded-full active:bg-hover/60 transition-colors focus-visible:outline-none"
                                >
                                    <BellDot className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary animate-pulse pointer-events-none" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                sideOffset={6}
                                className="z-50 text-[11px]"
                            >
                                Mark as read
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
}