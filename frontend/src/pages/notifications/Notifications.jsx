import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bell, BellRing, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import { NotificationItem } from './components/NotificationItem';
import { filterNotifications } from './helper/notification.helper.js';

function NotificationSkeleton() {
    return (
        <div className="flex min-h-16.5 items-center gap-3.5 px-4 py-3">
            <Skeleton className="h-4 w-4 shrink-0 rounded bg-border-subtle" />
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-border-subtle" />
            <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-1/3 rounded bg-border-subtle" />
                <Skeleton className="h-3 w-2/3 rounded bg-border-subtle" />
            </div>
        </div>
    );
}

export default function Notifications() {
    const notifications = useNotificationStore((s) => s.notifications);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const hasMore = useNotificationStore((s) => s.hasMore);
    const isLoading = useNotificationStore((s) => s.isLoading);
    const isUpdating = useNotificationStore((s) => s.isUpdating);

    const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
    const markSelectedRead = useNotificationStore((s) => s.markSelectedRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const deleteSelected = useNotificationStore((s) => s.deleteSelected);
    const deleteAll = useNotificationStore((s) => s.deleteAll);

    const [activeTab, setActiveTab] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        fetchNotifications({ append: false });
    }, [fetchNotifications]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchNotifications({ append: true });
        }
    }, [fetchNotifications, isLoading, hasMore]);

    const counts = useMemo(() => {
        let unread = 0;
        let read = 0;
        for (const n of notifications) {
            if (n.read) read++;
            else unread++;
        }
        return { all: notifications.length, unread, read };
    }, [notifications]);

    const currentList = useMemo(
        () => filterNotifications(notifications, activeTab),
        [notifications, activeTab]
    );

    // Only unread notifications are eligible for checkbox selection
    const selectableUnreadIds = useMemo(
        () => currentList.filter((item) => !item.read).map((item) => item._id),
        [currentList]
    );

    const isAllSelected =
        selectableUnreadIds.length > 0 &&
        selectableUnreadIds.every((id) => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(selectableUnreadIds));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleBulkMarkRead = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setSelectedIds(new Set());
        await markSelectedRead(ids);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setSelectedIds(new Set());
        await deleteSelected(ids);
    };

    const isInitialLoad = isLoading && notifications.length === 0;

    return (
        <div className="flex w-full flex-col gap-5 pb-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                        <BellRing className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 border-transparent bg-primary/20 px-1.5 text-[11px] font-medium text-primary"
                                >
                                    {unreadCount} new
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Stay up to date with activity across your workspace.
                        </p>
                    </div>
                </div>

                {/* Direct Global Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllRead()}
                                disabled={isUpdating}
                                className="h-8 gap-1.5 border-border bg-surface-elevated text-xs font-medium text-foreground hover:bg-hover hover:text-foreground cursor-pointer"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                Mark all as read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAll()}
                            disabled={isUpdating}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {/* Notification Surface Container */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg shadow-black/40">
                {/* Filter & Toolbar Area */}
                <div className="flex h-11 items-center justify-between border-b border-border bg-surface-sunken px-3">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5">
                        {[
                            { id: 'all', label: 'All', count: counts.all },
                            { id: 'unread', label: 'Unread', count: counts.unread },
                            { id: 'read', label: 'Read', count: counts.read },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSelectedIds(new Set());
                                    }}
                                    className={`relative flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all duration-150 ${isActive
                                            ? 'border-primary/50 bg-card text-foreground shadow-xs'
                                            : 'border-border-subtle bg-surface-sunken/60 text-muted-foreground hover:border-border hover:bg-hover/60 hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-[11px] tabular-nums ${isActive
                                                ? 'font-semibold text-primary'
                                                : 'text-subtle-foreground'
                                            }`}
                                    >
                                        ({tab.count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Conditional Selection Toolbar */}
                    {selectableUnreadIds.length > 0 && (
                        <div className="flex items-center gap-3">
                            {/* Appears when multiple checkboxes are selected */}
                            {selectedIds.size > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-foreground">
                                        {selectedIds.size} selected
                                    </span>
                                    <Separator orientation="vertical" className="h-3.5 bg-border" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBulkMarkRead}
                                        disabled={isUpdating}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Mark as read
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isUpdating}
                                        className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                        Delete marked
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none hover:text-foreground">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all unread notifications"
                                        className="h-4 w-4 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary cursor-pointer"
                                    />
                                    <span>Select all</span>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications Content */}
                {isInitialLoad ? (
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <NotificationSkeleton key={i} />
                        ))}
                    </div>
                ) : currentList.length > 0 ? (
                    <>
                        <div className="divide-y divide-border/60">
                            {currentList.map((notification) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    isSelected={selectedIds.has(notification._id)}
                                    onToggleSelect={toggleSelectOne}
                                    onMarkRead={markSelectedRead}
                                />
                            ))}
                        </div>

                        {/* Infinite Scroll / Pagination Load More */}
                        {hasMore && (
                            <div className="flex justify-center border-t border-border/40 py-3 bg-surface-sunken/40">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        'Load more'
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyMedia>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-sunken text-muted-foreground">
                                    <Bell className="h-5 w-5 opacity-60" />
                                </div>
                            </EmptyMedia>
                            <EmptyTitle className="text-sm font-semibold text-foreground">
                                {activeTab === 'unread'
                                    ? 'No unread notifications'
                                    : activeTab === 'read'
                                        ? 'No read notifications'
                                        : 'No notifications found'}
                            </EmptyTitle>
                            <EmptyDescription className="text-xs text-muted-foreground">
                                {activeTab === 'unread'
                                    ? "You're all caught up with your workspace activity."
                                    : 'Notifications will appear here as activity occurs.'}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </div>
    );
}