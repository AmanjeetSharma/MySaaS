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

import {
    getNotificationMeta,
    formatRelativeTime,
} from '../helper/notification.helper.js';

export function NotificationItem({
    notification,
    isSelected,
    onToggleSelect,
    onMarkRead,
    style,
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        _id,
        title,
        message,
        type,
        createdAt,
        read,
    } = notification;

    const { icon: EventIcon } = getNotificationMeta(type);

    const displayTitle = title || 'Untitled Notification';
    const displayMessage = message || '';
    const relativeTime = formatRelativeTime(createdAt);

    // Character limits
    const isLongContent =
        displayTitle.length > 55 || displayMessage.length > 90;

    // -------------------------------------------------------------------------
    // Row selection click handler
    // -------------------------------------------------------------------------
    const handleRowClick = () => {
        if (onToggleSelect) {
            onToggleSelect(_id);
        }
    };

    // -------------------------------------------------------------------------
    // Mark as read
    // -------------------------------------------------------------------------
    const handleMarkAsRead = (e) => {
        e.stopPropagation();

        if (!read && onMarkRead) {
            onMarkRead([_id]);
        }
    };

    // -------------------------------------------------------------------------
    // Expand / collapse
    // -------------------------------------------------------------------------
    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
    };

    return (
        <div
            style={style}
            role="button"
            tabIndex={0}
            onClick={handleRowClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick();
                }
            }}
            className={cn(
                'group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors select-none border-b border-border/60 min-h-16',

                read
                    ? 'bg-transparent text-muted-foreground hover:bg-hover/40'
                    : 'bg-surface-elevated/40 text-foreground hover:bg-hover/60',

                isSelected && 'bg-selected/20 hover:bg-selected/25',

                isExpanded && 'z-10 bg-surface-elevated shadow-md'
            )}
        >
            {/* Left content: Checkbox + Icon + Text */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* Checkbox (Click propagation stopped to avoid double-triggering) */}
                <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(_id)}
                        aria-label={`Select ${displayTitle}`}
                        className="h-4 w-4 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:border-primary/70 transition-colors"
                    />
                </div>

                {/* Event icon */}
                <div
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        read
                            ? 'border-border-subtle bg-surface-sunken text-muted-foreground/60'
                            : 'border-primary/25 bg-primary/10 text-primary'
                    )}
                >
                    <EventIcon className="h-4 w-4" />
                </div>

                {/* Text Hierarchy */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <p
                        className={cn(
                            'text-xs sm:text-sm leading-snug wrap-break-word',
                            read
                                ? 'font-normal text-muted-foreground'
                                : 'font-medium text-foreground',
                            !isExpanded && 'truncate max-w-[95%]'
                        )}
                    >
                        {displayTitle}
                    </p>

                    {displayMessage && (
                        <div className="flex flex-col items-start gap-0.5">
                            <p
                                className={cn(
                                    'text-[11px] sm:text-xs leading-snug text-subtle-foreground wrap-break-word',
                                    !isExpanded && 'line-clamp-1 max-w-[95%]'
                                )}
                            >
                                {displayMessage}
                            </p>

                            {isLongContent && (
                                <button
                                    type="button"
                                    onClick={toggleExpand}
                                    className="cursor-pointer text-[10px] sm:text-[11px] font-medium text-primary hover:underline"
                                >
                                    {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Meta: Hover action + Timestamp + Separator + BellDot/CheckCheck */}
            <div className="flex shrink-0 items-center gap-2 text-[11px] sm:text-xs text-subtle-foreground ml-3">
                {!read && (
                    <div className="hidden sm:group-hover:flex items-center gap-2 transition-opacity duration-150">
                        <button
                            type="button"
                            onClick={handleMarkAsRead}
                            className="cursor-pointer font-medium text-primary hover:underline leading-none"
                        >
                            Mark as read
                        </button>
                        <Separator
                            orientation="vertical"
                            className="h-3.5 w-px bg-border-strong select-none"
                        />
                    </div>
                )}

                {relativeTime && (
                    <span className="tabular-nums whitespace-nowrap leading-none">
                        {relativeTime}
                    </span>
                )}

                <Separator
                    orientation="vertical"
                    className="h-3.5 w-px bg-border-strong select-none"
                />

                <div className="flex h-5 w-5 items-center justify-center">
                    {read ? (
                        <CheckCheck
                            className="h-4 w-4 text-primary/70"
                            aria-label="Read"
                        />
                    ) : (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={handleMarkAsRead}
                                    aria-label="Mark as read"
                                    className="flex h-5 w-5 items-center justify-center cursor-pointer rounded-full active:bg-hover/60 transition-colors focus-visible:outline-none"
                                >
                                    <BellDot className="h-4 w-4 text-primary animate-pulse pointer-events-none" />
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