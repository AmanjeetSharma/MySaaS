import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Calendar, ShieldCheck, Zap, Layers, ChevronRight } from "lucide-react";

export const HeroIntro = ({ onExploreClick, onSimulatorClick }) => {
    const navigate = useNavigate();

    return (
        <section className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto flex flex-col justify-between items-center text-center relative z-10">

            {/* Top Eyebrow / Metrology Status Pill */}
            <div className="pt-2 sm:pt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-elevated/90 text-xs font-medium text-foreground backdrop-blur-md shadow-sm">
                    <span className="h-2 w-2 rounded-full moon-dot text-primary animate-pulse" />
                    <span className="font-semibold tracking-wide">miniCRM 2026</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-muted-foreground font-mono text-[11px]">APPOINTMENT_DRIVEN_CRM</span>
                </div>
            </div>

            {/* Core Message & Action Center */}
            <div className="my-auto max-w-5xl flex flex-col items-center py-6 sm:py-8">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.07] max-w-5xl">
                    The appointment-driven CRM for high-velocity teams.
                </h1>

                <p className="mt-5 sm:mt-7 text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed px-2">
                    miniCRM pairs public client booking directly with full customer relationship management. Every booked session captures customer details, advances deals across stages, and syncs your calendar automatically.
                </p>

                {/* Primary & Secondary Call to Actions */}
                <div className="mt-7 sm:mt-9 flex flex-col xs:flex-row gap-3 justify-center items-stretch xs:items-center w-full xs:w-auto px-4 xs:px-0">
                    <Button
                        className="h-11 px-7 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-semibold text-xs sm:text-sm cursor-pointer transition-all active:translate-y-px flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_28px_rgba(255,255,255,0.24)]"
                        onClick={() => navigate("/signup")}
                    >
                        <span>Start Free Trial</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <button
                        type="button"
                        onClick={onSimulatorClick}
                        className="h-11 px-5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors hover:border-white/30 cursor-pointer"
                    >
                        <span>Test Operating Engine</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <button
                        type="button"
                        onClick={onExploreClick}
                        className="h-11 px-5 rounded-lg border border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground hover:bg-surface-elevated font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <span>Explore CRM Suite</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Precision Metrology Highlight Grid */}
                <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl text-left">
                    <div className="p-3 sm:p-3.5 rounded-lg border border-border/80 bg-surface/85 backdrop-blur-md flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>Google 2-Way Sync</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Outbound booking feeds & instant personal calendar blocking.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-lg border border-border/80 bg-surface/85 backdrop-blur-md flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span>Zero Collision</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Real-time slot lock prevents double-booking disputes.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-lg border border-border/80 bg-surface/85 backdrop-blur-md flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            <span>Automated Pipeline</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Deals & contacts synthesized instantly upon appointment confirmation.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-lg border border-border/80 bg-surface/85 backdrop-blur-md flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            <span>Immutable Ledger</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Chronological history of notes, meetings, and closed revenue.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Scroll Cue to 2nd Content (Unified Operating Engine) */}
            <div className="pb-3 sm:pb-5 flex flex-col items-center">
                <button
                    type="button"
                    onClick={onSimulatorClick}
                    className="group flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase">
                        Unified Operating Engine Below
                    </span>
                    <div className="h-7 w-7 rounded-full border border-border bg-surface-elevated/80 flex items-center justify-center transition-transform group-hover:translate-y-0.5">
                        <ChevronDown className="h-3.5 w-3.5 text-primary animate-pulse" />
                    </div>
                </button>
            </div>

        </section>
    );
};
