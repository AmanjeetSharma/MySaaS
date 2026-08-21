import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { TIMEZONES } from "@/constants/timezone.constant";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';

import {
    Loader2,
    Globe,
    Bell,
    Clock3
} from 'lucide-react';

const Preferences = () => {
    const {
        timezone,
        notifications,
        isLoading,
        fetchSettings,
        updateTimezone,
        updateNotifications
    } = useSettingsStore();

    const [localTimezone, setLocalTimezone] = useState(timezone || 'UTC');
    const [localNotifications, setLocalNotifications] = useState(
        notifications || {
            email: false,
            inApp: false
        }
    );

    const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
    const [isEmailNotificationsUpdating, setIsEmailNotificationsUpdating] = useState(false);
    const [isInAppNotificationsUpdating, setIsInAppNotificationsUpdating] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (timezone) {
            setLocalTimezone(timezone);
        }
    }, [timezone]);

    useEffect(() => {
        if (notifications) {
            setLocalNotifications(notifications);
        }
    }, [notifications]);

    // Timezone Handler
    const handleTimezoneChange = async (newTimezone) => {
        setLocalTimezone(newTimezone);
        setIsTimezoneUpdating(true);

        try {
            await updateTimezone(newTimezone);
        } catch (error) {
            setLocalTimezone(timezone);
        } finally {
            setIsTimezoneUpdating(false);
        }
    };

    // Email Notification Handler
    const handleEmailNotificationChange = async (checked) => {
        const updated = {
            ...localNotifications,
            email: checked
        };

        setLocalNotifications(updated);
        setIsEmailNotificationsUpdating(true);

        try {
            await updateNotifications(updated);
        } catch (error) {
            setLocalNotifications(notifications);
        } finally {
            setIsEmailNotificationsUpdating(false);
        }
    };

    // In-App Notification Handler
    const handleInAppNotificationChange = async (checked) => {
        const updated = {
            ...localNotifications,
            inApp: checked
        };

        setLocalNotifications(updated);
        setIsInAppNotificationsUpdating(true);

        try {
            await updateNotifications(updated);
        } catch (error) {
            setLocalNotifications(notifications);
        } finally {
            setIsInAppNotificationsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center animate-pulse font-semibold uppercase tracking-widest text-subtle-foreground/60 text-xs">
                Synchronizing Workspace...
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-5">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Preferences
                </h1>
                <p className="text-sm sm:text-base text-subtle-foreground">
                    Customize your workspace experience and notifications.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid gap-4">
                {/* Localization */}
                <Card className="border-border-subtle bg-surface-elevated shadow-xs overflow-hidden rounded-2xl text-surface-elevated-foreground">
                    <CardHeader className="pb-4 border-b border-border-subtle bg-surface-sunken/50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
                                    Localization
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-0.5 text-subtle-foreground">
                                    Configure timezone and regional preferences.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-subtle-foreground">
                                    Timezone
                                </Label>
                                <div className="flex items-center gap-2 text-sm text-subtle-foreground">
                                    <Clock3 className="h-4 w-4 shrink-0 text-accent" />
                                    <span>Local Time:</span>
                                    <span className="font-bold text-foreground">
                                        {new Date().toLocaleString('en-US', {
                                            timeZone: localTimezone,
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true
                                        })}
                                    </span>
                                </div>
                            </div>

                            <Select
                                value={localTimezone}
                                onValueChange={handleTimezoneChange}
                                disabled={isTimezoneUpdating}
                            >
                                <SelectTrigger className="w-full lg:w-64 h-10 rounded-xl border-border bg-surface text-foreground shadow-xs cursor-pointer focus-visible:ring-1 focus-visible:ring-ring">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="max-h-70 bg-popover text-popover-foreground border-border">
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem
                                            key={tz}
                                            value={tz}
                                            className="cursor-pointer hover:bg-hover hover:text-hover-foreground font-medium text-xs"
                                        >
                                            {tz.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border-subtle bg-surface-elevated shadow-xs overflow-hidden rounded-2xl text-surface-elevated-foreground">
                    <CardHeader className="pb-4 border-b border-border-subtle bg-surface-sunken/50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
                                    Notifications
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-0.5 text-subtle-foreground">
                                    Manage alerts and notification delivery.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-2 sm:p-3">
                        {/* Email Notifications */}
                        <div className="flex items-start justify-between gap-4 rounded-xl p-3 sm:p-4 hover:bg-hover/60 transition-all">
                            <div className="space-y-1 flex-1">
                                <Label className="text-sm font-semibold text-foreground">
                                    Email Notifications
                                </Label>
                                <p className="text-xs sm:text-sm text-subtle-foreground leading-relaxed">
                                    Receive important updates, reminders, and summaries via email.
                                </p>
                            </div>

                            <Switch
                                checked={localNotifications.email}
                                onCheckedChange={handleEmailNotificationChange}
                                disabled={isEmailNotificationsUpdating}
                                className="mt-1 cursor-pointer transition-all data-[state=checked]:bg-accent data-[state=checked]:shadow-md data-[state=checked]:shadow-accent/30 data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground"
                            />
                        </div>

                        <Separator className="bg-border-subtle my-1" />

                        {/* In-App Notifications */}
                        <div className="flex items-start justify-between gap-4 rounded-xl p-3 sm:p-4 hover:bg-hover/60 transition-all">
                            <div className="space-y-1 flex-1">
                                <Label className="text-sm font-semibold text-foreground">
                                    In-App Alerts
                                </Label>
                                <p className="text-xs sm:text-sm text-subtle-foreground leading-relaxed">
                                    Show real-time alerts and activity updates while using the app.
                                </p>
                            </div>

                            <Switch
                                checked={localNotifications.inApp}
                                onCheckedChange={handleInAppNotificationChange}
                                disabled={isInAppNotificationsUpdating}
                                className="mt-1 cursor-pointer transition-all data-[state=checked]:bg-accent data-[state=checked]:shadow-md data-[state=checked]:shadow-accent/30 data-[state=unchecked]:bg-muted-foreground/30 [&>span]:data-[state=checked]:bg-accent-foreground"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Preferences;