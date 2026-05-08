import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Globe, Bell } from 'lucide-react';
import { toast } from 'sonner';

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
    const [localNotifications, setLocalNotifications] = useState(notifications || { email: false, inApp: false });
    const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
    const [isNotificationsUpdating, setIsNotificationsUpdating] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (timezone) setLocalTimezone(timezone);
    }, [timezone]);

    useEffect(() => {
        if (notifications) setLocalNotifications(notifications);
    }, [notifications]);

    const handleTimezoneChange = async (newTimezone) => {
        setLocalTimezone(newTimezone);
        setIsTimezoneUpdating(true);
        try {
            await updateTimezone(newTimezone);
            toast.success('Timezone updated successfully', {
                icon: <Globe className="h-4 w-4 text-primary" />,
                duration: 2000
            });
        } catch (error) {
            setLocalTimezone(timezone);
            toast.error(error.message || 'Failed to update timezone');
        } finally {
            setIsTimezoneUpdating(false);
        }
    };

    const handleNotificationChange = async (key, value) => {
        const updated = { ...localNotifications, [key]: value };
        setLocalNotifications(updated);
        setIsNotificationsUpdating(true);
        try {
            await updateNotifications(updated);
            toast.success('Notification preferences saved', {
                icon: <Bell className="h-4 w-4 text-primary" />,
                duration: 2000
            });
        } catch (error) {
            setLocalNotifications(notifications);
            toast.error(error.message || 'Failed to update notifications');
        } finally {
            setIsNotificationsUpdating(false);
        }
    };

    const timezones = [
        'Asia/Kolkata',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Singapore',
        'Australia/Sydney',
        'Africa/Johannesburg',
        'America/Sao_Paulo'
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Preferences</h1>
                <p className="text-muted-foreground mt-2 text-base">
                    Manage your regional settings and notification delivery.
                </p>
            </div>

            <div className="space-y-6">
                {/* Timezone Settings */}
                <Card className="border-border/50 shadow-sm overflow-hidden backdrop-blur-sm bg-card/95">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Globe className="h-5 w-5 text-primary" />
                            Localization
                        </CardTitle>
                        <CardDescription className="text-base">
                            Set your preferred timezone for accurate timestamps across the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-2">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-foreground">Timezone</Label>
                                <p className="text-sm text-muted-foreground">
                                    Current local time: <span className="font-medium text-foreground ml-1">
                                        {new Date().toLocaleString('en-US', { timeZone: localTimezone, hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </span>
                                </p>
                            </div>
                            <Select
                                value={localTimezone}
                                onValueChange={handleTimezoneChange}
                                disabled={isTimezoneUpdating}
                            >
                                <SelectTrigger className="w-full sm:w-[280px] bg-background border-border/50 shadow-sm">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {timezones.map((tz) => (
                                        <SelectItem key={tz} value={tz} className="cursor-pointer">
                                            {tz.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Settings */}
                <Card className="border-border/50 shadow-sm overflow-hidden backdrop-blur-sm bg-card/95">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications
                        </CardTitle>
                        <CardDescription className="text-base">
                            Choose what you want to be notified about and how.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="email-notifs">
                                    Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive daily summaries and critical alerts directly to your inbox.
                                </p>
                            </div>
                            <Switch
                                id="email-notifs"
                                checked={localNotifications.email}
                                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                disabled={isNotificationsUpdating}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <Separator className="bg-border/40 my-2" />

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="inapp-notifs">
                                    In-App Alerts
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Show visual indicators and toasts while you are actively using the application.
                                </p>
                            </div>
                            <Switch
                                id="inapp-notifs"
                                checked={localNotifications.inApp}
                                onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
                                disabled={isNotificationsUpdating}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Preferences;