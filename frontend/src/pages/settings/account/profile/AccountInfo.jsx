import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/stores/userStore';

const AccountInfo = () => {
    const { userProfile } = useUserStore();
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(timer);
    }, []);

    if (!userProfile) return null;

    const theme = userProfile.settings?.theme || {};
    const timezone = userProfile.settings?.timezone || 'UTC';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const formatTimezoneTime = (tz) => {
        try {
            return new Date().toLocaleTimeString('en-US', {
                timeZone: tz || 'UTC',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return new Date().toLocaleTimeString('en-US', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-foreground">
                    Account Details
                </h3>
                <p className="text-xs text-muted-foreground">
                    System status, regional preferences, and membership details.
                </p>
            </div>

            <Separator className="bg-border-subtle" />

            <div className="divide-y divide-border-subtle">
                {/* 1. Account Status */}
                <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Account Status</p>
                        <p className="text-[11px] text-muted-foreground">Your authorization and access standing</p>
                    </div>
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                            Active
                        </span>
                    </div>
                </div>

                {/* 2. Member Since */}
                <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Member Since</p>
                        <p className="text-[11px] text-muted-foreground">Account registration date</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                            {formatDate(userProfile.createdAt)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Last Updated at {formatRelativeTime(userProfile.updatedAt)}
                        </p>
                    </div>
                </div>

                {/* 3. Timezone */}
                <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Timezone</p>
                        <p className="text-[11px] text-muted-foreground">Workspace operating time</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium text-foreground">{timezone}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{formatTimezoneTime(timezone)}</p>
                    </div>
                </div>

                {/* 4. Plan & Theme */}
                <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Plan & Theme</p>
                        <p className="text-[11px] text-muted-foreground">Subscription tier and theme</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-foreground capitalize">
                            {theme.tier || 'Free'} Tier • {theme.mode || 'Dark'}
                        </span>
                        <Link
                            to="/settings/system/appearance"
                            className="text-xs font-medium text-primary hover:underline ml-1"
                        >
                            Change
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;