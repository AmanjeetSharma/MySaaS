import { useEffect, useMemo, useState } from 'react';
import { Lottie } from 'lottie-react';
import { Clock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import amWatchingYouAnimation from '@/assets/animations/am_watching_you.json';

const getRemainingSeconds = (retryAt) => {
    if (!retryAt) return 0;
    return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
};

const formatRemainingTime = (totalSeconds) => {
    if (totalSeconds < 60) {
        return `${totalSeconds}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

export const RateLimitFallback = ({ rateLimit }) => {
    const clearRateLimit = useAppStore((state) => state.clearRateLimit);
    const retryAt = rateLimit?.retryAt;

    const initialRemaining = useMemo(
        () => getRemainingSeconds(retryAt),
        [retryAt]
    );
    const [remainingSeconds, setRemainingSeconds] = useState(initialRemaining);
    const [hasClickedOnce, setHasClickedOnce] = useState(false);

    useEffect(() => {
        setRemainingSeconds(getRemainingSeconds(retryAt));
        if (!retryAt) return undefined;

        const intervalId = window.setInterval(() => {
            setRemainingSeconds(getRemainingSeconds(retryAt));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [retryAt]);

    const canRetry = remainingSeconds === 0;

    const handleRetry = () => {
        if (!hasClickedOnce) {
            setHasClickedOnce(true);
            return;
        }

        clearRateLimit();
        window.location.reload();
    };

    return (
        <main className="fixed inset-0 z-100 flex min-h-dvh w-full items-center justify-center bg-black px-6 text-white select-none antialiased">
            <section className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
                {/* Visual Anchor */}
                <div className="relative flex size-36 items-center justify-center overflow-hidden sm:size-40">
                    <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${canRetry
                            ? 'scale-100 opacity-100'
                            : 'pointer-events-none scale-75 opacity-0'
                            }`}
                    >
                        <div className="flex size-20 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
                            <Unlock className="size-9 text-emerald-400 stroke-[1.75]" />
                        </div>
                    </div>

                    <div
                        className={`size-full scale-110 transition-all duration-500 ease-out ${canRetry
                            ? 'pointer-events-none scale-90 opacity-0'
                            : 'scale-110 opacity-100'
                            }`}
                    >
                        <Lottie
                            src={amWatchingYouAnimation}
                            loop
                            autoplay
                        />
                    </div>
                </div>

                {/* Status Pill */}
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-neutral-400">
                    <span
                        className={`size-2 rounded-full transition-colors duration-500 ${canRetry
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                            : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
                            }`}
                    />
                    <span className="transition-all duration-300">
                        {canRetry ? 'Access Restored' : 'Access Temporarily Restricted'}
                    </span>
                </div>

                {/* Dynamic Content Container */}
                <div className="mt-4 flex w-full flex-col items-center">
                    {canRetry ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                You're all set!
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                Cooldown ended. Ready when you are.
                            </p>

                            <Button
                                size="lg"
                                onClick={handleRetry}
                                className="mt-6 h-11 w-full max-w-60 rounded-xl bg-white text-sm font-medium text-black transition-all duration-200 hover:bg-neutral-200 active:scale-95 cursor-pointer"
                            >
                                {hasClickedOnce ? 'Try Being Human 😏' : 'Resume'}
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300 flex flex-col items-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                We see you...
                            </h1>

                            <p className="mt-2.5 max-w-112.5 text-sm leading-relaxed text-neutral-400 sm:text-base">
                                {rateLimit?.message || "You've made too many requests in a short period of time. Please wait until the cooldown ends before trying again."}
                            </p>

                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-400">
                                <span>Time remaining:</span>
                                <div className="inline-flex items-center gap-1 font-mono font-bold text-neutral-200">
                                    <Clock className="size-3.5 text-neutral-400 stroke-2" />
                                    <span>{formatRemainingTime(remainingSeconds)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};