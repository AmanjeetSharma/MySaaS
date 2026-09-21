import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Sparkles,
    RefreshCw,
    Unplug,
    ExternalLink,
    Calendar,
    Search,
    CornerDownRight,
    Check,
    Copy,
    ChevronDown,
    Clock,
    ArrowDown
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
);

export const ScrollStoryShowcase = () => {
    const pinContainerRef = useRef(null);
    const cardTiltRef = useRef(null);
    const cardFlipRef = useRef(null);
    const scrollTriggerRef = useRef(null);
    const [currentPill, setCurrentPill] = useState(0);

    // 1. Interactive 3D Cursor Parallax
    useEffect(() => {
        const card = cardTiltRef.current;
        if (!card) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let rafId = null;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Strict clamp to max ±6 degrees so it NEVER flips or looks too up or down
            const maxDeg = 6;
            const rotY = Math.max(-maxDeg, Math.min(maxDeg, (x / (rect.width / 2)) * maxDeg));
            const rotX = Math.max(-maxDeg, Math.min(maxDeg, -(y / (rect.height / 2)) * maxDeg));

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                gsap.to(card, {
                    rotateY: rotY,
                    rotateX: rotX,
                    ease: 'power2.out',
                    duration: 0.35,
                    overwrite: 'auto'
                });
            });
        };

        const handleReset = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            gsap.to(card, {
                rotateY: 0,
                rotateX: 0,
                ease: 'power2.out',
                duration: 0.5,
                overwrite: 'auto'
            });
        };

        card.addEventListener('mousemove', handleMouseMove, { passive: true });
        card.addEventListener('mouseleave', handleReset);
        window.addEventListener('scroll', handleReset, { passive: true });

        // Ambient mobile float
        let floatTween = null;
        if (window.matchMedia('(max-width: 768px)').matches) {
            floatTween = gsap.to(card, {
                rotateY: 2,
                rotateX: -1.2,
                repeat: -1,
                yoyo: true,
                duration: 3.5,
                ease: 'sine.inOut',
            });
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleReset);
            window.removeEventListener('scroll', handleReset);
            if (floatTween) floatTween.kill();
        };
    }, []);

    // 2. Cinematic GSAP Pinned Parallax Scroll with Defined Pauses & Distinct Steps
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const isMobile = window.innerWidth < 1024;

        const ctx = gsap.context(() => {
            const storyTl = gsap.timeline({
                scrollTrigger: {
                    trigger: pinContainerRef.current,
                    start: "top top",
                    end: isMobile ? "+=260%" : "+=340%",
                    scrub: 0.5,
                    pin: true,
                    pinSpacing: true,
                    onUpdate: (self) => {
                        const p = self.progress;
                        if (p < 0.25) setCurrentPill(0);
                        else if (p < 0.55) setCurrentPill(1);
                        else if (p < 0.82) setCurrentPill(2);
                        else setCurrentPill(3);
                    }
                }
            });

            scrollTriggerRef.current = storyTl.scrollTrigger;

            // --- STEP 1: Connect Google Account (Schematic dissolves -> Integration Cockpit locks in) ---
            storyTl
                .to(".schematic-overlay-layer", {
                    opacity: 0,
                    scale: 0.96,
                    filter: "blur(6px)",
                    duration: 0.5,
                    ease: "power1.inOut"
                })
                .to(".integration-cockpit-layer", {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.5,
                    ease: "power1.out"
                }, "<")
                // Dedicated pause/hold for Step 1
                .to({}, { duration: 0.8 })

                // --- STEP 2: Transition to "Appointments Are Created Here" ---
                .to(".narrative-step-1", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-2", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".destination-feed-card", {
                    borderColor: "rgba(52, 211, 153, 0.75)",
                    backgroundColor: "rgba(6, 78, 59, 0.28)",
                    boxShadow: "0 0 24px rgba(52, 211, 153, 0.22)",
                    duration: 0.5
                }, "<")
                .to(".destination-badge", { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, "<")
                // Dedicated pause/hold for Step 2
                .to({}, { duration: 0.9 })

                // --- STEP 3: Transition to "Two-Way Conflict Elimination" ---
                .to(".narrative-step-2", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-3", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".sync-pulse-indicator", {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    duration: 0.4
                }, "<")
                // Dedicated pause/hold for Step 3
                .to({}, { duration: 0.9 })

                // --- STEP 4 (NEXT): 3D Flip to reveal the Big Down Arrow ---
                .to(".narrative-step-3", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-4", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(cardFlipRef.current, {
                    rotateY: 180,
                    duration: 0.9,
                    ease: "power2.inOut"
                }, "<")
                // Dedicated pause/hold for Step 4 (Big Down Arrow)
                .to({}, { duration: 0.7 });

        }, pinContainerRef);

        return () => ctx.revert();
    }, []);

    // Step jump: scroll directly to the corresponding timeline milestone
    const handleStepJump = (index) => {
        const st = scrollTriggerRef.current;
        if (!st) return;

        const targetProgress = index === 0 ? 0.05 : index === 1 ? 0.38 : index === 2 ? 0.68 : 0.92;
        const targetScroll = st.start + targetProgress * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    };

    return (
        <section
            ref={pinContainerRef}
            className="relative z-10 w-full h-screen bg-transparent text-foreground flex items-center justify-center overflow-hidden border-t border-b border-border/40"
        >
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full relative z-10">

                {/* Left: Synchronously Animated Step Narratives */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-6 text-left">

                    {/* Step Jumper Pills */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {['01 // Connect', '02 // Route', '03 // Sync', 'Next ↓'].map((label, idx) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => handleStepJump(idx)}
                                className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all border cursor-pointer ${currentPill === idx
                                    ? 'bg-primary text-primary-foreground font-bold border-primary shadow-sm'
                                    : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Stacked Narrative Stage Container */}
                    <div className="relative min-h-[180px] sm:min-h-[210px]">
                        {/* Stage 1: Connect Google Account */}
                        <div className="narrative-step-1 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 01 // DIRECT INTEGRATION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Connect Google Account
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Link your Google Workspace in a single click. miniCRM discovers all personal, shared, and team calendar feeds automatically with zero manual setup.
                            </p>
                        </div>

                        {/* Stage 2: Appointments Are Created Here */}
                        <div className="narrative-step-2 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-[11px] font-mono tracking-widest text-emerald-400 w-fit backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span>STEP 02 // AUTO-BOOKING DESTINATION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Appointments Are Created Here
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Designate your primary destination calendar with pinpoint accuracy. Outbound client bookings are routed directly into this feed with automatic buffer rules.
                            </p>
                        </div>

                        {/* Stage 3: Two-Way Conflict Elimination */}
                        <div className="narrative-step-3 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 03 // REALTIME SYNC</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Two-Way Conflict Elimination
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Personal appointments and team holidays automatically block booking availability. Video bridges and WhatsApp reminder alerts sync in realtime.
                            </p>
                        </div>

                        {/* Stage 4: Next -> Flip & Scroll to CRM */}
                        <div className="narrative-step-4 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-[11px] font-mono tracking-widest text-emerald-400 w-fit backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span>STEP 04 // READY FOR CRM</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Integration Complete
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Google Calendar is linked and verified. Continue scrolling down to enter the Core CRM & Operations Suite.
                            </p>
                        </div>
                    </div>

                    {/* Step Telemetry Bottom Strip */}
                    <div className="pt-3 border-t border-border flex items-center gap-6 text-xs font-mono text-muted-foreground">
                        <div>
                            <span className="text-muted-foreground/70 block text-[10px]">INTEGRATION TELEMETRY</span>
                            <span className="text-foreground font-medium">
                                {currentPill === 0 && 'Feeds: 5 Detected'}
                                {currentPill === 1 && 'Active: Primary Work Calendar'}
                                {currentPill === 2 && 'Sync Status: Realtime Active'}
                                {currentPill === 3 && 'Ready for CRM Pipeline'}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground/70 block text-[10px]">ROUTING STATUS</span>
                            <span className="text-emerald-400 font-medium">
                                {currentPill === 0 && 'Google OAuth 2.0 Synced'}
                                {currentPill === 1 && '↳ Auto-Booking Active'}
                                {currentPill === 2 && 'Zero-Collision Engine'}
                                {currentPill === 3 && 'Scroll Down ↓'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: 3D Parallax Integration Cockpit Card (Cursor Tilt + 3D Flip) */}
                <div className="lg:col-span-7 flex items-center justify-center perspective-[1400px] w-full">
                    {/* Outer Tilt Wrapper (tracks mouse cursor) */}
                    <div
                        ref={cardTiltRef}
                        className="w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[500px] lg:max-w-[580px] min-h-[440px] sm:min-h-[460px] relative preserve-3d card-3d-wrap gsap-tilt"
                    >
                        {/* Inner Flip Wrapper (rotates 180° upon phase 3 completion) */}
                        <div
                            ref={cardFlipRef}
                            className="w-full h-full relative preserve-3d transition-transform duration-700"
                        >
                            {/* ================= FRONT FACE: Google Calendar Integration Cockpit ================= */}
                            <div className="w-full rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl relative backface-hidden flex flex-col gap-3">

                                {/* Initial "Raw Schematic & Ingestion" Layer (Fades and Disappears on Scroll) */}
                                <div className="schematic-overlay-layer absolute inset-0 z-30 rounded-2xl bg-card/95 p-4 sm:p-6 flex flex-col justify-between pointer-events-none transition-all duration-500 border border-border">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground border-b border-border pb-2">
                                        <span>SCHEMATIC_INGEST // RAW DEMAND</span>
                                        <span className="text-primary font-semibold animate-pulse">CONNECTING MESH...</span>
                                    </div>

                                    <div className="my-auto space-y-3">
                                        <svg className="w-full h-24 sm:h-32 stroke-muted-foreground/40 fill-none" viewBox="0 0 200 80">
                                            <rect x="10" y="10" width="180" height="60" rx="6" strokeWidth="1" strokeDasharray="3 3" />
                                            <path d="M 20 30 L 180 30 M 20 50 L 130 50" strokeWidth="1.2" className="stroke-primary/70" />
                                            <circle cx="150" cy="50" r="5" className="fill-primary/20 stroke-primary" />
                                        </svg>
                                        <div className="p-2.5 rounded-lg border border-border bg-surface text-[10px] font-mono text-foreground">
                                            <div className="flex justify-between">
                                                <span>CLIENT: Enterprise User</span>
                                                <span className="text-primary font-semibold">DISCOVERING FEEDS</span>
                                            </div>
                                            <div className="text-muted-foreground mt-0.5">AUTH: accounts.google.com/o/oauth2</div>
                                        </div>
                                    </div>

                                    <div className="text-[10px] font-mono text-muted-foreground text-right">
                                        SCROLL TO ASSEMBLE LIVE COCKPIT ↓
                                    </div>
                                </div>

                                {/* Live Google Calendar Integration Cockpit (Matching Provided Image) */}
                                <div className="integration-cockpit-layer opacity-20 filter blur-[2px] transition-all duration-500 flex flex-col gap-2.5 text-left">
                                    {/* 1. Header Bar: Google Calendar + Connected Badge + Sync/Disconnect */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-surface border border-border">
                                        <div className="flex items-center gap-2">
                                            <GoogleIcon />
                                            <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">Google Calendar</span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>Connected</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <div className="sync-pulse-indicator inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-surface-elevated border border-border text-foreground transition-all">
                                                <RefreshCw className="w-3 h-3 text-muted-foreground" />
                                                <span>Sync</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                                                <Unplug className="w-3 h-3 text-red-400" />
                                                <span>Disconnect</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Connected Account Strip */}
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                                    alex.morgan@workspace.com
                                                </span>
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    Active
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span>Connected on Sep 21, 2026</span>
                                            </p>
                                        </div>

                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-surface border border-border text-foreground hover:bg-surface-elevated shrink-0">
                                            <span>Open Calendar</span>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* 3. Feeds Container */}
                                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-surface border border-border flex flex-col gap-2.5">
                                        {/* Feeds Header + Filter */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-foreground/80" />
                                                    <span className="text-xs sm:text-sm font-bold text-foreground">Google Calendar Feeds</span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-surface-elevated border border-border">
                                                        5 calendars
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Select which calendar feed receives incoming client bookings.
                                                </p>
                                            </div>

                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-elevated border border-border text-[10px] text-muted-foreground">
                                                <Search className="w-3 h-3 text-muted-foreground" />
                                                <span>Filter calendars...</span>
                                            </div>
                                        </div>

                                        {/* Feed 1: Active Destination (Appointments are created here) */}
                                        <div className="destination-feed-card p-2.5 sm:p-3 rounded-lg border border-border bg-surface-elevated transition-all duration-300 flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                    <span className="text-xs font-bold text-foreground truncate">
                                                        Primary Work Calendar
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-surface border border-border text-muted-foreground">
                                                        Primary
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                    Primary Calendar For Client & Team Scheduling
                                                </p>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400">
                                                    <CornerDownRight className="w-3 h-3 text-emerald-400 shrink-0" />
                                                    <span className="destination-badge">Appointments are being created here</span>
                                                </div>
                                                <div className="text-[9px] font-mono text-muted-foreground mt-1 flex items-center gap-1 truncate">
                                                    <span className="truncate">ID: alex.morgan@workspace.com</span>
                                                    <Copy className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                                </div>
                                            </div>

                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 shrink-0">
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                <span>In Use</span>
                                            </span>
                                        </div>

                                        {/* Feed 2 */}
                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface-elevated/40 flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                    <span className="text-xs font-semibold text-foreground/80 truncate">
                                                        Product & Team Workshops
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                    Internal knowledge sharing & sprints
                                                </p>
                                                <div className="text-[9px] font-mono text-muted-foreground mt-1 flex items-center gap-1 truncate">
                                                    <span className="truncate">ID: team.workshops.c10065@group.calendar.google.com</span>
                                                    <Copy className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                                </div>
                                            </div>

                                            <span className="px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground bg-surface border border-border shrink-0">
                                                Set as Active
                                            </span>
                                        </div>

                                        {/* Feed 3 */}
                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface-elevated/40 flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                                                    <span className="text-xs font-semibold text-foreground/80 truncate">
                                                        Executive Briefings
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                    Enterprise customer syncs & reviews
                                                </p>
                                            </div>

                                            <span className="px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground bg-surface border border-border shrink-0">
                                                Set as Active
                                            </span>
                                        </div>

                                        {/* Scroll indicator */}
                                        <div className="flex justify-center pt-1">
                                            <div className="h-4 w-4 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground">
                                                <ChevronDown className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ================= BACK FACE: 3D Flip with Big Down Arrow ================= */}
                            <div className="absolute inset-0 rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-between text-center">
                                {/* Top Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Google Calendar Synchronized</span>
                                </div>

                                {/* Center: Big Glowing Animated Down Arrow */}
                                <div className="relative flex flex-col items-center justify-center my-auto py-4">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-28 h-28 rounded-full bg-primary/10 animate-ping" />
                                        <div className="absolute w-24 h-24 rounded-full border border-primary/20 animate-pulse" />
                                        <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-surface-elevated border-2 border-primary flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.2)]">
                                            <ArrowDown className="w-9 h-9 sm:w-11 sm:h-11 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <span className="mt-4 text-xs font-mono tracking-wider text-muted-foreground uppercase">
                                        CONTINUE SCROLLING
                                    </span>
                                </div>

                                {/* Bottom Direction Text */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                                        Core CRM & Operations Suite
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                                        Appointments now flow directly into customer directories and sales pipeline stages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};