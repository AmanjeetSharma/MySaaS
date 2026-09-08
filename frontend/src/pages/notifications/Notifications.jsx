import { useState, useMemo } from 'react';
import { Bell, BellRing, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import { NotificationItem } from './components/NotificationItem';
import { filterNotifications } from './helper/notification.helper';

export default function Notifications() {
    const notifications = useNotificationStore((state) => state.notifications) || [];
    const unreadCount = useNotificationStore((state) => state.unreadCount) ?? 0;
    const markAllRead = useNotificationStore((state) => state.markAllRead);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const removeNotification = useNotificationStore((state) => state.removeNotification);
    const clearAll = useNotificationStore((state) => state.clearAll);

    const [activeTab, setActiveTab] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

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

    const isAllSelected =
        currentList.length > 0 && currentList.every((item) => selectedIds.has(item._id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(currentList.map((item) => item._id)));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleBulkMarkRead = () => {
        selectedIds.forEach((id) => markAsRead?.(id));
        setSelectedIds(new Set());
    };

    const handleBulkDelete = () => {
        selectedIds.forEach((id) => removeNotification(id));
        setSelectedIds(new Set());
    };

    const handleConfirmClearAll = () => {
        clearAll();
        setSelectedIds(new Set());
        setIsConfirmingClear(false);
    };

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
                                    className="h-5 border-transparent bg-primary/20 px-1.5 text-[11px] font-medium text-primary hover:bg-primary/25"
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

                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllRead}
                                className="h-8 gap-1.5 border-border bg-surface-elevated text-xs font-medium text-foreground hover:bg-hover hover:text-foreground"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                Mark all as read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmingClear(true)}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {/* Safe Clear Confirmation */}
            {isConfirmingClear && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs">
                    <div className="flex flex-col">
                        <span className="font-medium text-destructive">
                            Clear all notifications?
                        </span>
                        <span className="text-muted-foreground">
                            This will permanently remove all notifications from your list.
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleConfirmClearAll}
                            className="h-7 px-2.5 text-xs"
                        >
                            Confirm
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsConfirmingClear(false)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Panel Surface: Uses elevated surface, border-strong & subtle inner contrast */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg shadow-black/40">
                {/* Filter & Bulk Bar */}
                <div className="flex h-11 items-center justify-between border-b border-border bg-surface-sunken px-3">
                    <div className="flex items-center gap-1">
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
                                    className={`relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-card text-foreground border border-border/80 shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-[11px] tabular-nums ${
                                            isActive
                                                ? 'text-primary font-semibold'
                                                : 'text-muted-foreground/80'
                                        }`}
                                    >
                                        ({tab.count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Bulk Selection Bar */}
                    {currentList.length > 0 && (
                        <div className="flex items-center gap-3">
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
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Mark read
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none hover:text-foreground">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                        className="h-4 w-4 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                    />
                                    <span>Select all</span>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Rows */}
                {currentList.length > 0 ? (
                    <div className="divide-y divide-border/60">
                        {currentList.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                isSelected={selectedIds.has(notification._id)}
                                onToggleSelect={toggleSelectOne}
                                onMarkRead={(id) => markAsRead?.(id)}
                            />
                        ))}
                    </div>
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