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

    const [localThemeMode, setLocalThemeMode] = useState(theme?.mode || THEME_MODES.LIGHT);
    const [isThemeUpdating, setIsThemeUpdating] = useState(false);

    const availableThemes = getAvailableThemes();
    const isPro = isProTier();

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (theme?.mode) setLocalThemeMode(theme.mode);
    }, [theme?.mode]);

    const handleThemeChange = async (themeName, themeMode) => {
        setIsThemeUpdating(true);
        try {
            await updateTheme(themeName, themeMode);
            const selectedTheme = availableThemes.find(t => t.value === themeName);
            toast.success(`Theme changed to ${selectedTheme?.label} (${themeMode})`, {
                icon: <Palette className="h-4 w-4 text-primary" />,
                duration: 2000,
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Appearance</h1>
                <p className="text-muted-foreground mt-2 text-base">
                    Customize the look and feel of your workspace.
                </p>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden backdrop-blur-sm bg-card/95">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Palette className="h-5 w-5 text-primary" />
                        Theme Settings
                    </CardTitle>
                    <CardDescription className="text-base">
                        Select your preferred mode and accent colors.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                    {/* Theme Mode Toggle (Discord-style clean toggle layout) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                            <Label className="text-base font-semibold text-foreground">Color Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Adjust the interface for reading comfort.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-full border border-border/50">
                            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.LIGHT ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                Light
                            </span>

                            <button
                                type="button"
                                onClick={handleThemeModeToggle}
                                disabled={isThemeUpdating}
                                role="switch"
                                aria-checked={localThemeMode === THEME_MODES.DARK}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                                    ${localThemeMode === THEME_MODES.DARK ? 'bg-zinc-800' : 'bg-zinc-300'}
                                    ${isThemeUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-90'}
                                `}
                            >
                                <span
                                    className={`
                                        pointer-events-none flex h-6 w-6 items-center justify-center rounded-full shadow-md 
                                        ring-0 transition-transform duration-300 ease-in-out
                                        ${localThemeMode === THEME_MODES.DARK ? 'translate-x-7 bg-zinc-950' : 'translate-x-0.5 bg-white'}
                                    `}
                                >
                                    {localThemeMode === THEME_MODES.DARK ? (
                                        <div className="h-3 w-3 rounded-full bg-gray-600/50 border border-gray-500/50" />
                                    ) : (
                                        <div className="h-3 w-3 rounded-full bg-zinc-400 border border-zinc-300" />
                                    )}
                                </span>
                            </button>

                            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${localThemeMode === THEME_MODES.DARK ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                Dark
                            </span>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Theme Selection Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold text-foreground">Accent Colors</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Choose an accent color to personalize your experience.
                                </p>
                            </div>
                            {!isPro && (
                                <Badge variant="secondary" className="gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20">
                                    <Crown className="h-3.5 w-3.5" />
                                    Pro Themes Locked
                                </Badge>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {availableThemes.map((themeOption) => {
                                const isActive = theme.name === themeOption.value;
                                const isLocked = !isPro && themeOption.value !== THEME_IDS.DEFAULT;

                                return (
                                    <button
                                        key={themeOption.value}
                                        onClick={() => !isLocked && handleThemeChange(themeOption.value, localThemeMode)}
                                        disabled={isLocked || isThemeUpdating}
                                        className={`
                                            group relative p-5 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden
                                            ${isActive
                                                ? 'border-primary bg-primary/5 shadow-sm scale-[1.02]'
                                                : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-md'}
                                            ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[0.3]' : 'cursor-pointer hover:-translate-y-0.5'}
                                        `}
                                    >
                                        {isActive && (
                                            <div className="absolute top-3 right-3 text-primary animate-in zoom-in duration-200">
                                                <CheckCircle2 className="h-5 w-5 fill-primary/20" />
                                            </div>
                                        )}
                                        {isLocked && (
                                            <div className="absolute top-3 right-3">
                                                <Crown className="h-4 w-4 text-muted-foreground/60" />
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <div className={`
                                                h-10 w-10 rounded-full shadow-sm ring-2 ring-background ring-offset-1 ring-offset-background
                                                ${themeOption.value === THEME_IDS.DEFAULT && 'bg-zinc-900 dark:bg-zinc-100'}
                                                ${themeOption.value === THEME_IDS.OCEAN_TEAL && 'bg-teal-500'}
                                                ${themeOption.value === THEME_IDS.MIDNIGHT_VIOLET && 'bg-violet-600 dark:bg-violet-800'}
                                                ${themeOption.value === THEME_IDS.FOREST_AMBER && 'bg-gradient-to-tr from-amber-500 to-emerald-500'}
                                                ${themeOption.value === THEME_IDS.ROSE_QUARTZ && 'bg-rose-500 dark:bg-rose-800'}
                                                ${themeOption.value === THEME_IDS.COFFEE && 'bg-amber-700'}
                                                ${themeOption.value === THEME_IDS.SAKURA && 'bg-pink-400'}
                                                ${themeOption.value === THEME_IDS.PLATINUM && 'bg-slate-400'}
                                                ${themeOption.value === THEME_IDS.ROYAL_NEBULA && 'bg-indigo-500'}
                                            `} />
                                            <div>
                                                <p className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                    {themeOption.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                                    {isLocked ? 'Premium' : `${localThemeMode} mode`}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {!isPro && (
                            <Alert className="bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30 text-amber-700 dark:text-amber-400 mt-6">
                                <Crown className="h-5 w-5 stroke-amber-600 dark:stroke-amber-400" />
                                <AlertDescription className="ml-2 font-medium">
                                    Upgrade to Pro to unlock premium palettes including {Object.values(THEME_IDS).filter((v) => v !== THEME_IDS.DEFAULT).join(', ')}.
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