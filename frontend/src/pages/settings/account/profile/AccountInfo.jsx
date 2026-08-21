import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    Palette,
    Globe,
    Shield,
    Crown,
    Leaf,
    Check,
    Copy,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

const AccountInfo = () => {
    const { userProfile } = useUserStore();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (!userProfile?._id) return;
            await navigator.clipboard.writeText(userProfile._id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const getAccountStatusBadge = (status) => {
        if (!status) return <Badge className="border-border-subtle bg-secondary text-secondary-foreground">Active</Badge>;

        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="border border-success/20 bg-success/10 text-success">Active</Badge>;
            case 'pending':
                return <Badge className="border border-warning/20 bg-warning/10 text-warning">Pending</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="bg-destructive text-destructive-foreground">Suspended</Badge>;
            case 'inactive':
                return <Badge variant="outline" className="border-border-subtle bg-surface-sunken text-subtle-foreground">Inactive</Badge>;
            default:
                return <Badge className="border-border-subtle bg-secondary text-secondary-foreground">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const getThemeTierIcon = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'pro':
                return <Crown className="h-4 w-4 text-warning" />;
            default:
                return <Leaf className="h-4 w-4 text-success" />;
        }
    };

    if (!userProfile) return null;

    const theme = userProfile.settings?.theme || {};
    const timezone = userProfile.settings?.timezone || 'UTC';

    return (
        <Card className="border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl overflow-hidden">

            {/* HEADER */}
            <CardHeader className="pb-4 border-b border-border-subtle bg-surface-sunken/40">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <CardTitle className="font-heading text-base font-semibold text-foreground">
                            Account Information
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 text-subtle-foreground">
                            Profile details & system settings
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">

                {/* USER ID + COPY */}
                <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-subtle-foreground font-semibold">
                        User ID
                    </span>

                    <div
                        className="flex items-center justify-between gap-2 
                        px-3 py-2.5 rounded-xl border border-border-subtle 
                        bg-surface transition-all duration-150"
                    >
                        <code className="text-sm font-mono text-foreground truncate pr-2">
                            {userProfile._id || 'N/A'}
                        </code>

                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs
                                ${copied
                                    ? "bg-success/15 text-success border border-success/20"
                                    : "bg-secondary text-secondary-foreground border border-border-subtle hover:bg-hover hover:text-hover-foreground active:scale-95"
                                }
                            `}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <Separator className="bg-border-subtle" />

                {/* STATUS */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-subtle-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-subtle-foreground" />
                        Status
                    </span>
                    {getAccountStatusBadge(userProfile.status)}
                </div>

                <Separator className="bg-border-subtle" />

                {/* TIMELINE */}
                <div className="space-y-3">
                    <span className="text-sm font-semibold text-subtle-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-subtle-foreground" />
                        Timeline
                    </span>

                    <div className="space-y-2 pl-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-subtle-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Created
                            </span>
                            <div className="text-right">
                                <div className="text-foreground font-medium text-sm">
                                    {formatDate(userProfile.createdAt)}
                                </div>
                                <div className="text-subtle-foreground text-xs">
                                    {formatRelativeTime(userProfile.createdAt)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-subtle-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Updated
                            </span>
                            <div className="text-right">
                                <div className="text-foreground font-medium text-sm">
                                    {formatDate(userProfile.updatedAt)}
                                </div>
                                <div className="text-subtle-foreground text-xs">
                                    {formatRelativeTime(userProfile.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border-subtle" />

                {/* THEME */}
                <div className="space-y-3">
                    <span className="text-sm font-semibold text-subtle-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4 text-subtle-foreground" />
                        Theme
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-border-subtle bg-surface">
                            <div className="text-xs text-subtle-foreground mb-1">
                                Mode
                            </div>
                            <div className="text-sm font-medium text-foreground capitalize">
                                {theme.mode || 'Light'}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl border border-border-subtle bg-surface">
                            <div className="text-xs text-subtle-foreground mb-1">
                                Tier
                            </div>
                            <div className="text-sm font-medium text-foreground capitalize flex items-center gap-1.5">
                                {getThemeTierIcon(theme.tier)}
                                {theme.tier || 'Free'}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border-subtle" />

                {/* TIMEZONE */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-subtle-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-subtle-foreground" />
                        Timezone
                    </span>

                    <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{timezone}</div>
                        <div className="text-xs text-subtle-foreground">
                            {new Date().toLocaleTimeString('en-US', {
                                timeZone: timezone,
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default AccountInfo;