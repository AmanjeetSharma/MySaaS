import { Spinner } from "@/components/ui/spinner";

export const AppLoader = () => {
    return (
        <div className="relative min-h-dvh w-full flex items-center justify-center bg-background overflow-hidden p-6">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-48 h-48 md:w-96 md:h-96 
                      bg-primary/10 rounded-full blur-[60px] md:blur-[120px] 
                      animate-pulse pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-sm mx-auto">
                <div className="flex flex-col items-center gap-6 md:gap-8 w-full">

                    <div className="relative flex items-center justify-center">
                        <Spinner className="h-8 w-8 text-primary" />
                        <div className="absolute h-8 w-8 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3">
                        <h2 className="text-base md:text-lg font-semibold tracking-tight text-foreground">
                            Preparing your workspace
                        </h2>

                        <div className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            This may take a few seconds
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 px-6 text-center">
                <p className="text-[10px] md:text-[11px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">
                    v1.0.0 Loading Resources...
                </p>
            </div>
        </div>
    );
};