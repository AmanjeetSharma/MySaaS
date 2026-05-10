import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
    Alert,
    AlertDescription
} from '@/components/ui/alert';

import {
    Loader2,
    Palette,
    Crown,
    CheckCircle2,
    Moon,
    Sun
} from 'lucide-react';

import { toast } from 'sonner';

const Appearance = () => {
    const {
        theme,
        isLoading,
        fetchSettings,
        updateTheme,
        isProTier,
        getAvailableThemes
    } = useSettingsStore();

    const [localThemeMode, setLocalThemeMode] = useState(
        theme?.mode || THEME_MODES.LIGHT
    );

    const [isThemeUpdating, setIsThemeUpdating] = useState(false);

    const availableThemes = getAvailableThemes();
    const isPro = isProTier();

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (theme?.mode) {
            setLocalThemeMode(theme.mode);
        }
    }, [theme?.mode]);

    const handleThemeChange = async (themeName, themeMode) => {
        setIsThemeUpdating(true);

        try {
            await updateTheme(themeName, themeMode);

            const selectedTheme = availableThemes.find(
                (t) => t.value === themeName
            );

            toast.success(
                `Theme changed to ${selectedTheme?.label} (${themeMode})`,
                {
                    icon: <Palette className="h-4 w-4 text-primary" />,
                    duration: 2000,
                    position: 'top-center'
                }
            );
        } catch (error) {
            toast.error(error.message || 'Failed to update theme');
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const handleThemeModeToggle = async () => {
        const newMode =
            localThemeMode === THEME_MODES.LIGHT
                ? THEME_MODES.DARK
                : THEME_MODES.LIGHT;

        setLocalThemeMode(newMode);
        setIsThemeUpdating(true);

        try {
            await updateTheme(theme.name, newMode);

            toast.success(`Switched to ${newMode} mode`, {
                icon: <Palette className="h-4 w-4 text-primary" />,
                duration: 2000,
                position: 'top-center'
            });
        } catch (error) {
            setLocalThemeMode(theme.mode);

            toast.error(
                error.message || 'Failed to switch theme mode'
            );
        } finally {
            setIsThemeUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-75">
                <Loader2 className="h-7 w-7 animate-spin text-primary/80" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="space-y-1">

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Appearance
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground">
                    Customize your workspace theme and colors.
                </p>

            </div>

            {/* Main Card */}
            <Card className="overflow-hidden border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">

                {/* Header */}
                <CardHeader className="border-b border-border/50 bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">

                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Palette className="h-5 w-5 text-primary shrink-0" />
                        Theme Settings
                    </CardTitle>

                </CardHeader>

                {/* Content */}
                <CardContent className="p-3 sm:p-5 md:p-6 space-y-5 sm:space-y-7">

                    {/* Theme Toggle */}
                    <div className="flex flex-col gap-4 rounded-xl border border-border/40 p-3 sm:p-4">

                        <div className="space-y-1">

                            <Label className="text-sm sm:text-base font-semibold">
                                Color Mode
                            </Label>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Choose light or dark mode.
                            </p>

                        </div>

                        <div className="flex items-center justify-center sm:justify-start gap-3 rounded-full border border-border/50 bg-muted/40 p-2 w-full sm:w-fit">

                            <span
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.LIGHT
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50'
                                    }`}
                            >
                                Light
                            </span>

                            <button
                                type="button"
                                onClick={handleThemeModeToggle}
                                disabled={isThemeUpdating}
                                role="switch"
                                aria-checked={localThemeMode === THEME_MODES.DARK}
                                className={`group relative inline-flex h-7 w-14 sm:h-8 sm:w-16 items-center rounded-full border border-border bg-secondary overflow-hidden transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isThemeUpdating
                                    ? 'opacity-60 cursor-wait'
                                    : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'
                                    }`}
                            >

                                {/* Glow */}
                                <div
                                    className={`absolute inset-0 transition-opacity duration-500 ${localThemeMode === THEME_MODES.DARK
                                        ? 'bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.08),transparent_42%)]'
                                        : 'bg-[radial-gradient(circle_at_25%_50%,rgba(255,255,255,0.95),transparent_40%)]'
                                        }`}
                                />

                                {/* Surface */}
                                <div className="absolute inset-[1px] rounded-full bg-background/80 backdrop-blur-md" />

                                {/* Knob */}
                                <span
                                    className={`relative z-10 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full border transition-all duration-500 ease-out shadow-[0_4px_14px_rgba(0,0,0,0.45)] ${localThemeMode === THEME_MODES.DARK
                                        ? 'translate-x-7 sm:translate-x-8 border-border text-foreground bg-[linear-gradient(to_bottom_right,var(--secondary),var(--background))]'
                                        : 'translate-x-0.5 border-border text-yellow-500 bg-[linear-gradient(to_bottom_right,#ffffff,var(--muted))]'
                                        }`}
                                >
                                    {localThemeMode === THEME_MODES.DARK ? (
                                        <Moon
                                            className="h-3.5 w-3.5 drop-shadow-[0_0_6px_rgba(255,255,255,0.18)]"
                                            strokeWidth={2.3}
                                        />
                                    ) : (
                                        <Sun
                                            className="h-3.5 w-3.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                                            strokeWidth={2.3}
                                        />
                                    )}
                                </span>

                            </button>

                            <span
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.DARK
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50'
                                    }`}
                            >
                                Dark
                            </span>

                        </div>

                    </div>

                    <Separator className="bg-border/50" />

                    {/* Accent Themes */}
                    <div className="space-y-5">

                        {/* Top Row */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <Label className="text-sm sm:text-base font-semibold">
                                Accent Colors
                            </Label>

                            {!isPro && (
                                <Badge
                                    variant="secondary"
                                    className="w-fit gap-1.5 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                >
                                    <Crown className="h-3.5 w-3.5" />
                                    Pro Themes
                                </Badge>
                            )}

                        </div>

                        {/* Theme Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

                            {availableThemes.map((themeOption) => {
                                const isActive =
                                    theme.name === themeOption.value;

                                const isLocked =
                                    !isPro &&
                                    themeOption.value !== THEME_IDS.DEFAULT;

                                return (
                                    <button
                                        key={themeOption.value}
                                        onClick={() =>
                                            !isLocked &&
                                            handleThemeChange(
                                                themeOption.value,
                                                localThemeMode
                                            )
                                        }
                                        disabled={
                                            isLocked || isThemeUpdating
                                        }
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-200 text-left p-3 sm:p-4 ${isActive
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border'
                                            } ${isLocked
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer hover:-translate-y-px'
                                            }`}
                                    >

                                        {/* Active */}
                                        {isActive && (
                                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary fill-primary/15" />
                                            </div>
                                        )}

                                        {/* Locked */}
                                        {isLocked && (
                                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                                <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/60" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">

                                            {/* Preview */}
                                            <div
                                                className={`
                                                    h-9
                                                    w-9
                                                    sm:h-10
                                                    sm:w-10
                                                    rounded-full
                                                    shrink-0

                                                    ${themeOption.value === THEME_IDS.DEFAULT && 'bg-black'}
                                                    ${themeOption.value === THEME_IDS.OCEAN_TEAL && 'bg-teal-500'}
                                                    ${themeOption.value === THEME_IDS.MIDNIGHT_VIOLET && 'bg-violet-950'}
                                                    ${themeOption.value === THEME_IDS.FOREST_AMBER && 'bg-linear-to-br from-amber-400 to-emerald-500'}
                                                    ${themeOption.value === THEME_IDS.DUSTY_ROSE && 'bg-rose-700'}
                                                    ${themeOption.value === THEME_IDS.COFFEE && 'bg-amber-700'}
                                                    ${themeOption.value === THEME_IDS.SAKURA && 'bg-pink-400'}
                                                    ${themeOption.value === THEME_IDS.PLATINUM && 'bg-slate-400'}
                                                    ${themeOption.value === THEME_IDS.AZURE_BLUE && 'bg-blue-500'}
                                                    ${themeOption.value === THEME_IDS.GRAPHITE_GOLD && 'bg-gradient-to-br from-amber-400 to-yellow-500'}
                                                `}
                                            />

                                            {/* Content */}
                                            <div className="min-w-0 flex-1 pr-5 sm:pr-6">

                                                <p
                                                    className={`text-sm font-medium truncate ${isActive
                                                        ? 'text-foreground'
                                                        : 'text-foreground/90'
                                                        }`}
                                                >
                                                    {themeOption.label}
                                                </p>

                                                {isLocked && (
                                                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                                        Premium Theme
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                    </button>
                                );
                            })}

                        </div>

                        {/* Alert */}
                        {!isPro && (
                            <Alert className="mt-2 border-amber-500/30 bg-linear-to-r from-amber-500/10 to-transparent text-amber-700 dark:text-amber-400">

                                <Crown className="h-4 w-4 sm:h-5 sm:w-5 stroke-amber-600 dark:stroke-amber-400 shrink-0" />

                                <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                                    Upgrade to Pro to unlock premium themes.
                                </AlertDescription>

                            </Alert>
                        )}

                    </div>

                </CardContent>

            </Card>

        </div>
    );
};

export default Appearance;