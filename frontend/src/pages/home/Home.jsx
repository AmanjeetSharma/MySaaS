import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Kanban,
  Users,
  Video,
  Menu,
  Shield,
  ChevronRight,
  Bell,
  Link2
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { HomeBackground } from './HomeBackground';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const [activeCrmLayer, setActiveCrmLayer] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('14:00');

  const mainContainerRef = useRef(null);
  const heroHeadlineRef = useRef(null);
  const heroSubheadRef = useRef(null);
  const heroActionsRef = useRef(null);
  const heroSimulatorRef = useRef(null);
  const ambientMoonRef = useRef(null);

  const crmSectionRef = useRef(null);
  const crmDeckRef = useRef(null);
  const bookingSectionRef = useRef(null);
  const bookingStepsRef = useRef(null);
  const capabilitiesSectionRef = useRef(null);
  const capabilitiesCardsRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const ctaCardRef = useRef(null);
  const lenisRef = useRef(null);

  // Smooth scroll handler for anchor links
  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (!element) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(element, { offset: -70, duration: 1.15 });
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // GSAP & Smooth Scroll Lifecycle
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Lenis Smooth Scrolling
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', ScrollTrigger.update);

      const tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Setup GSAP Animations
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      // Hero Entry Animation (Staggered, mechanical precision)
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.85 } });

      heroTl
        .fromTo(
          heroHeadlineRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.9 }
        )
        .fromTo(
          heroSubheadRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.5'
        )
        .fromTo(
          heroActionsRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          heroSimulatorRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' },
          '-=0.3'
        );

      // Ambient Moonlit Light scroll reactivity
      if (ambientMoonRef.current) {
        gsap.to(ambientMoonRef.current, {
          yPercent: 40,
          opacity: 0.04,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: mainContainerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        });
      }

      // CRM Section 3D Interactive Stacking ScrollTrigger
      if (crmSectionRef.current && crmDeckRef.current) {
        const crmCards = crmDeckRef.current.querySelectorAll('.crm-stack-item');
        gsap.fromTo(
          crmCards,
          { opacity: 0, y: 35, rotateX: 6 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: crmSectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Appointment Booking Workflow Cards Sequential Reveal
      if (bookingSectionRef.current && bookingStepsRef.current) {
        const stepCards = bookingStepsRef.current.querySelectorAll('.booking-step-card');
        gsap.fromTo(
          stepCards,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bookingSectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Capabilities Cards Reveal
      if (capabilitiesSectionRef.current && capabilitiesCardsRef.current) {
        const capCards = capabilitiesCardsRef.current.children;
        gsap.fromTo(
          capCards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: capabilitiesSectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Final CTA Reveal
      if (ctaSectionRef.current && ctaCardRef.current) {
        gsap.fromTo(
          ctaCardRef.current,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, mainContainerRef);

    // Cleanup on unmount
    return () => {
      ctx.revert();
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // CRM Features Data for 3D interactive stack
  const crmFeatures = [
    {
      id: 'customer',
      title: 'Customer Directory & Profiles',
      subtitle: 'Complete identity, notes, and company metadata',
      badge: 'PROFILES & CONTACTS',
      detail: 'Add clients directly or ingest them automatically from booking links. Maintain verified contact details, custom notes, organization affiliations, and account health in one searchable cockpit.',
      preview: {
        name: 'Elena Vance',
        org: 'Apex Engineering Inc.',
        role: 'VP of Technology',
        email: 'elena@apex.dev',
        status: 'Active Client',
        bookingsCount: '4 Completed Sessions',
      }
    },
    {
      id: 'deals',
      title: 'Pipeline & Stage Management',
      subtitle: 'Visual Kanban tracking from lead to closed revenue',
      badge: 'DEALS & REVENUE',
      detail: 'Create customized deal stages (Discovery, Proposal, Review, Won). Assign monetary contract values, track conversion momentum, and move deals seamlessly as meetings conclude.',
      preview: {
        title: 'Full Architecture Advisory',
        value: '$12,500',
        stage: 'Proposal Sent',
        probability: '85%',
        expectedClose: 'Oct 15, 2026',
      }
    },
    {
      id: 'activities',
      title: 'Activities & Task Orchestration',
      subtitle: 'Structured calls, action items, and follow-ups',
      badge: 'ACTIVITY LOGGING',
      detail: 'Log meeting notes, assign next steps, and trigger reminder schedules. Ensure every scheduled appointment results in clear, accountable follow-up items for your team.',
      preview: {
        activity: 'Follow-up Architecture Scope Document',
        assignee: 'Team Lead',
        priority: 'High Priority',
        dueDate: 'Tomorrow, 17:00 GMT',
      }
    },
    {
      id: 'timeline',
      title: 'Chronological Customer Timeline',
      subtitle: 'Unbroken historical ledger of every touchpoint',
      badge: 'INTERACTION LEDGER',
      detail: 'Every public booking, rescheduled slot, email confirmation, deal stage transition, and internal note forms an immutable, chronological stream for full operational context.',
      preview: {
        lastEvent: 'Public booking completed via link',
        timestamp: '14:02 GMT',
        automatedAction: 'Google Meet link & confirmation dispatched',
      }
    }
  ];

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-white/20 selection:text-white relative overflow-x-hidden font-sans"
    >
      {/* Ambient moonlit atmospheric lighting */}
      <div
        ref={ambientMoonRef}
        className="fixed top-1/6 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1050px] h-[400px] sm:h-[600px] bg-white/[0.025] rounded-full blur-[140px] pointer-events-none z-0 transition-opacity"
      />

      {/* Atmospheric video background layer (fixed, z-0) */}
      <HomeBackground />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 md:px-12 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          <div
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground cursor-pointer select-none group"
            onClick={() => navigate("/")}
          >
            <span className="h-2 w-2 rounded-full moon-dot group-hover:scale-125 transition-transform"></span>
            <span>miniCRM</span>
          </div>

          {/* Desktop Navigation Links with Smooth Scroll */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a
              href="#crm"
              onClick={(e) => handleAnchorClick(e, '#crm')}
              className="hover:text-foreground transition-colors"
            >
              CRM Suite
            </a>
            <a
              href="#booking"
              onClick={(e) => handleAnchorClick(e, '#booking')}
              className="hover:text-foreground transition-colors"
            >
              Appointment Booking
            </a>
            <a
              href="#capabilities"
              onClick={(e) => handleAnchorClick(e, '#capabilities')}
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/signin"
              className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
            >
              Sign In
            </a>

            <Button
              className="rounded-lg bg-primary text-primary-foreground hover:opacity-90 px-4 h-8 text-xs font-semibold cursor-pointer transition-all active:translate-y-px shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden z-20">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground bg-surface-elevated/70 backdrop-blur-md rounded-lg border border-border w-9 h-9"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="bg-background/95 backdrop-blur-2xl border-border flex flex-col pt-20 w-72">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Mobile navigation links</SheetDescription>
                </VisuallyHidden>

                <nav className="flex flex-col gap-5 text-sm font-medium">
                  <SheetClose asChild>
                    <a
                      href="#crm"
                      onClick={(e) => handleAnchorClick(e, '#crm')}
                      className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    >
                      CRM Suite
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#booking"
                      onClick={(e) => handleAnchorClick(e, '#booking')}
                      className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    >
                      Appointment Booking
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#capabilities"
                      onClick={(e) => handleAnchorClick(e, '#capabilities')}
                      className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    >
                      Capabilities
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="/signin" className="text-muted-foreground hover:text-foreground py-2 transition-colors">
                      Sign In
                    </a>
                  </SheetClose>

                  <div className="pt-4">
                    <SheetClose asChild>
                      <Button
                        className="w-full rounded-lg bg-primary text-primary-foreground h-10 text-sm font-semibold"
                        onClick={() => navigate("/signup")}
                      >
                        Get Started
                      </Button>
                    </SheetClose>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {/* Main Content Flow */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">

        {/* 1. HERO SECTION */}
        <section className="w-full px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <h1
            ref={heroHeadlineRef}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-tighter leading-[1.05] max-w-5xl"
          >
            The appointment-driven CRM for high-velocity teams.
          </h1>

          <p
            ref={heroSubheadRef}
            className="mt-6 text-muted-foreground text-base sm:text-lg max-w-2xl font-normal leading-relaxed"
          >
            miniCRM pairs public client booking directly with full customer relationship management. Every booked session captures customer details, advances deals across stages, and syncs your calendar automatically—with zero glue code.
          </p>

          <div
            ref={heroActionsRef}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm cursor-pointer transition-all active:translate-y-px flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_28px_rgba(255,255,255,0.22)]"
              onClick={() => navigate("/signup")}
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <a
              href="#crm"
              onClick={(e) => handleAnchorClick(e, '#crm')}
              className="h-10 px-5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated font-medium text-sm flex items-center gap-2 transition-colors hover:border-white/30"
            >
              <span>Explore Platform</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>

          {/* Above-The-Fold Cockpit Simulator */}
          <div
            ref={heroSimulatorRef}
            className="mt-14 w-full max-w-5xl rounded-xl border border-border bg-card p-4 md:p-6 shadow-2xl text-left relative overflow-hidden perspective-container"
          >
            {/* Top Telemetry Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-border/60 gap-2 text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full moon-dot animate-pulse"></span>
                <span className="tracking-wide uppercase font-semibold text-foreground">
                  Unified Operating Engine
                </span>
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

            {/* Split Screen Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
              
              {/* Left Column: Public Booking View */}
              <div className="lg:col-span-5 flex flex-col gap-3.5 p-4 rounded-lg border border-border/80 bg-surface card-3d-wrap">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                    Public Booking Interface
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
                        className={`h-8 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'border-white/60 bg-white/10 text-foreground font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                            : 'border-border bg-surface-elevated text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {slot} GMT
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Client: Elena Vance (Apex Dev)</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    Slot Confirmed
                  </span>
                </div>
              </div>

              {/* Center Connective Indicator */}
              <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center text-center px-2">
                <div className="h-px w-full bg-border relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-surface-elevated border border-white/30 text-[10px] font-semibold text-foreground shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center gap-1">
                    <span>Auto-Sync</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 leading-tight">
                  Instant Customer Capture & Pipeline Staging
                </p>
              </div>

              {/* Right Column: CRM & Deals View */}
              <div className="lg:col-span-5 flex flex-col gap-3.5 p-4 rounded-lg border border-border/80 bg-surface card-3d-wrap">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Kanban className="h-3.5 w-3.5 text-zinc-300" />
                    CRM Pipeline Workspace
                  </span>
                  <span className="text-[10px] text-foreground font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                    Deal Stage Updated
                  </span>
                </div>

                {/* Simulated Deal Card */}
                <div className="p-3 rounded-md bg-surface-elevated border border-border/80 flex flex-col gap-2 hover:border-white/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Apex Engineering</span>
                    <span className="text-xs font-semibold text-foreground">$4,500</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Elena Vance • Technical Review</span>
                    <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-foreground">
                      Stage: Scheduled
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      Slot: Today, {selectedSlot} GMT
                    </span>
                    <span className="text-foreground font-medium">Calendar Synced</span>
                  </div>
                </div>

                {/* Telemetry Row */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-surface-elevated border border-border/60">
                    <span className="text-muted-foreground block">Customer Timeline</span>
                    <span className="text-foreground font-medium">Profile Ingested</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border/60">
                    <span className="text-muted-foreground block">Dispatch Status</span>
                    <span className="text-foreground font-medium">Reminders Armed</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* 2. CRM FUNCTIONALITIES SECTION (Customers, Deals, Activities, Timeline) */}
        <section
          id="crm"
          ref={crmSectionRef}
          className="w-full px-6 py-20 md:py-28 border-t border-border/40 bg-surface/40 relative"
        >
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Core CRM & Customer Relationship Suite
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Everything required to nurture leads and manage client relationships across their lifecycle—from initial contact capture to ongoing deal execution.
              </p>
            </div>

            {/* Interactive 3D Stack / Layer View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start perspective-container">
              
              {/* Left Selector List */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {crmFeatures.map((feat, index) => (
                  <div
                    key={feat.id}
                    onClick={() => setActiveCrmLayer(index)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer crm-stack-item ${
                      activeCrmLayer === index
                        ? 'border-white/30 bg-surface-elevated shadow-[0_4px_20px_rgba(0,0,0,0.5)] moon-glow-subtle'
                        : 'border-border/60 bg-card hover:border-border hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        {feat.badge}
                      </span>
                      {activeCrmLayer === index && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"></span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mt-1.5">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feat.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Right 3D Stacked Card Display */}
              <div
                ref={crmDeckRef}
                className="lg:col-span-7 p-6 rounded-xl border border-border bg-card shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest block">
                        ACTIVE MODULE // 0{activeCrmLayer + 1}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        {crmFeatures[activeCrmLayer].title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded border border-white/20 bg-surface-elevated text-[11px] font-medium text-foreground">
                      Operational
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    {crmFeatures[activeCrmLayer].detail}
                  </p>

                  {/* 3D Simulated Preview Card Inside Deck */}
                  <div className="mt-6 p-4 rounded-lg bg-surface border border-border/80 card-3d-wrap shadow-lg">
                    {activeCrmLayer === 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-foreground">{crmFeatures[0].preview.name}</span>
                            <span className="text-xs text-muted-foreground block">{crmFeatures[0].preview.org} • {crmFeatures[0].preview.role}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-[10px] text-emerald-400">
                            {crmFeatures[0].preview.status}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Email: {crmFeatures[0].preview.email}</span>
                          <span>{crmFeatures[0].preview.bookingsCount}</span>
                        </div>
                      </div>
                    )}

                    {activeCrmLayer === 1 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-foreground">{crmFeatures[1].preview.title}</span>
                            <span className="text-xs text-muted-foreground block">Expected Close: {crmFeatures[1].preview.expectedClose}</span>
                          </div>
                          <span className="text-sm font-bold text-foreground">{crmFeatures[1].preview.value}</span>
                        </div>
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Stage: <strong className="text-foreground">{crmFeatures[1].preview.stage}</strong></span>
                          <span>Confidence: {crmFeatures[1].preview.probability}</span>
                        </div>
                      </div>
                    )}

                    {activeCrmLayer === 2 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-foreground">{crmFeatures[2].preview.activity}</span>
                            <span className="text-xs text-muted-foreground block">Assigned to: {crmFeatures[2].preview.assignee}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-surface-elevated border border-white/20 text-[10px] text-foreground">
                            {crmFeatures[2].preview.priority}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                          Due Date: {crmFeatures[2].preview.dueDate}
                        </div>
                      </div>
                    )}

                    {activeCrmLayer === 3 && (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{crmFeatures[3].preview.lastEvent}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{crmFeatures[3].preview.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{crmFeatures[3].preview.automatedAction}</p>
                        <div className="pt-2 border-t border-border/40 flex items-center gap-2 text-[10px] text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                          <span>Audit Trail Synchronized</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground mt-4">
                  <span>Seamless multi-organization support</span>
                  <span>Click left tabs to inspect layers</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. APPOINTMENT BOOKING WORKFLOW SECTION */}
        <section
          id="booking"
          ref={bookingSectionRef}
          className="w-full px-6 py-20 md:py-28 border-t border-border/40 relative"
        >
          <div className="max-w-7xl mx-auto flex flex-col">
            
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                The End-to-End Appointment Booking Engine
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect your calendars, define availability boundaries, and let clients self-schedule directly into your pipeline with zero scheduling back-and-forth.
              </p>
            </div>

            {/* 4-Step Progressive Workflow Cards */}
            <div
              ref={bookingStepsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 perspective-container"
            >
              
              {/* Step 1: Connect Integrations */}
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors booking-step-card card-3d-wrap">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 01</span>
                    <Video className="h-4 w-4 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-3.5">
                    Connect Integrations
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Connect Google Calendar for real-time 2-way sync. Provision instant Google Meet, Zoom, or Microsoft Teams rooms automatically upon booking.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span>Google, Zoom & Teams Ready</span>
                </div>
              </div>

              {/* Step 2: Service & Availability */}
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors booking-step-card card-3d-wrap">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 02</span>
                    <Clock className="h-4 w-4 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-3.5">
                    Configure Service & Hours
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Create distinct services, set meeting durations (30m, 45m, 60m), configure buffer padding between calls, and assign weekly operating windows.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span>Buffer rules & timezone math</span>
                </div>
              </div>

              {/* Step 3: Public Booking Gateway */}
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors booking-step-card card-3d-wrap">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 03</span>
                    <Link2 className="h-4 w-4 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-3.5">
                    Share Public Booking Link
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Share your dedicated link (/book/:orgSlug/:serviceSlug). Clients select open slots in their local timezone and submit their details in seconds.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span>Friction-free client booking</span>
                </div>
              </div>

              {/* Step 4: Calendar Sync & Dispatch */}
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors booking-step-card card-3d-wrap">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 04</span>
                    <Bell className="h-4 w-4 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-3.5">
                    Calendar & Notifications
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    All bookings are cataloged in your calendar. Automated email invites and WhatsApp alerts dispatch while real-time in-app notifications update your team.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span>Calendar, email & socket alerts</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. ENGINEERED FOR SERVICE OPERATIONS (Capabilities) */}
        <section
          id="capabilities"
          ref={capabilitiesSectionRef}
          className="w-full px-6 py-20 md:py-28 border-t border-border/40 bg-surface/50 relative"
        >
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Engineered for Service Operations
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Five native architectural capabilities working in harmony. Built from the ground up without brittle third-party relays.
              </p>
            </div>

            <div
              ref={capabilitiesCardsRef}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Capability 1: Scheduling Engine */}
              <div className="md:col-span-7 p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors card-3d-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Clock className="h-4 w-4" />
                    <span>01 // Availability Architecture</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">
                    Granular Service Scheduling & Slot Buffers
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Set up distinct services with custom durations, buffer intervals before and after calls, daily booking limits, and localized timezone handling. Clients manage their own bookings with built-in reschedule and cancellation boundaries.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Buffer rules & padding</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Self-service cancellation</span>
                  </div>
                </div>
              </div>

              {/* Capability 2: CRM & Customer Timelines */}
              <div className="md:col-span-5 p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors card-3d-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Users className="h-4 w-4" />
                    <span>02 // Relationship History</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">
                    Customer Profiles & Timelines
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    View complete historical context for every client. Track booked appointments, meeting notes, status modifications, and communication history on a single continuous chronological timeline.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Centralized client interaction log</span>
                </div>
              </div>

              {/* Capability 3: Deals & Pipeline */}
              <div className="md:col-span-4 p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors card-3d-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Kanban className="h-4 w-4" />
                    <span>03 // Pipeline Tracking</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">
                    Visual Deal Boards
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Manage revenue opportunities across stages—from Discovery and Scheduled Review to Proposal and Closed Won. Monitor contract values and pipeline velocity at a glance.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Stage-based revenue management</span>
                </div>
              </div>

              {/* Capability 4: Integrations Matrix */}
              <div className="md:col-span-4 p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors card-3d-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Video className="h-4 w-4" />
                    <span>04 // Native Ecosystem</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">
                    Calendar, Video & Payments
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Two-way Google Calendar synchronization, meeting room links through Zoom, Microsoft Teams, or Google Meet, WhatsApp client alerts, and payment processing via Razorpay.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Connected operational tooling</span>
                </div>
              </div>

              {/* Capability 5: Team & Multi-Tenant Orgs */}
              <div className="md:col-span-4 p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-white/30 transition-colors card-3d-wrap">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Shield className="h-4 w-4" />
                    <span>05 // Team Tenancy</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">
                    Organizations & Realtime
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Multi-organization workspace support for agencies managing multiple client accounts. Role-based invitations, shared availability schedules, and live socket notifications.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Realtime socket event stream</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 5. FINAL CALL TO ACTION SECTION */}
        <section
          ref={ctaSectionRef}
          className="w-full px-6 py-20 md:py-28 border-t border-border/40 relative"
        >
          <div
            ref={ctaCardRef}
            className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-8 md:p-12 text-center flex flex-col items-center shadow-2xl hover:border-white/30 transition-colors moon-glow-subtle"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight max-w-xl">
              From first booked slot to closed deal in one place.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">
              Eliminate disconnected SaaS subscriptions. Run your public booking, customer timelines, and sales pipeline in a single surgical workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm cursor-pointer transition-all active:translate-y-px shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>

              <Button
                variant="outline"
                className="h-10 px-5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated font-medium text-sm transition-colors hover:border-white/30"
                onClick={() => navigate("/signin")}
              >
                Sign In to Workspace
              </Button>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 px-6 md:px-12 border-t border-border/40 bg-background/90 shrink-0 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full moon-dot"></span>
            <span className="font-semibold text-foreground">miniCRM</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/signin" className="hover:text-foreground transition-colors">Sign In</a>
            <a href="/signup" className="hover:text-foreground transition-colors">Sign Up</a>
            <a href="/support" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;