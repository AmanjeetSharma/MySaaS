import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Calendar, Kanban, Clock } from "lucide-react";
import gsap from 'gsap';

export const HeroCockpit = ({ selectedSlot, setSelectedSlot, onExploreClick }) => {
    const navigate = useNavigate();
    const cockpitWrapRef = useRef(null);
    const headlineRef = useRef(null);

    useEffect(() => {
        const card = cockpitWrapRef.current;
        if (!card) return;

        // Mouse tilt micro-interaction on cockpit
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(card, {
                rotateY: x * 0.02,
                rotateX: -y * 0.02,
                ease: 'power2.out',
                duration: 0.5,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, { rotateY: 0, rotateX: 0, ease: 'power2.out', duration: 0.7 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section className="w-full px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto flex flex-col items-center text-center">
            <h1 ref={headlineRef} className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-tighter leading-[1.05] max-w-5xl">
                The appointment-driven CRM for high-velocity teams.
            </h1>

            <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
                miniCRM pairs public client booking directly with full customer relationship management. Every booked session captures customer details, advances deals across stages, and syncs your calendar automatically.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                    className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm cursor-pointer transition-all active:translate-y-px flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_28px_rgba(255,255,255,0.22)]"
                    onClick={() => navigate("/signup")}
                >
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <a
                    href="#crm"
                    onClick={onExploreClick}
                    className="h-10 px-5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated font-medium text-sm flex items-center gap-2 transition-colors hover:border-white/30"
                >
                    <span>Explore Platform</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
            </div>

            {/* Parallax Cockpit Simulator */}
            <div
                ref={cockpitWrapRef}
                className="mt-14 w-full max-w-5xl rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 md:p-6 shadow-2xl text-left relative overflow-hidden card-3d-wrap preserve-3d"
            >
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-border/60 gap-2 text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full moon-dot animate-pulse" />
                        <span className="tracking-wide uppercase font-semibold text-foreground">Unified Operating Engine</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded border border-border bg-surface-elevated text-[10px] text-muted-foreground">
                            Google Calendar: Synced
                        </span>
                        <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-[10px] text-foreground font-medium">
                            Realtime Active
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                    {/* Left: Booking View */}
                    <div className="lg:col-span-5 flex flex-col gap-3.5 p-4 rounded-lg border border-border/80 bg-surface">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-zinc-300" /> Public Booking Interface
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">/book/apex/consult</span>
                        </div>

                        <div className="p-3 rounded-md bg-surface-elevated border border-border/60">
                            <p className="text-xs font-semibold text-foreground">45m Technical Architecture Review</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Apex Advisory • Google Meet attached</p>
                        </div>

                        <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-2">Available Slots (Today)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['11:30', '14:00', '16:30'].map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`h-8 rounded-lg text-xs font-medium border transition-all cursor-pointer ${selectedSlot === slot
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

                    {/* Center: Connective Indicator */}
                    <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center text-center px-2">
                        <div className="h-px w-full bg-border relative">
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-surface-elevated border border-white/30 text-[10px] font-semibold text-foreground shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center gap-1">
                                <span>Auto-Sync</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                            </span>
                        </div>
                    </div>

                    {/* Right: CRM View */}
                    <div className="lg:col-span-5 flex flex-col gap-3.5 p-4 rounded-lg border border-border/80 bg-surface">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Kanban className="h-3.5 w-3.5 text-zinc-300" /> CRM Pipeline Workspace
                            </span>
                            <span className="text-[10px] text-foreground font-medium flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Deal Stage Updated
                            </span>
                        </div>

                        <div className="p-3 rounded-md bg-surface-elevated border border-border/80 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Apex Engineering</span>
                                <span className="text-xs font-semibold text-foreground">$4,500</span>
                            </div>
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" /> Slot: Today, {selectedSlot} GMT
                                </span>
                                <span className="text-foreground font-medium">Synced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};