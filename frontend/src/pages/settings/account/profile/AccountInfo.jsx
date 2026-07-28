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
        if (!status) return <Badge variant="secondary">Active</Badge>;

        switch (status.toLowerCase()) {
            case 'active':
                return <Badge className="bg-green-500 text-white">Active</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
            case 'suspended':
                return <Badge variant="destructive">Suspended</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
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
                return <Crown className="h-4 w-4 text-primary" />;
            default:
                return <Leaf className="h-4 w-4 text-primary" />;
        }
    };

    if (!userProfile) return null;

    const theme = userProfile.settings?.theme || {};
    const timezone = userProfile.settings?.timezone || 'UTC';

    return (
        <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">

            {/* HEADER */}
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Account Information
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Profile details & system settings
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">

                {/* USER ID + COPY (CORE FOCUS) */}
                <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        User ID
                    </span>

                    <div
                        className="flex items-center justify-between gap-2 
                        px-3 py-2.5 rounded-xl border border-border/50 
                        bg-muted/20 transition-all duration-150"
                    >
                        <code className="text-sm font-mono text-foreground truncate pr-2">
                            {userProfile._id || 'N/A'}
                        </code>

                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                                ${copied
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-background/60 hover:bg-background"
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

                <Separator className="bg-border/40" />

                {/* STATUS */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Status
                    </span>
                    {getAccountStatusBadge(userProfile.status)}
                </div>

                <Separator className="bg-border/40" />

                {/* TIMELINE */}
                <div className="space-y-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Timeline
                    </span>

                    <div className="space-y-2 pl-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Created
                            </span>
                            <div className="text-right">
                                <div className="text-foreground text-sm">
                                    {formatDate(userProfile.createdAt)}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {formatRelativeTime(userProfile.createdAt)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Updated
                            </span>
                            <div className="text-right">
                                <div className="text-foreground text-sm">
                                    {formatDate(userProfile.updatedAt)}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {formatRelativeTime(userProfile.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/40" />

                {/* THEME */}
                <div className="space-y-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Theme
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border bg-muted/20">
                            <div className="text-xs text-muted-foreground mb-1">
                                Mode
                            </div>
                            <div className="text-sm capitalize">
                                {theme.mode || 'Light'}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl border bg-muted/20">
                            <div className="text-xs text-muted-foreground mb-1">
                                Tier
                            </div>
                            <div className="text-sm capitalize flex items-center gap-1">
                                {getThemeTierIcon(theme.tier)}
                                {theme.tier || 'Free'}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/40" />

                {/* TIMEZONE */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Timezone
                    </span>

                    <div className="text-right">
                        <div className="text-sm">{timezone}</div>
                        <div className="text-xs text-muted-foreground">
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