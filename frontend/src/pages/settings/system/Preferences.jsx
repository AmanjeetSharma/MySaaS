import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { timezones } from "@/config/timezone.config";

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

    // Separate loading states
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (

        <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-5">

            {/* Header */}
            <div className="space-y-1">

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Preferences
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground">
                    Customize your workspace experience and notifications.
                </p>

            </div>

            {/* Main Grid */}
            <div className="grid gap-4">

                {/* Localization */}
                <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden rounded-2xl">

                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">

                        <div className="flex items-center gap-3">

                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">

                                <Globe className="h-5 w-5 text-primary" />

                            </div>

                            <div>

                                <CardTitle className="text-base sm:text-lg font-semibold">
                                    Localization
                                </CardTitle>

                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Configure timezone and regional preferences.
                                </CardDescription>

                            </div>

                        </div>

                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Timezone
                                </Label>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                    <Clock3 className="h-4 w-4" />

                                    <span>Local Time :</span>

                                    <span className="font-medium text-foreground">

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

                                <SelectTrigger className="w-full lg:w-65 h-11 rounded-xl border-border/50 bg-background/60 backdrop-blur-md">

                                    <SelectValue placeholder="Select timezone" />

                                </SelectTrigger>

                                <SelectContent className="max-h-70">

                                    {timezones.map((tz) => (

                                        <SelectItem
                                            key={tz}
                                            value={tz}
                                            className="cursor-pointer"
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
                <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden rounded-2xl">

                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">

                        <div className="flex items-center gap-3">

                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">

                                <Bell className="h-5 w-5 text-primary" />

                            </div>

                            <div>

                                <CardTitle className="text-base sm:text-lg font-semibold">
                                    Notifications
                                </CardTitle>

                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Manage alerts and notification delivery.
                                </CardDescription>

                            </div>

                        </div>

                    </CardHeader>

                    <CardContent className="p-2 sm:p-3">

                        {/* Email Notifications */}
                        <div className="flex items-start justify-between gap-4 rounded-xl p-3 sm:p-4 hover:bg-muted/30 transition-all">

                            <div className="space-y-1 flex-1">

                                <Label className="text-sm font-medium">
                                    Email Notifications
                                </Label>

                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Receive important updates, reminders, and summaries via email.
                                </p>

                            </div>

                            <Switch
                                checked={localNotifications.email}
                                onCheckedChange={handleEmailNotificationChange}
                                disabled={isEmailNotificationsUpdating}
                                className="mt-1 cursor-pointer"
                            />

                        </div>

                        <Separator className="bg-border/40" />

                        {/* In-App Notifications */}
                        <div className="flex items-start justify-between gap-4 rounded-xl p-3 sm:p-4 hover:bg-muted/30 transition-all">

                            <div className="space-y-1 flex-1">

                                <Label className="text-sm font-medium">
                                    In-App Alerts
                                </Label>

                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Show real-time alerts and activity updates while using the app.
                                </p>

                            </div>

                            <Switch
                                checked={localNotifications.inApp}
                                onCheckedChange={handleInAppNotificationChange}
                                disabled={isInAppNotificationsUpdating}
                                className="mt-1 cursor-pointer"
                            />

                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>

    );
};

export default Preferences;