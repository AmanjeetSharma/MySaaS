import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Palette, Crown, CheckCircle2 } from 'lucide-react';
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
            toast.error(error.message || 'Failed to switch theme mode');
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
                    Customize the look and feel of your workspace.
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

                    <CardDescription className="text-sm sm:text-base">
                        Select your preferred mode and accent colors.
                    </CardDescription>
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
                                Adjust the interface for reading comfort.
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
                                aria-checked={
                                    localThemeMode === THEME_MODES.DARK
                                }
                                className={`
                                    relative inline-flex h-6 w-12 sm:h-7 sm:w-14 items-center rounded-full transition-all duration-300 ease-in-out
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                    ${localThemeMode === THEME_MODES.DARK
                                        ? 'bg-zinc-800'
                                        : 'bg-zinc-300'
                                    }
                                    ${isThemeUpdating
                                        ? 'opacity-50 cursor-wait'
                                        : 'cursor-pointer hover:opacity-90'
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        pointer-events-none flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300 ease-in-out
                                        ${localThemeMode ===
                                            THEME_MODES.DARK
                                            ? 'translate-x-6 sm:translate-x-7 bg-zinc-950'
                                            : 'translate-x-0.5 bg-white'
                                        }
                                    `}
                                >
                                    {localThemeMode === THEME_MODES.DARK ? (
                                        <div className="h-2.5 w-2.5 rounded-full bg-gray-600/50 border border-gray-500/50" />
                                    ) : (
                                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-400 border border-zinc-300" />
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

                            <div className="space-y-1">
                                <Label className="text-sm sm:text-base font-semibold">
                                    Accent Colors
                                </Label>

                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Choose an accent color to personalize your experience.
                                </p>
                            </div>

                            {!isPro && (
                                <Badge
                                    variant="secondary"
                                    className="w-fit gap-1.5 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                >
                                    <Crown className="h-3.5 w-3.5" />
                                    Pro Themes Locked
                                </Badge>
                            )}
                        </div>

                        {/* Theme Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {availableThemes.map((themeOption) => {
                                const isActive = theme.name === themeOption.value;

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
                                        disabled={isLocked || isThemeUpdating}
                                        className={`
                    relative overflow-hidden rounded-2xl border transition-all duration-200 text-left
                    p-3 sm:p-4

                    ${isActive
                                                ? 'border-primary/40 bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]'
                                                : 'border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border'
                                            }

                    ${isLocked
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer hover:-translate-y-px'
                                            }
                `}
                                    >
                                        {/* Active */}
                                        {isActive && (
                                            <div className="absolute top-3 right-3">
                                                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/15" />
                                            </div>
                                        )}

                                        {/* Locked */}
                                        {isLocked && (
                                            <div className="absolute top-3 right-3">
                                                <Crown className="h-3.5 w-3.5 text-muted-foreground/60" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">

                                            {/* Color Preview */}
                                            <div
                                                className={`
                            h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0
                            
                            ${themeOption.value === THEME_IDS.DEFAULT && 'bg-black'}
                            ${themeOption.value === THEME_IDS.OCEAN_TEAL && 'bg-teal-500'}
                            ${themeOption.value === THEME_IDS.MIDNIGHT_VIOLET && 'bg-violet-600 dark:bg-violet-700'}
                            ${themeOption.value === THEME_IDS.FOREST_AMBER && 'bg-linear-to-br from-amber-400 to-emerald-500'}
                            ${themeOption.value === THEME_IDS.ROSE_QUARTZ && 'bg-rose-700'}
                            ${themeOption.value === THEME_IDS.COFFEE && 'bg-amber-700'}
                            ${themeOption.value === THEME_IDS.SAKURA && 'bg-pink-400'}
                            ${themeOption.value === THEME_IDS.PLATINUM && 'bg-slate-400'}
                            ${themeOption.value === THEME_IDS.ROYAL_NEBULA && 'bg-indigo-500'}
                        `}
                                            />

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`
                                text-sm font-medium truncate
                                ${isActive
                                                            ? 'text-foreground'
                                                            : 'text-foreground/90'
                                                        }
                            `}
                                                >
                                                    {themeOption.label}
                                                </p>

                                                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                                    {isLocked
                                                        ? 'Premium Theme'
                                                        : `${localThemeMode} mode`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Discord-style active glow */}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 pointer-events-none" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Alert */}
                        {!isPro && (
                            <Alert className="mt-2 border-amber-500/30 bg-linear-to-r from-amber-500/10 to-transparent text-amber-700 dark:text-amber-400">

                                <Crown className="h-4 w-4 sm:h-5 sm:w-5 stroke-amber-600 dark:stroke-amber-400 shrink-0" />

                                <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                                    Upgrade to Pro to unlock premium palettes including{' '}
                                    {Object.values(THEME_IDS)
                                        .filter(
                                            (v) => v !== THEME_IDS.DEFAULT
                                        )
                                        .join(', ')}
                                    .
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