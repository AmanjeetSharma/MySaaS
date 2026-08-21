import { Palette } from 'lucide-react';

const ThemeLoader = () => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-xs"
            role="status"
            aria-live="polite"
            aria-label="Applying theme"
        >
            <div className="flex w-[min(90vw,22rem)] flex-col items-center gap-5 rounded-2xl border border-border-strong bg-surface-elevated px-6 py-7 text-center shadow-2xl text-surface-elevated-foreground animate-in zoom-in-95 duration-150">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
                    <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-accent" />
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent shadow-xs">
                        <Palette className="h-5 w-5" />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="font-heading text-sm font-bold text-foreground">
                        Please wait
                    </p>
                    <p className="text-xs text-subtle-foreground">
                        Applying your workspace theme...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThemeLoader;