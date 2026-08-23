import { Palette } from 'lucide-react';
import { THEME_MODES } from '@/theme/theme.constant.js';

const ThemeLoader = ({ mode = THEME_MODES.LIGHT }) => {
    const isDark = mode === THEME_MODES.DARK;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm ${isDark ? 'bg-black/70' : 'bg-white/70'
                }`}
            role="status"
            aria-live="polite"
            aria-label="Applying theme"
        >
            <div
                className={`flex w-[min(90vw,22rem)] flex-col items-center gap-5 rounded-2xl border px-6 py-7 text-center transition-colors ${isDark
                    ? 'border-white/10 bg-black text-white shadow-[0_20px_60px_rgba(255,255,255,0.06)]'
                    : 'border-black/10 bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
                    }`}
            >
                {/* Loader */}
                <div className="relative flex h-16 w-16 items-center justify-center">
                    {/* Spinner */}
                    <div
                        className={`absolute inset-1 animate-spin rounded-full border-2 border-transparent ${isDark
                            ? 'border-t-white'
                            : 'border-t-black'
                            }`}
                        style={{ animationDuration: '900ms' }}
                    />

                    {/* Icon */}
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-inner ${isDark
                            ? 'bg-white/10 text-white'
                            : 'bg-black/5 text-black'
                            }`}
                    >
                        <Palette
                            className="h-5 w-5"
                            strokeWidth={1.8}
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-1.5">
                    <p className="text-sm font-bold">
                        Applying appearance
                    </p>

                    <p
                        className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'
                            }`}
                    >
                        Updating your workspace
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThemeLoader;