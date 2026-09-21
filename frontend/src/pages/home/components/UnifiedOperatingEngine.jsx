import { useRef, useEffect } from 'react';
import { Calendar, Kanban, Clock, ArrowRight, ArrowDown } from "lucide-react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const UnifiedOperatingEngine = ({ selectedSlot, setSelectedSlot }) => {
    const engineContainerRef = useRef(null);
    const headerRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const isMobile = window.innerWidth < 1024;
        const card = cardRef.current;
        const header = headerRef.current;
        const container = engineContainerRef.current;

        if (!card || !container) return;

        // Clean static initial size vs full zoomed immersion
        const initialScale = isMobile ? 0.94 : 0.88;
        const targetScale = isMobile ? 1.02 : 1.14;

        gsap.set(card, {
            scale: initialScale,
            transformOrigin: "center center",
            willChange: "transform, box-shadow",
        });

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: isMobile ? "+=130%" : "+=170%",
                    scrub: 0.6,
                    pin: true,
                    pinSpacing: true
                }
            });

            // 1. Brief hold at initial static card view
            tl.to({}, { duration: 0.2 })
                // 2. Smooth zoom scrub: scales up to full size, header floats up slightly
                .to(card, {
                    scale: targetScale,
                    boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 255, 255, 0.12)",
                    borderColor: "rgba(255, 255, 255, 0.28)",
                    duration: 1.2,
                    ease: "power2.inOut"
                }, "<")
                .to(header, {
                    y: isMobile ? -8 : -20,
                    opacity: 0.3,
                    duration: 1.2,
                    ease: "power2.inOut"
                }, "<")
                // 3. Settled hold at full zoom before cleanly transitioning to next section
                .to({}, { duration: 0.35 });

        }, container);

        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <section
            id="engine"
            ref={engineContainerRef}
            className="relative z-10 w-full h-screen bg-transparent flex flex-col items-center justify-center overflow-hidden border-t border-border/40 px-4 sm:px-6 select-none"
        >
            {/* Section Header */}
            <div ref={headerRef} className="flex flex-col items-center max-w-3xl mb-6 sm:mb-8 text-center transition-all duration-300">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                    Appointment Booking Workflow
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Experience how an inbound client booking automatically synthesizes customer profiles, updates pipeline deal values, and synchronizes Google Calendar in real time.
                </p>
            </div>

            {/* Telemetry Simulator Card (Static initially -> Smoothly Zooms on Scroll -> Holds -> Next Content) */}
            <div
                ref={cardRef}
                className="w-full max-w-5xl rounded-xl border border-border bg-card/95 backdrop-blur-xl p-3.5 sm:p-5 md:p-6 shadow-2xl text-left relative overflow-hidden transition-colors"
            >
                {/* Cockpit Top Bar */}
                <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 border-b border-border/60 gap-2 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full moon-dot text-primary animate-pulse" />
                        <span className="tracking-wide uppercase font-semibold text-foreground">Live Telemetry Simulation</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="px-2 py-0.5 rounded border border-border bg-surface-elevated text-[10px] text-muted-foreground">
                            Google Calendar: Synced
                        </span>
                        <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-[10px] text-foreground font-medium">
                            Realtime Active
                        </span>
                    </div>
                </div>

                {/* Cockpit Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-4 sm:pt-5 items-stretch">
                    {/* Left: Booking View */}
                    <div className="lg:col-span-5 flex flex-col gap-3 p-3.5 sm:p-4 rounded-lg border border-border/80 bg-surface">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                                <Calendar className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                                <span className="truncate">Public Booking Interface</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">/book/apex/consult</span>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-md bg-surface-elevated border border-border/60">
                            <p className="text-xs font-semibold text-foreground">45m Technical Architecture Review</p>
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Apex Advisory • Google Meet attached</p>
                        </div>

                        <div>
                            <label className="text-[10px] sm:text-[11px] font-medium text-muted-foreground block mb-2">
                                Available Slots (Select to test real-time sync)
                            </label>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                {['11:30', '14:00', '16:30'].map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`h-8 sm:h-8 rounded-lg text-[11px] sm:text-xs font-medium border transition-all cursor-pointer ${selectedSlot === slot
                                            ? 'border-white/60 bg-white/10 text-foreground font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                                            : 'border-border bg-surface-elevated text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {slot} GMT
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center: Connective Indicator (Desktop) */}
                    <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center text-center px-1">
                        <div className="h-px w-full bg-border relative">
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-surface-elevated border border-white/30 text-[10px] font-semibold text-foreground whitespace-nowrap flex items-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                <span>Auto-Sync</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                            </span>
                        </div>
                    </div>

                    {/* Center: Connective Indicator (Mobile/Tablet) */}
                    <div className="flex lg:hidden items-center justify-center -my-1">
                        <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-[10px] font-medium text-foreground flex items-center gap-1.5">
                            <span>Auto-creates Customer & Deal</span>
                            <ArrowDown className="h-3 w-3 text-primary" />
                        </span>
                    </div>

                    {/* Right: CRM View */}
                    <div className="lg:col-span-5 flex flex-col gap-3 p-3.5 sm:p-4 rounded-lg border border-border/80 bg-surface">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                                <Kanban className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                                <span className="truncate">CRM Pipeline Workspace</span>
                            </span>
                            <span className="text-[10px] text-foreground font-medium flex items-center gap-1 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Deal Stage Updated
                            </span>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-md bg-surface-elevated border border-border/80 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Apex Engineering</span>
                                <span className="text-xs font-semibold text-foreground">$4,500</span>
                            </div>
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1 truncate">
                                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="truncate">Slot: Today, {selectedSlot} GMT</span>
                                </span>
                                <span className="text-foreground font-medium shrink-0">Synced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
