import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Footprints,
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
    ArrowDown,
    Radio,
    Video,
    Layers,
    ShieldCheck,
    User,
    UserMinus,
    CheckCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const GoogleIcon = ({ className = "w-4 h-4" }) => (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
);

const GoogleWordmark = () => (
    <div className="flex items-center gap-0.5 tracking-tight font-medium text-lg select-none">
        <span className="text-[#4285F4] font-bold">G</span>
        <span className="text-[#EA4335] font-bold">o</span>
        <span className="text-[#FBBC05] font-bold">o</span>
        <span className="text-[#4285F4] font-bold">g</span>
        <span className="text-[#34A853] font-bold">l</span>
        <span className="text-[#EA4335] font-bold">e</span>
    </div>
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

    // 2. Cinematic GSAP Pinned Parallax Scroll with 6 Distinct Steps
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const isMobile = window.innerWidth < 1024;

        const ctx = gsap.context(() => {
            const storyTl = gsap.timeline({
                scrollTrigger: {
                    trigger: pinContainerRef.current,
                    start: "top top",
                    end: isMobile ? "+=360%" : "+=460%",
                    scrub: 0.5,
                    pin: true,
                    pinSpacing: true,
                    onUpdate: (self) => {
                        const p = self.progress;
                        if (p < 0.16) setCurrentPill(0);
                        else if (p < 0.35) setCurrentPill(1);
                        else if (p < 0.54) setCurrentPill(2);
                        else if (p < 0.72) setCurrentPill(3);
                        else if (p < 0.88) setCurrentPill(4);
                        else setCurrentPill(5);
                    }
                }
            });

            scrollTriggerRef.current = storyTl.scrollTrigger;

            // --- STEP 1: Not Connected View (Initial hold) ---
            storyTl.to({}, { duration: 0.7 })

                // --- STEP 2: Transition to "Choose an account" modal ---
                .to(".narrative-step-1", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-2", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".not-connected-layer", { opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.in" }, "<")
                .to(".choose-account-layer", { opacity: 1, scale: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" }, "<")
                .to({}, { duration: 0.8 })

                // --- STEP 3: Transition to "Google Account Connected" ---
                .to(".narrative-step-2", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-3", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".choose-account-layer", { opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.in" }, "<")
                .to(".integration-cockpit-layer", { opacity: 1, scale: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" }, "<")
                .to({}, { duration: 0.8 })

                // --- STEP 4: Transition to "Appointments Are Created Here" ---
                .to(".narrative-step-3", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-4", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".destination-feed-card", {
                    borderColor: "rgba(52, 211, 153, 0.75)",
                    backgroundColor: "rgba(6, 78, 59, 0.28)",
                    boxShadow: "0 0 24px rgba(52, 211, 153, 0.22)",
                    duration: 0.5
                }, "<")
                .to(".destination-badge", { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, "<")
                .to({}, { duration: 0.8 })

                // --- STEP 5: Transition to "Sync Calendars" (Tooltip & Pulse Indication) ---
                .to(".narrative-step-4", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" })
                .to(".narrative-step-5", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(".sync-pulse-indicator", {
                    borderColor: "rgba(52, 211, 153, 0.8)",
                    backgroundColor: "rgba(6, 78, 59, 0.35)",
                    boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)",
                    duration: 0.4
                }, "<")
                .to(".sync-spin-icon", {
                    rotate: 360,
                    duration: 0.8,
                    ease: "power2.out"
                }, "<")
                .to(".sync-tooltip-pill", {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                }, "<0.1")
                .to(".sync-status-badge", {
                    scale: 1.05,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                }, "<")
                .to({}, { duration: 0.85 })

                // --- STEP 6 (NEXT): 3D Flip to reveal the Big Down Arrow ---
                .to(".sync-tooltip-pill", { opacity: 0, y: 4, duration: 0.3, ease: "power1.in" })
                .to(".narrative-step-5", { opacity: 0, y: -15, duration: 0.4, ease: "power2.in" }, "<")
                .to(".narrative-step-6", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.4, ease: "power2.out" })
                .to(cardFlipRef.current, {
                    rotateY: 180,
                    duration: 0.9,
                    ease: "power2.inOut"
                }, "<")
                .to({}, { duration: 0.7 });

        }, pinContainerRef);

        return () => ctx.revert();
    }, []);

    // Step jump: scroll directly to the corresponding timeline milestone
    const handleStepJump = (index) => {
        const st = scrollTriggerRef.current;
        if (!st) return;

        const milestones = [0.05, 0.23, 0.43, 0.62, 0.79, 0.95];
        const targetProgress = milestones[index] ?? 0;
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
                        {['01 Connect', '02 Choose Account', '03 Connected', '04 Route', '05 Sync Calendars', 'Next ↓'].map((label, idx) => (
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
                    <div className="relative min-h-[190px] sm:min-h-[220px]">
                        {/* Stage 1: Connect Google Calendar (Not Connected Page) */}
                        <div className="narrative-step-1 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 01 DIRECT INTEGRATION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Connect Google Calendar
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Connect your calendar to automatically create events, prevent scheduling conflicts, and generate meeting links for appointments.
                            </p>
                        </div>

                        {/* Stage 2: Choose an Account */}
                        <div className="narrative-step-2 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 02 ACCOUNT SELECTION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Choose an Account
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Select your Google account with single-click OAuth 2.0 authorization. No complex API keys or manual credentials required.
                            </p>
                        </div>

                        {/* Stage 3: Google Account Connected */}
                        <div className="narrative-step-3 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 03 DIRECT INTEGRATION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Google Account Connected
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Link your Google Workspace in a single click. miniCRM discovers all personal, shared, and team calendar feeds automatically with zero manual setup.
                            </p>
                        </div>

                        {/* Stage 4: Appointments Are Created Here */}
                        <div className="narrative-step-4 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-[11px] font-mono tracking-widest text-emerald-400 w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                                <span>STEP 04 AUTO-BOOKING DESTINATION</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Appointments Are Created Here
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Designate your primary destination calendar with pinpoint accuracy. Outbound client bookings are routed directly into this feed with automatic buffer rules.
                            </p>
                        </div>

                        {/* Stage 5: Sync Calendars */}
                        <div className="narrative-step-5 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[10px] sm:text-[11px] font-mono tracking-widest text-muted-foreground w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-primary" />
                                <span>STEP 05 REALTIME SYNC</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                                Sync Calendars
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Personal appointments and team holidays automatically block booking availability. Video bridges and WhatsApp reminder alerts sync in realtime.
                            </p>
                        </div>

                        {/* Stage 6: Next -> Flip & Scroll to CRM */}
                        <div className="narrative-step-6 absolute inset-0 flex flex-col space-y-2.5 sm:space-y-3.5 opacity-0 pointer-events-none transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-[11px] font-mono tracking-widest text-emerald-400 w-fit backdrop-blur-md">
                                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                                <span>STEP 06 READY FOR CRM</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-400 shrink-0 stroke-[2.5]" />
                                <span>Integration Complete</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                                Google Calendar is linked and verified. Continue scrolling down to enter the Core CRM & Operations Suite.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: 3D Parallax Integration Cockpit Card (Cursor Tilt + 3D Flip) */}
                <div className="lg:col-span-7 flex items-center justify-center perspective-[1400px] w-full">
                    {/* Outer Tilt Wrapper (tracks mouse cursor) */}
                    <div
                        ref={cardTiltRef}
                        className="w-full max-w-[340px] xs:max-w-[420px] sm:max-w-[520px] lg:max-w-[590px] min-h-[460px] sm:min-h-[480px] relative preserve-3d card-3d-wrap gsap-tilt"
                    >
                        {/* Inner Flip Wrapper (rotates 180° upon phase 5 completion) */}
                        <div
                            ref={cardFlipRef}
                            className="w-full h-full relative preserve-3d transition-transform duration-700"
                        >
                            {/* ================= FRONT FACE: Google Calendar Integration Cockpit ================= */}
                            <div className="w-full rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl relative backface-hidden flex flex-col gap-3">

                                {/* ================= LAYER 1: Not Connected Default Card (Matching Image 1) ================= */}
                                <div className="not-connected-layer absolute inset-0 z-30 rounded-2xl bg-card/98 backdrop-blur-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-500 border border-border">
                                    {/* Topbar: Google Calendar + Not Connected Badge */}
                                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                        <div className="flex items-center gap-2">
                                            <GoogleIcon className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">Google Calendar</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            <span>Not Connected</span>
                                        </span>
                                    </div>

                                    {/* Central Box: Connect Your Google Calendar with Rainbow Top Accent */}
                                    <div className="relative rounded-xl border border-border/80 bg-surface/80 p-4 sm:p-6 flex flex-col items-center text-center shadow-lg overflow-hidden my-auto">
                                        {/* Google Multicolor Top Border Accent */}
                                        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

                                        {/* Circular Google G Icon Badge */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-2.5 shadow-sm">
                                            <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>

                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight">
                                            Connect Your Google Calendar
                                        </h3>

                                        <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground max-w-sm leading-relaxed">
                                            Connect your calendar to automatically create events, prevent scheduling conflicts, and generate meeting links for appointments.
                                        </p>

                                        {/* Sign in with Google Button */}
                                        <div className="mt-3.5">
                                            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white text-gray-900 font-semibold text-xs sm:text-sm shadow-md hover:bg-gray-100 transition-all cursor-pointer">
                                                <GoogleIcon className="w-4 h-4" />
                                                <span>Sign in with Google</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: 2x2 Feature Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface/60 flex items-start gap-2">
                                            <div className="p-1 rounded-md bg-surface-elevated border border-border text-muted-foreground shrink-0 mt-0.5">
                                                <Radio className="w-3 h-3 text-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-foreground truncate">Real-time Sync</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug">Keep bookings and calendar events updated automatically.</p>
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface/60 flex items-start gap-2">
                                            <div className="p-1 rounded-md bg-surface-elevated border border-border text-muted-foreground shrink-0 mt-0.5">
                                                <Video className="w-3 h-3 text-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-foreground truncate">Automatic Meeting Links</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug">Add meeting links to online appointments automatically.</p>
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface/60 flex items-start gap-2">
                                            <div className="p-1 rounded-md bg-surface-elevated border border-border text-muted-foreground shrink-0 mt-0.5">
                                                <Layers className="w-3 h-3 text-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-foreground truncate">Flexible Calendars</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug">Choose which calendar receives your bookings.</p>
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface/60 flex items-start gap-2">
                                            <div className="p-1 rounded-md bg-surface-elevated border border-border text-muted-foreground shrink-0 mt-0.5">
                                                <ShieldCheck className="w-3 h-3 text-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-foreground truncate">Secure Integration</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug">Connect securely with protected access and permissions.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ================= LAYER 2: Choose an Account Modal (Matching Image 2) ================= */}
                                <div className="choose-account-layer absolute inset-0 z-25 rounded-2xl bg-card/98 backdrop-blur-2xl p-4 sm:p-6 flex flex-col justify-between opacity-0 pointer-events-none transition-all duration-500 border border-border">
                                    <div>
                                        {/* Google Header */}
                                        <div className="flex flex-col items-center text-center pb-3">
                                            <GoogleWordmark />
                                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-foreground mt-2 tracking-tight">
                                                Choose an account
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                to continue to <span className="font-semibold text-foreground">miniCRM</span>
                                            </p>
                                        </div>

                                        {/* Account List */}
                                        <div className="divide-y divide-border/60 border-t border-b border-border/60 mt-1">
                                            {/* Account 1: Parth Shah */}
                                            <div className="py-2 sm:py-2.5 px-2 flex items-center justify-between hover:bg-surface-elevated/60 rounded-md transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center shrink-0 border border-border">
                                                        PS
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            Parth Shah
                                                        </p>
                                                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                                                            parth.shah@example.com
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal shrink-0">
                                                    Signed out
                                                </span>
                                            </div>

                                            {/* Account 2: Heema Shah */}
                                            <div className="py-2 sm:py-2.5 px-2 flex items-center justify-between hover:bg-surface-elevated/60 rounded-md transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-semibold text-xs flex items-center justify-center shrink-0 border border-border">
                                                        HS
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            Heema Shah
                                                        </p>
                                                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                                                            heema.shah@example.com
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal shrink-0">
                                                    Signed out
                                                </span>
                                            </div>

                                            {/* Account 3: Rita Shah */}
                                            <div className="py-2 sm:py-2.5 px-2 flex items-center justify-between hover:bg-surface-elevated/60 rounded-md transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-rose-700 text-rose-100 font-semibold text-xs flex items-center justify-center shrink-0 border border-border">
                                                        RS
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            Rita Shah
                                                        </p>
                                                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                                                            rita.shah@example.com
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal shrink-0">
                                                    Signed out
                                                </span>
                                            </div>

                                            {/* Use another account */}
                                            <div className="py-2 sm:py-2.5 px-2 flex items-center gap-3 hover:bg-surface-elevated/60 rounded-md transition-colors cursor-pointer group">
                                                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                                    Use another account
                                                </span>
                                            </div>

                                            {/* Remove an account */}
                                            <div className="py-2 sm:py-2.5 px-2 flex items-center gap-3 hover:bg-surface-elevated/60 rounded-md transition-colors cursor-pointer group">
                                                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground">
                                                    <UserMinus className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                                    Remove an account
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer Notice */}
                                    <div className="pt-2 text-[10px] text-muted-foreground text-center border-t border-border/40">
                                        To continue, Google will share your name, email address, and calendar access with miniCRM.
                                    </div>
                                </div>

                                {/* ================= LAYER 3: Live Google Calendar Integration Cockpit ================= */}
                                <div className="integration-cockpit-layer opacity-0 pointer-events-none transition-all duration-500 flex flex-col gap-2.5 text-left">
                                    {/* 1. Header Bar: Google Calendar + Connected Badge + Sync/Disconnect */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-surface border border-border">
                                        <div className="flex items-center gap-2">
                                            <GoogleIcon className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">Google Calendar</span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>Connected</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <div className="relative">
                                                <div className="sync-pulse-indicator inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-surface-elevated border border-border text-foreground transition-all">
                                                    <RefreshCw className="w-3 h-3 text-muted-foreground sync-spin-icon" />
                                                    <span>Sync</span>
                                                </div>

                                                {/* Tooltip Indication when Sync Step Arrives */}
                                                <div className="sync-tooltip-pill absolute -bottom-9 right-0 z-50 whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-neutral-900 border border-white/80 text-[11px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] flex items-center gap-2 opacity-0 pointer-events-none transform translate-y-1 transition-all duration-300">
                                                    <span className="tracking-tight text-neutral-900 font-semibold">Syncing Calendar . . .</span>
                                                    {/* Tooltip pointer */}
                                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-white/80 rotate-45" />
                                                </div>
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
                                                    parth.shah@workspace.com
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

                                            <div className="flex items-center gap-1.5">
                                                <div className="relative">
                                                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        placeholder="Filter calendars..."
                                                        className="h-6 pl-6 pr-2 rounded-md bg-surface-elevated border border-border text-[10px] text-foreground w-28 sm:w-32 focus:outline-none"
                                                    />
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-elevated border border-border text-foreground">
                                                    5 Feeds
                                                </span>
                                            </div>
                                        </div>

                                        {/* Feed 1: Primary Work Calendar (Destination Feed) */}
                                        <div className="destination-feed-card p-2.5 sm:p-3 rounded-lg border border-border bg-surface-elevated flex flex-col gap-2 transition-all duration-500">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                        <span className="text-xs font-bold text-foreground truncate">
                                                            Primary Work Calendar
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface border border-border text-muted-foreground">
                                                            owner
                                                        </span>
                                                        <span className="destination-badge px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shadow-[0_0_10px_rgba(52,211,153,0.4)] transition-transform duration-300">
                                                            APPOINTMENTS ARE CREATED HERE
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                        Direct client scheduling & consultation pipeline
                                                    </p>
                                                    <div className="text-[9px] font-mono text-muted-foreground mt-1 flex items-center gap-1 truncate">
                                                        <CornerDownRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate">ID: parth.shah@workspace.com</span>
                                                        <Copy className="w-2.5 h-2.5 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground" />
                                                    </div>
                                                </div>

                                                <span className="px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    <span>Destination Feed</span>
                                                </span>
                                            </div>

                                            {/* Synced Capabilities Strip */}
                                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span className="text-emerald-400 flex items-center gap-1 sync-status-badge transition-transform">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    <span>Two-Way Conflict Elimination Active</span>
                                                </span>
                                                <span className="font-mono text-foreground">Sync: Instant</span>
                                            </div>
                                        </div>

                                        {/* Feed 2 */}
                                        <div className="p-2 sm:p-2.5 rounded-lg border border-border/60 bg-surface-elevated/40 flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                    <span className="text-xs font-semibold text-foreground/80 truncate">
                                                        Team Workshops & Bootcamps
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-surface border border-border text-muted-foreground">
                                                        writer
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                    Synchronizes availability with internal cohort sessions
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