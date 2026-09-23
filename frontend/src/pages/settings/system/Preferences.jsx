import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { TIMEZONES } from '@/constants/timezone.constant';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Loader2,
    Globe,
    Bell,
    Mail,
    Clock3,
    Check,
    ChevronsUpDown
} from 'lucide-react';
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
    const [localNotifications, setLocalNotifications] = useState(
        notifications || {
            email: false,
            inApp: false
        }
    );

    const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
    const [timezoneSearchOpen, setTimezoneSearchOpen] = useState(false);
    const [isEmailNotificationsUpdating, setIsEmailNotificationsUpdating] = useState(false);
    const [isInAppNotificationsUpdating, setIsInAppNotificationsUpdating] = useState(false);
    const [, setTick] = useState(0);

    // Live clock ticker
    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

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
            toast.success('Timezone updated successfully');
        } catch {
            setLocalTimezone(timezone);
            toast.error('Failed to update timezone');
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
            toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
        } catch {
            setLocalNotifications(notifications);
            toast.error('Failed to update email notification preferences');
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
            toast.success(checked ? 'In-app alerts enabled' : 'In-app alerts disabled');
        } catch {
            setLocalNotifications(notifications);
            toast.error('Failed to update in-app alert preferences');
        } finally {
            setIsInAppNotificationsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center font-semibold text-xs uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
                Synchronizing Preferences...
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 bg-background text-foreground">
            {/* 1. Page Title Header */}
            <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Preferences
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Customize your workspace experience, operating timezone, and notification channels.
                </p>
            </div>

            <Separator className="bg-border-subtle" />

            {/* 2. Localization */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Localization & Time
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Set your primary operating timezone to align scheduling, timestamps, and reporting.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all duration-200 hover:border-border hover:bg-surface/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                <Globe className="h-4.5 w-4.5" />
                            </div>

                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-semibold text-foreground">
                                        Operating Timezone
                                    </Label>
                                    {isTimezoneUpdating && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            <span>Saving...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock3 className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                    <span>Current local time:</span>
                                    <span className="font-semibold text-foreground font-mono">
                                        {new Date().toLocaleString('en-US', {
                                            timeZone: localTimezone,
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                            hour12: true
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:w-72 shrink-0">
                            <Popover open={timezoneSearchOpen} onOpenChange={setTimezoneSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={timezoneSearchOpen}
                                        disabled={isTimezoneUpdating}
                                        className="h-9 w-full justify-between rounded-lg border-border bg-surface px-3 font-normal text-xs sm:text-sm text-foreground cursor-pointer hover:border-border-strong hover:bg-hover transition-all shadow-xs"
                                    >
                                        <span className="truncate">
                                            {localTimezone ? localTimezone.replace(/_/g, ' ') : 'Select timezone'}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-0 z-50 border-border bg-popover text-popover-foreground shadow-2xl rounded-xl"
                                    align="end"
                                >
                                    <Command className="bg-popover text-popover-foreground">
                                        <CommandInput placeholder="Search timezone..." className="h-9 text-xs" />
                                        <CommandList className="max-h-56 overflow-y-auto">
                                            <CommandEmpty className="py-3 text-center text-xs font-medium text-muted-foreground">
                                                No timezone found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {TIMEZONES.map((tz) => (
                                                    <CommandItem
                                                        key={tz}
                                                        value={tz}
                                                        onSelect={() => {
                                                            handleTimezoneChange(tz);
                                                            setTimezoneSearchOpen(false);
                                                        }}
                                                        className="text-xs font-medium cursor-pointer hover:bg-hover hover:text-hover-foreground flex items-center justify-between py-2 px-2.5 rounded-md"
                                                    >
                                                        <span className="truncate">{tz.replace(/_/g, ' ')}</span>
                                                        <Check
                                                            className={cn(
                                                                'ml-2 h-3.5 w-3.5 text-primary shrink-0',
                                                                localTimezone === tz ? 'opacity-100' : 'opacity-0'
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-border-subtle" />

            {/* 3. Notifications */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Notification Preferences
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Choose how and when you receive workspace alerts, security reminders, and activity updates.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="space-y-3 pt-1">
                    {/* Email Notifications */}
                    <div className="flex items-start sm:items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all duration-200 hover:border-border hover:bg-surface/80">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                <Mail className="h-4.5 w-4.5" />
                            </div>

                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        Email Notifications
                                    </span>
                                    {isEmailNotificationsUpdating && (
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Receive daily digest summaries, account security alerts, and critical workspace reminders via email.
                                </p>
                            </div>
                        </div>

                        <Switch
                            checked={localNotifications.email}
                            onCheckedChange={handleEmailNotificationChange}
                            disabled={isEmailNotificationsUpdating}
                            aria-label="Toggle Email Notifications"
                            className="mt-0.5 sm:mt-0"
                        />
                    </div>

                    {/* In-App Alerts */}
                    <div className="flex items-start sm:items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all duration-200 hover:border-border hover:bg-surface/80">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                <Bell className="h-4.5 w-4.5" />
                            </div>

                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        In-App Alerts
                                    </span>
                                    {isInAppNotificationsUpdating && (
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Display real-time notification badges and banner updates while actively working in the workspace.
                                </p>
                            </div>
                        </div>

                        <Switch
                            checked={localNotifications.inApp}
                            onCheckedChange={handleInAppNotificationChange}
                            disabled={isInAppNotificationsUpdating}
                            aria-label="Toggle In-App Alerts"
                            className="mt-0.5 sm:mt-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;