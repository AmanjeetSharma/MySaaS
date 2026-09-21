import { useRef, useEffect } from 'react';
import { Calendar, Kanban, Clock, ArrowRight, ArrowDown, Activity } from "lucide-react";
import gsap from 'gsap';

export const UnifiedOperatingEngine = ({ selectedSlot, setSelectedSlot }) => {
    const sectionRef = useRef(null);
    const cockpitWrapRef = useRef(null);

    useEffect(() => {
        const card = cockpitWrapRef.current;
        const section = sectionRef.current;
        if (!card || !section) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let isVisible = false;
        let cachedRect = null;
        let rafId = null;
        let mouseX = 0;
        let mouseY = 0;

        const updateRect = () => {
            if (isVisible) {
                cachedRect = card.getBoundingClientRect();
            }
        };

        const onFrame = () => {
            if (!cachedRect) updateRect();
            if (cachedRect) {
                const x = mouseX - cachedRect.left - cachedRect.width / 2;
                const y = mouseY - cachedRect.top - cachedRect.height / 2;

                gsap.to(card, {
                    rotateY: x * 0.022,
                    rotateX: -y * 0.022,
                    ease: 'power2.out',
                    duration: 0.5,
                    overwrite: 'auto'
                });
            }
            rafId = null;
        };

        const handleMouseMove = (e) => {
            if (!isVisible) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!rafId) {
                rafId = requestAnimationFrame(onFrame);
            }
        };

        const handleMouseLeave = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            gsap.to(card, {
                rotateY: 0,
                rotateX: 0,
                ease: 'power2.out',
                duration: 0.7,
                overwrite: 'auto'
            });
        };

        // Only attach / run when section is in viewport
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible) {
                updateRect();
            } else {
                handleMouseLeave();
            }
        }, { threshold: 0.05 });

        observer.observe(section);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', updateRect, { passive: true });
        card.addEventListener('mouseleave', handleMouseLeave);

        // Subtle ambient 3D float for touch/mobile screens
        let floatTween = null;
        if (window.matchMedia('(max-width: 768px)').matches) {
            floatTween = gsap.to(card, {
                rotateY: 2.5,
                rotateX: -1.5,
                repeat: -1,
                yoyo: true,
                duration: 3,
                ease: 'sine.inOut',
            });
        }

        return () => {
            observer.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateRect);
            card.removeEventListener('mouseleave', handleMouseLeave);
            if (floatTween) floatTween.kill();
        };
    }, []);

    return (
        <section ref={sectionRef} id="engine" className="w-full px-4 sm:px-6 py-16 sm:py-24 md:py-28 max-w-7xl mx-auto flex flex-col items-center text-center perspective-container border-t border-border/40">
            {/* Section Header */}
            <div className="flex flex-col items-center max-w-3xl mb-8 sm:mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit mb-3">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span>INTERACTIVE ARCHITECTURE // 02</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                    Unified Operating Engine
                </h2>
                <p className="mt-3 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                    Experience how an inbound client booking automatically synthesizes customer profiles, updates pipeline deal values, and synchronizes Google Calendar in real time.
                </p>
            </div>

            {/* Parallax 3D Cockpit Simulator */}
            <div
                ref={cockpitWrapRef}
                className="w-full max-w-5xl rounded-xl border border-border bg-card/90 backdrop-blur-xl p-3.5 sm:p-5 md:p-6 shadow-2xl text-left relative overflow-hidden card-3d-wrap preserve-3d"
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
