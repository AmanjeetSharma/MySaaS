import { Palette } from 'lucide-react';

const NameThemeLoader = () => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Applying theme"
        >
            <div className="flex w-[min(90vw,22rem)] flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-7 text-center shadow-xl">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Palette className="h-5 w-5" />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                        Please wait
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Applying your workspace theme...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NameThemeLoader;
