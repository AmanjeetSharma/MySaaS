import { useRef, useEffect } from 'react';
import { Clock, Users, Kanban, Video, CheckCircle2, BellRing, Building2, Mail } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CrmCapabilitiesDeck = ({ activeLayer, setActiveLayer, features }) => {
    const deckContainerRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.from(".capability-item", {
                scrollTrigger: {
                    trigger: deckContainerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.7,
                ease: "power2.out"
            });
        }, deckContainerRef);

        return () => ctx.revert();
    }, []);

    // Calculate relative stack depth position for each card
    const getStackClass = (index) => {
        const diff = (index - activeLayer + features.length) % features.length;
        if (diff === 0) return 'stack-pos-0 border-white/30 moon-border-active shadow-2xl';
        if (diff === 1) return 'stack-pos-1 border-border/80 shadow-xl pointer-events-auto cursor-pointer';
        if (diff === 2) return 'stack-pos-2 border-border/60 shadow-lg pointer-events-auto cursor-pointer';
        return 'stack-pos-3 border-border/40 shadow-md pointer-events-auto cursor-pointer';
    };

    return (
        <div ref={deckContainerRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 flex flex-col gap-16 sm:gap-24 perspective-container">

            {/* 3D Stacking Layer Module */}
            <div id="crm" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Layer Selector (Tabs / Cards) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="mb-2 sm:mb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Core CRM & Operations Suite
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                            Click or tap any layer to shuffle through your unified booking-to-pipeline engine.
                        </p>
                    </div>

                    {/* Mobile Layer Selector (Horizontal Scrollable Pills) */}
                    <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 -mx-4 px-4 scrollbar-none">
                        {features.map((feat, index) => (
                            <button
                                key={feat.id}
                                type="button"
                                role="tab"
                                aria-selected={activeLayer === index}
                                onClick={() => setActiveLayer(index)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${activeLayer === index
                                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm'
                                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                                    }`}
                            >
                                <span>0{index + 1}.</span>
                                <span>{feat.title.split('&')[0].trim()}</span>
                            </button>
                        ))}
                    </div>

                    {/* Desktop Layer Navigation Cards */}
                    <div className="hidden lg:flex flex-col gap-2.5">
                        {features.map((feat, index) => (
                            <button
                                key={feat.id}
                                type="button"
                                role="tab"
                                aria-selected={activeLayer === index}
                                onClick={() => setActiveLayer(index)}
                                className={`p-4 rounded-xl border text-left transition-all cursor-pointer card-3d-wrap ${activeLayer === index
                                    ? 'border-white/30 bg-surface-elevated moon-glow-subtle'
                                    : 'border-border/60 bg-card hover:border-border hover:bg-surface'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {feat.badge}
                                    </span>
                                    {activeLayer === index && (
                                        <span className="h-2 w-2 rounded-full moon-dot text-primary animate-pulse" />
                                    )}
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mt-1.5">
                                    {feat.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {feat.subtitle}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Physical 3D Stacked Card Deck */}
                <div className="lg:col-span-7 relative min-h-[430px] sm:min-h-[460px] w-full max-w-[340px] xs:max-w-[380px] sm:max-w-xl mx-auto stack-deck-container pt-4 sm:pt-0">
                    {features.map((feat, index) => {
                        const stackClass = getStackClass(index);
                        const isTop = (index - activeLayer + features.length) % features.length === 0;

                        return (
                            <div
                                key={feat.id}
                                onClick={() => setActiveLayer(index)}
                                className={`stack-card-layer absolute inset-x-0 top-0 rounded-2xl bg-card/95 backdrop-blur-xl p-4 sm:p-6 border flex flex-col justify-between min-h-[380px] sm:min-h-[420px] ${stackClass}`}
                            >
                                {/* Card Top Bar */}
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-border/60 text-[10px] sm:text-[11px]">
                                        <span className="font-mono uppercase text-muted-foreground tracking-widest font-semibold truncate">
                                            DECK LAYER // 0{index + 1}: {feat.badge}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded border text-[10px] font-medium shrink-0 ${isTop
                                            ? 'border-white/30 bg-surface-elevated text-foreground'
                                            : 'border-border bg-surface text-muted-foreground'
                                            }`}>
                                            {isTop ? 'Active Deck' : 'Stack Layer'}
                                        </span>
                                    </div>

                                    <h3 className="text-sm sm:text-base font-bold text-foreground mt-3">
                                        {feat.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {feat.detail}
                                    </p>
                                </div>

                                {/* Custom Simulated Cockpit Views for Each Layer */}
                                <div className="mt-4 p-3.5 rounded-xl bg-surface border border-border/80 shadow-inner">
                                    {/* Layer 0: Customer Directory */}
                                    {index === 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold shadow-sm">
                                                        JD
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-foreground">Jordan Davies</div>
                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-2.5 w-2.5" /> jordan@acmecorp.com
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-surface-elevated border border-border text-foreground">
                                                    Active Client
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                                                <div className="p-2 rounded bg-surface-elevated border border-border/60">
                                                    <span className="text-[10px] text-muted-foreground block">Company</span>
                                                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5 truncate">
                                                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" /> Acme Global Inc.
                                                    </span>
                                                </div>
                                                <div className="p-2 rounded bg-surface-elevated border border-border/60">
                                                    <span className="text-[10px] text-muted-foreground block">Total Pipeline Value</span>
                                                    <span className="font-semibold text-foreground mt-0.5 block">$24,500 (3 Bookings)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Layer 1: Deals Pipeline */}
                                    {index === 1 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-bold text-foreground">Enterprise Platform Retainer</div>
                                                <div className="text-xs font-mono font-bold text-foreground">$15,000</div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                                    <span>Discovery</span>
                                                    <span className="text-foreground font-semibold">Proposal Sent</span>
                                                    <span>Review</span>
                                                    <span>Closed</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                                                    <div className="rounded-full bg-white" />
                                                    <div className="rounded-full bg-white" />
                                                    <div className="rounded-full bg-surface-elevated border border-border" />
                                                    <div className="rounded-full bg-surface-elevated border border-border" />
                                                </div>
                                            </div>

                                            <div className="p-2 rounded bg-surface-elevated border border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>Owner: Account Executive</span>
                                                <span className="text-foreground font-medium">Stage Probability: 75%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Layer 2: Activities & Tasks */}
                                    {index === 2 && (
                                        <div className="space-y-2">
                                            <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                                                <span>Automated Task Pipeline</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">3 ITEMS</span>
                                            </div>

                                            <div className="space-y-1.5 text-xs">
                                                <div className="p-2 rounded bg-surface-elevated border border-border/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                                        <span className="text-foreground text-[11px]">Generate Service Contract PDF</span>
                                                    </div>
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-card border border-border text-foreground">
                                                        High
                                                    </span>
                                                </div>

                                                <div className="p-2 rounded bg-surface-elevated border border-border/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BellRing className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        <span className="text-muted-foreground text-[11px]">Automated 24h Meeting Alert</span>
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground">Auto-Queued</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Layer 3: Interaction Timeline */}
                                    {index === 3 && (
                                        <div className="space-y-2">
                                            <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                                                <span>Interaction Ledger</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">REALTIME AUDIT</span>
                                            </div>

                                            <div className="space-y-1.5 text-[11px]">
                                                <div className="flex items-start gap-2 p-1.5 rounded bg-surface-elevated border border-border/60">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white mt-1 shrink-0" />
                                                    <div className="flex-1 truncate">
                                                        <span className="font-semibold text-foreground">Client Booked Discovery Session</span>
                                                        <p className="text-[10px] text-muted-foreground">45m Strategy Call • 14:02 UTC</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 p-1.5 rounded bg-surface-elevated/60 border border-border/40">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1 shrink-0" />
                                                    <div className="flex-1 truncate">
                                                        <span className="font-medium text-foreground">Calendar Bridge Synchronized</span>
                                                        <p className="text-[10px] text-muted-foreground">Event locked to primary feed • 14:03 UTC</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Five Native Architectural Capabilities Grid */}
            <div id="capabilities" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 sm:gap-6 pt-10 sm:pt-14 border-t border-border/60">
                <div className="sm:col-span-2 md:col-span-12 mb-2 sm:mb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Engineered for Service Operations
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Surgical tooling built specifically to run your consultancy or agency without bloated subscriptions.
                    </p>
                </div>

                <div className="capability-item sm:col-span-2 md:col-span-7 p-5 sm:p-6 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Clock className="h-4 w-4 text-foreground/70 shrink-0" />
                            <span>01 // Availability Architecture</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mt-2">
                            Granular Service Scheduling & Slot Buffers
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                            Configure minimum notice intervals, post-meeting cooldown buffers, multi-timezone normalization, and daily booking rate limits.
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-foreground" /> Buffer rules</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-foreground" /> Self-serve reschedules</span>
                    </div>
                </div>

                <div className="capability-item sm:col-span-2 md:col-span-5 p-5 sm:p-6 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Users className="h-4 w-4 text-foreground/70 shrink-0" />
                            <span>02 // Relationship History</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mt-2">
                            Customer Profiles & Timelines
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                            Continuous chronological audit ledger recording every meeting, stage migration, email confirmation, and custom note.
                        </p>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-foreground" /> Immutable interaction log</span>
                    </div>
                </div>

                <div className="capability-item sm:col-span-1 md:col-span-4 p-5 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <Kanban className="h-4 w-4 text-foreground/70" />
                        <h3 className="text-sm sm:text-base font-bold text-foreground mt-2">Visual Deal Pipelines</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            Stage velocity tracking, contract monetary values, and live revenue forecasting.
                        </p>
                    </div>
                </div>

                <div className="capability-item sm:col-span-1 md:col-span-4 p-5 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <Video className="h-4 w-4 text-foreground/70" />
                        <h3 className="text-sm sm:text-base font-bold text-foreground mt-2">Video & Calendar Bridge</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            Native two-way synchronization with Google Calendar, Zoom, and Microsoft Teams rooms.
                        </p>
                    </div>
                </div>

                <div className="capability-item sm:col-span-2 md:col-span-4 p-5 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <BellRing className="h-4 w-4 text-foreground/70" />
                        <h3 className="text-sm sm:text-base font-bold text-foreground mt-2">Reminders & Payments</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            Automated messaging & email reminders, payment gateway checkout, and multi-workspace tenancy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};