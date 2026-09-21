import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export const HeroIntro = ({ onSimulatorClick }) => {
    const navigate = useNavigate();

    return (
        <section className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto flex flex-col justify-between items-center text-center relative z-10">

            {/* Top Eyebrow / Metrology Status Pill */}
            <div className="pt-2 sm:pt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-elevated/90 text-xs font-medium text-foreground backdrop-blur-md shadow-sm">
                    <span className="font-semibold tracking-wide">miniCRM (v1.0.0)</span>
                </div>
            </div>

            {/* Core Message & Action Center */}
            <div className="my-auto max-w-5xl flex flex-col items-center py-6 sm:py-8">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.07] max-w-5xl">
                    The appointment-driven CRM for high-velocity teams.
                </h1>

                <p className="mt-5 sm:mt-7 text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed px-2">
                    Book appointments and manage customers with ease. miniCRM keeps booking and CRM in sync, automatically adding new customers and syncing your calendar.                </p>

                {/* Primary Call to Action */}
                <div className="mt-7 sm:mt-9 flex justify-center items-center w-full px-4">
                    <Button
                        className="w-auto h-11 px-8 rounded-xl bg-surface-elevated/75 hover:bg-surface-elevated text-foreground border border-white/20 hover:border-white/40 backdrop-blur-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all active:translate-y-px flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_8px_36px_rgba(0,0,0,0.5),0_0_28px_rgba(255,255,255,0.18)]"
                        onClick={() => navigate("/signup")}
                    >
                        <span>Start Free Trial</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
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
                        Appointment Booking Workflow
                    </span>
                    <div className="h-7 w-7 rounded-full border border-border bg-surface-elevated/80 flex items-center justify-center transition-transform group-hover:translate-y-0.5">
                        <ChevronDown className="h-3.5 w-3.5 text-primary animate-pulse" />
                    </div>
                </button>
            </div>

        </section>
    );
};
