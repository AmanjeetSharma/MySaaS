import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Cpu, ShieldCheck, Zap, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
    {
        phase: "PHASE 01 // ARCHITECTURAL BLUEPRINT",
        title: "Raw Schematic & Ingestion",
        desc: "Every appointment begins as unformatted client demand. The blueprint engine sketches out the client footprint, identity tokens, and baseline dependencies.",
        stat: "Latency: <12ms",
        highlight: "Core Identity Grid"
    },
    {
        phase: "PHASE 02 // REAL-TIME ASSEMBLY",
        title: "Neural Engine & Calendar Mesh",
        desc: "Components lock together under scroll inertia. Availability windows calculate across cross-continental timezones, assembling live telemetry and video bridges.",
        stat: "Integrations: Synced",
        highlight: "Matrix Synchronization"
    },
    {
        phase: "PHASE 03 // FULL PRODUCTION SUITE",
        title: "The Finished Autonomous Cockpit",
        desc: "The device fully forms into an enterprise-grade execution hub. Deals move across stages, analytics project probability, and action items dispatch without friction.",
        stat: "Uptime: 99.99%",
        highlight: "Unified CRM Core"
    }
];

export const ScrollStoryShowcase = () => {
    const pinContainerRef = useRef(null);
    const device3DRef = useRef(null);
    const glowBackdropRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            const storyTl = gsap.timeline({
                scrollTrigger: {
                    trigger: pinContainerRef.current,
                    start: "top top",
                    end: "+=320%",
                    scrub: 0.8,
                    pin: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        if (progress < 0.35) setActiveStep(0);
                        else if (progress < 0.72) setActiveStep(1);
                        else setActiveStep(2);
                    }
                }
            });

            // Cinematic sequence: Rotate object, morph wireframe to solid, change lighting
            storyTl
                // Scene 1 to 2: Rotate, expand wireframe to assembled
                .to(device3DRef.current, {
                    rotateY: 28,
                    rotateX: 14,
                    scale: 1.08,
                    ease: "power1.inOut",
                    duration: 1
                })
                .to(".wireframe-line", { strokeDashoffset: 0, opacity: 0.8, duration: 0.5 }, "<")
                .to(glowBackdropRef.current, { backgroundColor: "rgba(59, 130, 246, 0.12)", scale: 1.25, duration: 1 }, "<")

                // Scene 2 to 3: Final product assembly (solid glassmorphic chassis & glow)
                .to(device3DRef.current, {
                    rotateY: -10,
                    rotateX: 6,
                    scale: 1.15,
                    ease: "power2.out",
                    duration: 1
                })
                .to(".solid-device-layer", { opacity: 1, scale: 1, duration: 0.8 }, "<")
                .to(".blueprint-layer", { opacity: 0.2, filter: "blur(4px)", duration: 0.8 }, "<")
                .to(glowBackdropRef.current, { backgroundColor: "rgba(255, 255, 255, 0.1)", scale: 1.4, duration: 1 }, "<");

        }, pinContainerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={pinContainerRef} className="relative w-full h-screen bg-[#060608] text-white flex items-center justify-center overflow-hidden border-t border-b border-white/10">

            {/* Background Mood Shift */}
            <div
                ref={glowBackdropRef}
                className="absolute w-[600px] md:w-[900px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 bg-emerald-500/10"
            />

            <div className="max-w-7xl w-full mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full relative z-10">

                {/* Left: Dynamic Scroll Narrative Text */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[11px] font-mono tracking-widest text-zinc-300 w-fit backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        <span>{scenes[activeStep].phase}</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white transition-all duration-300">
                        {scenes[activeStep].title}
                    </h2>

                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md transition-opacity duration-300">
                        {scenes[activeStep].desc}
                    </p>

                    <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-xs font-mono text-zinc-400">
                        <div>
                            <span className="text-zinc-500 block text-[10px]">TELEMETRY</span>
                            <span className="text-white font-medium">{scenes[activeStep].stat}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-[10px]">ACTIVE COMPONENT</span>
                            <span className="text-white font-medium">{scenes[activeStep].highlight}</span>
                        </div>
                    </div>
                </div>

                {/* Right: 3D Product Morphing Artifact (Rotating Device Chassis) */}
                <div className="lg:col-span-7 flex items-center justify-center perspective-[1400px]">
                    <div
                        ref={device3DRef}
                        className="w-[320px] sm:w-[460px] h-[480px] sm:h-[540px] rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.01] p-6 shadow-2xl relative preserve-3d backdrop-blur-xl transition-shadow hover:shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                    >
                        {/* Blueprint Layer (Scene 1) */}
                        <div className="blueprint-layer absolute inset-0 p-6 flex flex-col justify-between transition-all duration-500 pointer-events-none">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-white/10 pb-2">
                                <span>SKETCH_REF // 09A</span>
                                <span>SCHEMATIC MODE</span>
                            </div>
                            <svg className="w-full h-44 stroke-white/40 fill-none" viewBox="0 0 200 120">
                                <rect x="10" y="10" width="180" height="100" rx="8" strokeWidth="1" strokeDasharray="4 4" />
                                <path d="M 20 40 L 180 40 M 20 75 L 140 75" strokeWidth="1.2" className="wireframe-line" />
                                <circle cx="160" cy="75" r="8" strokeWidth="1.2" />
                            </svg>
                            <div className="text-[11px] font-mono text-zinc-400 text-right">RAW DATA UNJOINED</div>
                        </div>

                        {/* Solid Functional Glass Cockpit (Scenes 2 & 3) */}
                        <div className="solid-device-layer absolute inset-4 rounded-2xl bg-black/60 border border-white/20 p-5 flex flex-col justify-between opacity-40 transition-all duration-500 shadow-inner">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                                    <span className="text-xs font-bold font-mono tracking-wide">MINI_OPERATOR v2.4</span>
                                </div>
                                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                            </div>

                            {/* Dynamic Interactive Hotspots */}
                            <div className="space-y-3 my-auto">
                                <div className={`p-3 rounded-lg border transition-all duration-300 ${activeStep >= 1 ? 'border-white/40 bg-white/10 shadow-lg' : 'border-white/10 bg-white/5'}`}>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-400">Pipeline Bridge</span>
                                        <span className="text-emerald-400 font-mono text-[10px]">CONNECTED</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full bg-white transition-all duration-700 ${activeStep === 0 ? 'w-1/4' : activeStep === 1 ? 'w-3/4' : 'w-full'}`} />
                                    </div>
                                </div>

                                <div className={`p-3 rounded-lg border transition-all duration-300 ${activeStep === 2 ? 'border-white/50 bg-white/15 scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'border-white/10 bg-white/5'}`}>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-white">Deal Revenue Locking</span>
                                        <span className="font-mono text-zinc-200 text-xs">$14,200</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-400 mt-1">Status: Stage Advance Dispatched</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-zinc-400">
                                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Core: Active</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Encrypted</span>
                            </div>
                        </div>

                        {/* Glowing Accent Ring */}
                        <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-r from-white/10 via-transparent to-white/15 pointer-events-none -z-10 blur-sm" />
                    </div>
                </div>

            </div>
        </section>
    );
};