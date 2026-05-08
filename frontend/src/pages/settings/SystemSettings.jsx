import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Palette, Globe, Bell, Crown, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SystemSettings = () => {
    const {
        theme,
        timezone,
        notifications,
        isLoading,
        isUpdating,
        fetchSettings,
        updateTheme,
        updateTimezone,
        updateNotifications,
        isProTier,
        getAvailableThemes
    } = useSettingsStore();

    const [localThemeMode, setLocalThemeMode] = useState(theme.mode);
    const [localTimezone, setLocalTimezone] = useState(timezone);
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [isThemeUpdating, setIsThemeUpdating] = useState(false);
    const [isTimezoneUpdating, setIsTimezoneUpdating] = useState(false);
    const [isNotificationsUpdating, setIsNotificationsUpdating] = useState(false);

    const availableThemes = getAvailableThemes();
    const isPro = isProTier();

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        setLocalThemeMode(theme.mode);
    }, [theme.mode]);

    useEffect(() => {
        setLocalTimezone(timezone);
    }, [timezone]);

    useEffect(() => {
        setLocalNotifications(notifications);
    }, [notifications]);

    const handleThemeChange = async (themeName, themeMode) => {
        setIsThemeUpdating(true);
        try {
            await updateTheme(themeName, themeMode);
            toast.success(`Theme changed to ${availableThemes.find(t => t.value === themeName)?.label} (${themeMode})`, {
                icon: <Palette className="h-4 w-4 text-primary" />,
                duration: 1500,
                position: 'top-center'
            });
        } catch (error) {
            toast.error(error.message || 'Failed to update theme');
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const handleThemeModeToggle = async () => {
        const newMode = localThemeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        setLocalThemeMode(newMode);
        setIsThemeUpdating(true);
        try {
            await updateTheme(theme.name, newMode);
            toast.success(`Switched to ${newMode} mode`,{
                icon: <Palette className="h-4 w-4 text-primary" />,
                duration: 1500,
                position: 'top-center'
            });
        } catch (error) {
            setLocalThemeMode(theme.mode);
            toast.error(error.message || 'Failed to switch theme mode');
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const handleTimezoneChange = async (newTimezone) => {
        setLocalTimezone(newTimezone);
        setIsTimezoneUpdating(true);
        try {
            await updateTimezone(newTimezone);
            toast.success('Timezone updated successfully');
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
            toast.success('Notification preferences updated');
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
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account preferences and settings
                </p>
            </div>

            <Tabs defaultValue="appearance" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-100">
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme Settings
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel of your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Theme Mode Toggle */}
                            <div className="flex items-center justify-between p-1">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Appearance</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between dark and light themes
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Light Label */}
                                    <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.LIGHT ? 'text-foreground' : 'text-muted-foreground/50'
                                        }`}>
                                        Light
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleThemeModeToggle}
                                        disabled={isThemeUpdating}
                                        role="switch"
                                        aria-checked={localThemeMode === THEME_MODES.DARK}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                ${localThemeMode === THEME_MODES.DARK
                                                ? 'bg-zinc-700' // Premium dark matte track
                                                : 'bg-zinc-300' // Clean light track
                                            }
                ${isThemeUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
            `}
                                    >
                                        <span
                                            className={`
                    pointer-events-none flex h-5 w-5 items-center justify-center rounded-full shadow-md 
                    ring-0 transition-transform duration-300 ease-in-out
                    ${localThemeMode === THEME_MODES.DARK
                                                    ? 'translate-x-5 bg-zinc-900' // Dark knob
                                                    : 'translate-x-0.5 bg-white' // Light knob
                                                }
                `}
                                        >
                                            {/* Optional: Add tiny icons for that high-end feel */}
                                            {localThemeMode === THEME_MODES.DARK ? (
                                                <div className="h-3 w-3 rounded-full bg-gray-500/40 border border-gray-500/50" />
                                            ) : (
                                                <div className="h-3 w-3 rounded-full bg-zinc-500 border border-zinc-300" />
                                            )}
                                        </span>
                                    </button>

                                    {/* Dark Label */}
                                    <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.DARK ? 'text-foreground' : 'text-muted-foreground/50'
                                        }`}>
                                        Dark
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Color Theme</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Choose your preferred color scheme
                                        </p>
                                    </div>
                                    {!isPro && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Crown className="h-3 w-3" />
                                            Pro Feature
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {availableThemes.map((themeOption) => {
                                        const isActive = theme.name === themeOption.value;
                                        const isLocked = !isPro && themeOption.value !== THEME_IDS.DEFAULT;

                                        return (
                                            <button
                                                key={themeOption.value}
                                                onClick={() => !isLocked && handleThemeChange(themeOption.value, localThemeMode)}
                                                disabled={isLocked || isThemeUpdating}
                                                className={`
                                                    relative p-4 rounded-lg border-2 transition-all text-left
                                                    ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                                                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                            >
                                                {isActive && (
                                                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                                )}
                                                {isLocked && (
                                                    <div className="absolute top-2 right-2">
                                                        <Crown className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`
                                                            h-8 w-8 rounded-full 
                                                            ${themeOption.value === THEME_IDS.DEFAULT && 'bg-black dark:bg-white'}
                                                            ${themeOption.value === THEME_IDS.OCEAN_TEAL && 'bg-teal-500'}
                                                            ${themeOption.value === THEME_IDS.MIDNIGHT_VIOLET && 'bg-violet-900'}
                                                            ${themeOption.value === THEME_IDS.FOREST_AMBER && 'bg-linear-to-tr from-amber-500 to-green-500'}
                                                            ${themeOption.value === THEME_IDS.ROSE_QUARTZ && 'bg-pink-900'}
                                                            ${themeOption.value === THEME_IDS.COFFEE && 'bg-amber-600'}
                                                            ${themeOption.value === THEME_IDS.SAKURA && 'bg-pink-300'}
                                                            ${themeOption.value === THEME_IDS.PLATINUM && 'bg-slate-400'}
                                                            ${themeOption.value === THEME_IDS.ROYAL_NEBULA && 'bg-purple-500'}
                                                        `} />
                                                        <div>
                                                            <p className="font-medium">{themeOption.label}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">
                                                                {localThemeMode} mode
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {!isPro && (
                                    <Alert>
                                        <Crown className="h-4 w-4" />
                                        <AlertDescription>
                                            Upgrade to Pro to unlock all themes including {Object.values(THEME_IDS).filter((v) => v !== THEME_IDS.DEFAULT).join(', ')}.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Timezone
                            </CardTitle>
                            <CardDescription>
                                Set your preferred timezone for date and time displays
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Select
                                    value={localTimezone}
                                    onValueChange={handleTimezoneChange}
                                    disabled={isTimezoneUpdating}
                                >
                                    <SelectTrigger className="w-full md:w-75">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map((tz) => (
                                            <SelectItem key={tz} value={tz}>
                                                {tz.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Current time in your timezone: {new Date().toLocaleString('en-US', { timeZone: localTimezone })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Control how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates and alerts via email
                                    </p>
                                </div>
                                <Switch
                                    checked={localNotifications.email}
                                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                    disabled={isNotificationsUpdating}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">In-App Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Show notifications within the application
                                    </p>
                                </div>
                                <Switch
                                    checked={localNotifications.inApp}
                                    onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
                                    disabled={isNotificationsUpdating}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default SystemSettings;