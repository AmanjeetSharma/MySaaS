import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';
import ThemeLoader from './ThemeLoader';

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
    Palette,
    Crown,
    CheckCircle2,
    Moon,
    Sun
} from 'lucide-react';

const Appearance = () => {
    const {
        theme,
        isLoading,
        fetchSettings,
        updateTheme,
        isProTier,
        getAvailableThemes
    } = useSettingsStore();

    const [localThemeMode, setLocalThemeMode] = useState(null);

    const [isThemeUpdating, setIsThemeUpdating] = useState(false);

    const availableThemes = getAvailableThemes();
    const isPro = isProTier();
    const selectedThemeMode =
        localThemeMode || theme?.mode || THEME_MODES.LIGHT;

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleThemeChange = async (themeName, themeMode) => {
        setIsThemeUpdating(true);

        try {
            await updateTheme(themeName, themeMode);
            setLocalThemeMode(themeMode);
        } catch (error) {
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const handleThemeModeToggle = async () => {
        const newMode =
            selectedThemeMode === THEME_MODES.LIGHT
                ? THEME_MODES.DARK
                : THEME_MODES.LIGHT;

        setLocalThemeMode(newMode);
        setIsThemeUpdating(true);

        try {
            await updateTheme(theme.name, newMode);
        } catch (error) {
            setLocalThemeMode(null);
        } finally {
            setIsThemeUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center animate-pulse font-bold uppercase tracking-widest text-subtle-foreground/60 text-xs">
                Synchronizing Workspace...
            </div>
        );
    }

    return (
        <>
            {isThemeUpdating && <ThemeLoader />}

            <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Appearance
                    </h1>
                    <p className="text-sm sm:text-base text-subtle-foreground">
                        Customize your workspace theme and colors.
                    </p>
                </div>

                {/* Main Card */}
                <Card className="overflow-hidden border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs">

                    {/* Header */}
                    <CardHeader className="border-b border-border-subtle bg-surface px-4 py-4 sm:px-6 sm:py-5">
                        <CardTitle className="font-heading flex items-center gap-2 text-lg sm:text-xl text-foreground">
                            <Palette className="h-5 w-5 text-accent shrink-0" />
                            Theme Settings
                        </CardTitle>
                    </CardHeader>

                    {/* Content */}
                    <CardContent className="p-4 sm:p-6 md:p-7 space-y-6 sm:space-y-8">

                        {/* Theme Toggle */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
                            <div className="space-y-1">
                                <Label className="text-sm sm:text-base font-semibold text-foreground">
                                    Color Mode
                                </Label>
                                <p className="text-xs sm:text-sm text-subtle-foreground">
                                    Choose light or dark mode.
                                </p>
                            </div>

                            <div className="flex items-center justify-center sm:justify-start gap-3 rounded-full border border-border-subtle bg-surface-sunken p-2 w-full sm:w-fit">
                                <span
                                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${selectedThemeMode === THEME_MODES.LIGHT
                                        ? 'text-foreground'
                                        : 'text-subtle-foreground/60'
                                        }`}
                                >
                                    Light
                                </span>

                                <button
                                    type="button"
                                    onClick={handleThemeModeToggle}
                                    disabled={isThemeUpdating}
                                    role="switch"
                                    aria-checked={selectedThemeMode === THEME_MODES.DARK}
                                    className={`group relative inline-flex h-7 w-14 sm:h-8 sm:w-16 items-center rounded-full border border-border-subtle bg-surface overflow-hidden transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isThemeUpdating
                                        ? 'opacity-60 cursor-wait'
                                        : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'
                                        }`}
                                >
                                    {/* Surface */}
                                    <div className="absolute inset-px rounded-full bg-surface-sunken" />

                                    {/* Knob */}
                                    <span
                                        className={`relative z-10 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-border-subtle transition-all duration-500 ease-out shadow-xs ${selectedThemeMode === THEME_MODES.DARK
                                            ? 'translate-x-7 sm:translate-x-8 text-foreground bg-surface-elevated'
                                            : 'translate-x-0.5 text-warning bg-surface-elevated'
                                            }`}
                                    >
                                        {selectedThemeMode === THEME_MODES.DARK ? (
                                            <Moon className="h-3.5 w-3.5" strokeWidth={2.3} />
                                        ) : (
                                            <Sun className="h-3.5 w-3.5" strokeWidth={2.3} />
                                        )}
                                    </span>
                                </button>

                                <span
                                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${selectedThemeMode === THEME_MODES.DARK
                                        ? 'text-foreground'
                                        : 'text-subtle-foreground/60'
                                        }`}
                                >
                                    Dark
                                </span>
                            </div>
                        </div>

                        <Separator className="bg-border-subtle" />

                        {/* Accent Themes */}
                        <div className="space-y-5">
                            {/* Top Row */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <Label className="text-sm sm:text-base font-semibold text-foreground">
                                    Accent Colors
                                </Label>

                                {!isPro && (
                                    <Badge
                                        variant="secondary"
                                        className="w-fit gap-1.5 px-2.5 py-1 text-xs bg-warning/10 text-warning border border-warning/20 rounded-full"
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
                                                !isActive &&
                                                handleThemeChange(
                                                    themeOption.value,
                                                    selectedThemeMode
                                                )
                                            }
                                            disabled={
                                                isLocked || isActive || isThemeUpdating
                                            }
                                            className={`relative overflow-hidden rounded-2xl border transition-all duration-200 text-left p-3.5 sm:p-4.5 ${isActive
                                                ? 'border-accent bg-surface-sunken ring-1 ring-accent/20 shadow-xs'
                                                : 'border-border-subtle bg-surface hover:bg-hover hover:border-border'
                                                } ${isLocked || isActive
                                                    ? 'opacity-65 cursor-not-allowed'
                                                    : 'cursor-pointer hover:-translate-y-px active:scale-[0.99]'
                                                }`}
                                        >
                                            {/* Active Badge */}
                                            {isActive && (
                                                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5">
                                                    <CheckCircle2 className="h-4 w-4 text-accent fill-accent/15" />
                                                </div>
                                            )}

                                            {/* Locked Badge */}
                                            {isLocked && (
                                                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5">
                                                    <Crown className="h-3.5 w-3.5 text-subtle-foreground/60" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2.5 sm:gap-3.5">
                                                {/* Preview */}
                                                <div
                                                    className={`
                                                    h-8 w-8 sm:h-10 sm:w-10 rounded-full shrink-0 shadow-2xs border border-border-subtle
                                                    ${themeOption.value === THEME_IDS.DEFAULT && 'bg-black'}
                                                    ${themeOption.value === THEME_IDS.OCEAN_TEAL && 'bg-linear-to-br from-teal-500 to-cyan-400'}
                                                    ${themeOption.value === THEME_IDS.MIDNIGHT_VIOLET && 'bg-linear-to-br from-violet-950 to-violet-600'}
                                                    ${themeOption.value === THEME_IDS.FOREST_WOOD && 'bg-linear-to-br from-emerald-700 to-amber-800'}
                                                    ${themeOption.value === THEME_IDS.VOLCANIC && 'bg-linear-to-br from-orange-400 to-red-700'}
                                                    ${themeOption.value === THEME_IDS.COFFEE && 'bg-linear-to-br from-amber-900 to-orange-200'}
                                                    ${themeOption.value === THEME_IDS.SAKURA && 'bg-linear-to-br from-pink-300 to-rose-500'}
                                                    ${themeOption.value === THEME_IDS.PLATINUM && 'bg-linear-to-br from-slate-500 to-zinc-300'}
                                                    ${themeOption.value === THEME_IDS.SKYLINE_AFTERDARK && 'bg-linear-to-br from-sky-200 to-indigo-600'}
                                                    ${themeOption.value === THEME_IDS.BUMBLEBEE && 'bg-linear-to-br from-black to-yellow-400'}
                                                `}
                                                />

                                                {/* Content */}
                                                <div className="min-w-0 flex-1 pr-4 sm:pr-6">
                                                    <p
                                                        className={`text-xs sm:text-sm font-semibold leading-tight break-words ${isActive
                                                            ? 'text-foreground'
                                                            : 'text-foreground/90'
                                                            }`}
                                                    >
                                                        {themeOption.label}
                                                    </p>

                                                    {isLocked && (
                                                        <p className="text-[10px] sm:text-xs text-subtle-foreground mt-0.5 leading-tight">
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
                                <Alert className="mt-2 rounded-2xl border-warning/30 bg-linear-to-r from-warning/10 to-transparent text-warning">
                                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 stroke-warning shrink-0" />
                                    <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                                        Upgrade to Pro to unlock premium themes.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default Appearance;