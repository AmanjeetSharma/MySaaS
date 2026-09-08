import {
    useState,
    useMemo,
    useEffect,
    useCallback,
} from 'react';
import {
    Bell,
    BellRing,
    CheckCheck,
    Loader2,
    Trash2,
} from 'lucide-react';
import { List } from 'react-window';

import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';

import { NotificationItem } from './components/NotificationItem';
import { filterNotifications } from './helper/notification.helper.js';

const NOTIFICATION_ROW_HEIGHT = 82;
const MIN_LIST_HEIGHT = 240;
const MAX_LIST_HEIGHT = 600;

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

function NotificationRow({
    index,
    style,
    notifications,
    selectedIds,
    onToggleSelect,
    onMarkRead,
}) {
    const notification = notifications[index];

    if (!notification) {
        return null;
    }

    return (
        <NotificationItem
            notification={notification}
            isSelected={selectedIds.has(notification._id)}
            onToggleSelect={onToggleSelect}
            onMarkRead={onMarkRead}
            style={style}
        />
    );
}

export default function Notifications() {
    const notifications = useNotificationStore((s) => s.notifications);
    const notificationCounts = useNotificationStore((s) => s.notificationCounts);
    const hasMore = useNotificationStore((s) => s.hasMore);
    const isLoading = useNotificationStore((s) => s.isLoading);
    const isUpdating = useNotificationStore((s) => s.isUpdating);

    const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
    const markSelectedRead = useNotificationStore((s) => s.markSelectedRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const deleteSelected = useNotificationStore((s) => s.deleteSelected);
    const deleteAll = useNotificationStore((s) => s.deleteAll);
    const clearAll = useNotificationStore((s) => s.clearAll);

    const [activeTab, setActiveTab] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
    const [isDeleteMarkedModalOpen, setIsDeleteMarkedModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications({ append: false });
        return () => {
            clearAll();
        };
    }, [fetchNotifications, clearAll]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchNotifications({ append: true });
        }
    }, [fetchNotifications, isLoading, hasMore]);

    const counts = useMemo(() => ({
        all: notificationCounts?.all ?? 0,
        unread: notificationCounts?.unread ?? 0,
        read: notificationCounts?.read ?? 0,
    }), [notificationCounts]);

    const currentList = useMemo(
        () => filterNotifications(notifications, activeTab),
        [notifications, activeTab]
    );

    const notificationListHeight = useMemo(() => {
        const contentHeight = currentList.length * NOTIFICATION_ROW_HEIGHT;
        return Math.min(
            Math.max(contentHeight, MIN_LIST_HEIGHT),
            MAX_LIST_HEIGHT
        );
    }, [currentList.length]);

    const selectableNotificationIds = useMemo(
        () => currentList.map((item) => item._id),
        [currentList]
    );

    const isAllSelected =
        selectableNotificationIds.length > 0 &&
        selectableNotificationIds.every((id) => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(new Set(selectableNotificationIds));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleBulkMarkRead = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setSelectedIds(new Set());
        await markSelectedRead(ids);
    };

    const handleConfirmDeleteMarked = async () => {
        if (selectedIds.size === 0) {
            setIsDeleteMarkedModalOpen(false);
            return;
        }
        const ids = Array.from(selectedIds);
        setSelectedIds(new Set());
        setIsDeleteMarkedModalOpen(false);
        await deleteSelected(ids);
    };

    const handleConfirmClearAll = async () => {
        await deleteAll();
        setIsClearAllModalOpen(false);
        setSelectedIds(new Set());
    };

    const isInitialLoad = isLoading && notifications.length === 0;

    return (
        <div className="flex w-full flex-col gap-4 pb-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                        <BellRing className="h-4.5 w-4.5" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Notifications
                            </h1>

                            {counts.unread > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 border-transparent bg-primary/20 px-1.5 text-[11px] font-medium text-primary"
                                >
                                    {counts.unread} new
                                </Badge>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Stay up to date with activity across your workspace.
                        </p>
                    </div>
                </div>

                {/* Global actions */}
                {counts.all > 0 && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {counts.unread > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllRead()}
                                disabled={isUpdating}
                                className="h-7.5 gap-1.5 border-border bg-surface-elevated px-2.5 text-xs font-medium text-foreground hover:bg-hover hover:text-foreground cursor-pointer"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Mark all read</span>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsClearAllModalOpen(true)}
                            disabled={isUpdating}
                            className="h-7.5 gap-1.5 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Clear all</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Clear all dialog */}
            <Dialog open={isClearAllModalOpen} onOpenChange={setIsClearAllModalOpen}>
                <DialogContent className="sm:max-w-106.25 border-border bg-surface-elevated">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Clear all notifications?
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Notifications will no longer be available.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs cursor-pointer"
                            onClick={() => setIsClearAllModalOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs cursor-pointer"
                            onClick={handleConfirmClearAll}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Clearing...' : 'Yes, clear all'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete marked dialog */}
            <Dialog open={isDeleteMarkedModalOpen} onOpenChange={setIsDeleteMarkedModalOpen}>
                <DialogContent className="sm:max-w-106.25 border-border bg-surface-elevated">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Delete Marked?
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Selected notis will no logner will be available
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs cursor-pointer"
                            onClick={() => setIsDeleteMarkedModalOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs cursor-pointer"
                            onClick={handleConfirmDeleteMarked}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Deleting...' : 'Delete marked'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Notification container */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg shadow-black/40">
                {/* Responsive Filter & Selection Header */}
                <div className="border-b border-border bg-surface-sunken">
                    <div className="flex flex-col gap-2 p-2 sm:h-11 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-0">
                        {/* Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                                        className={`relative flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'border-primary/50 bg-card text-foreground shadow-xs'
                                                : 'border-border-subtle bg-surface-sunken/60 text-muted-foreground hover:border-border hover:bg-hover/60 hover:text-foreground'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`text-[11px] tabular-nums ${
                                                isActive
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

                        {/* Selection & Batch Actions */}
                        {selectableNotificationIds.length > 0 && (
                            <div className="flex items-center justify-between gap-2.5 pt-1 sm:justify-end sm:pt-0">
                                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none hover:text-foreground">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all notifications"
                                        className="h-3.5 w-3.5 rounded border-border-strong bg-surface-sunken data-[state=checked]:border-primary data-[state=checked]:bg-primary cursor-pointer"
                                    />
                                    <span className="text-[11px] sm:text-xs">Select all</span>
                                </label>

                                {selectedIds.size > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <Separator orientation="vertical" className="h-3.5 bg-border" />
                                        <span className="text-[11px] font-medium text-foreground sm:text-xs">
                                            {selectedIds.size} selected
                                        </span>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBulkMarkRead}
                                            disabled={isUpdating}
                                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer sm:text-xs"
                                        >
                                            Mark read
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsDeleteMarkedModalOpen(true)}
                                            disabled={isUpdating}
                                            className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10 cursor-pointer sm:text-xs"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isInitialLoad ? (
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <NotificationSkeleton key={i} />
                        ))}
                    </div>
                ) : currentList.length > 0 ? (
                    <>
                        <div className="border-b border-border/40 bg-surface-elevated">
                            <List
                                style={{
                                    height: notificationListHeight,
                                    width: '100%',
                                }}
                                rowCount={currentList.length}
                                rowHeight={NOTIFICATION_ROW_HEIGHT}
                                overscanCount={4}
                                rowKey={(index) => currentList[index]?._id ?? index}
                                rowComponent={NotificationRow}
                                rowProps={{
                                    notifications: currentList,
                                    selectedIds,
                                    onToggleSelect: toggleSelectOne,
                                    onMarkRead: markSelectedRead,
                                }}
                            />
                        </div>

                        {hasMore && (
                            <div className="flex justify-center border-t border-border/40 bg-surface-sunken/40 py-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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