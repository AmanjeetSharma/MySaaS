import { useRef, useEffect } from 'react';
import { Clock, Users, Kanban, Video, Shield, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CrmCapabilitiesDeck = ({ activeLayer, setActiveLayer, features }) => {
    const deckContainerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".capability-item", {
                scrollTrigger: {
                    trigger: deckContainerRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 35,
                stagger: 0.12,
                duration: 0.8,
                ease: "power2.out"
            });
        }, deckContainerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={deckContainerRef} className="w-full max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col gap-20">

            {/* 3D Stacking Layer Module */}
            <div id="crm" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start perspective-container">

                <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="mb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Core CRM & Suite</h2>
                        <p className="text-xs text-muted-foreground mt-1">Surgically manage leads from contact capture to deal execution.</p>
                    </div>

                    {features.map((feat, index) => (
                        <div
                            key={feat.id}
                            onClick={() => setActiveLayer(index)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${activeLayer === index
                                ? 'border-white/30 bg-surface-elevated shadow-[0_4px_20px_rgba(0,0,0,0.5)] moon-glow-subtle'
                                : 'border-border/60 bg-card hover:border-border hover:bg-surface'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{feat.badge}</span>
                                {activeLayer === index && <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mt-1.5">{feat.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{feat.subtitle}</p>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-7 p-6 rounded-xl border border-border bg-card/90 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between card-3d-wrap">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-border/60">
                            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                                ACTIVE MODULE // 0{activeLayer + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded border border-white/20 bg-surface-elevated text-[11px] font-medium text-foreground">
                                Operational
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mt-3">{features[activeLayer].title}</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{features[activeLayer].detail}</p>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-surface border border-border/80 shadow-md font-mono text-xs">
                        <span className="text-zinc-500 block text-[10px] mb-1">REALTIME DATA STREAM</span>
                        <div className="text-foreground font-semibold">{JSON.stringify(features[activeLayer].preview, null, 2)}</div>
                    </div>
                </div>
            </div>

            {/* Five Native Architectural Capabilities Grid */}
            <div id="capabilities" className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-10 border-t border-border/40">
                <div className="md:col-span-12 mb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Engineered for Service Operations</h2>
                </div>

                <div className="capability-item md:col-span-7 p-6 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                            <Clock className="h-4 w-4" /> <span>01 // Availability Architecture</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mt-2">Granular Service Scheduling & Slot Buffers</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Custom buffers, multi-timezone normalization, daily booking rate limits, and zero-friction client cancellation limits.
                        </p>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-muted-foreground pt-4 border-t border-border/60">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" /> Buffer rules</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" /> Self-serve reschedules</span>
                    </div>
                </div>

                <div className="capability-item md:col-span-5 p-6 rounded-xl border border-border bg-card card-3d-wrap flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                            <Users className="h-4 w-4" /> <span>02 // Relationship History</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mt-2">Customer Profiles & Timelines</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Continuous chronological ledger recording appointments, stage migrations, email alerts, and custom notes.
                        </p>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground pt-4 border-t border-border/60">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" /> Immutable interaction log</span>
                    </div>
                </div>

                <div className="capability-item md:col-span-4 p-6 rounded-xl border border-border bg-card card-3d-wrap">
                    <Kanban className="h-4 w-4 text-zinc-300" />
                    <h3 className="text-base font-bold text-foreground mt-2">Visual Deal Pipelines</h3>
                    <p className="text-xs text-muted-foreground mt-1">Stage velocity tracking and monetary forecasting.</p>
                </div>

                <div className="capability-item md:col-span-4 p-6 rounded-xl border border-border bg-card card-3d-wrap">
                    <Video className="h-4 w-4 text-zinc-300" />
                    <h3 className="text-base font-bold text-foreground mt-2">Video & Calendar Bridge</h3>
                    <p className="text-xs text-muted-foreground mt-1">Automatic Google Meet, Teams, and Zoom room provisioning.</p>
                </div>

                <div className="capability-item md:col-span-4 p-6 rounded-xl border border-border bg-card card-3d-wrap">
                    <Shield className="h-4 w-4 text-zinc-300" />
                    <h3 className="text-base font-bold text-foreground mt-2">Tenant Organization Safety</h3>
                    <p className="text-xs text-muted-foreground mt-1">Multi-workspace tenancy with role-based permissions.</p>
                </div>
            </div>
        </div>
    );
};