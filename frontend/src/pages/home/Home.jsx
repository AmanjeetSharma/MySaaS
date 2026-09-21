import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { HomeBackground } from './HomeBackground';
import { HeroCockpit } from './components/HeroCockpit';
import { ScrollStoryShowcase } from './components/ScrollStoryShowcase';
import { CrmCapabilitiesDeck } from './components/CrmCapabilitiesDeck';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const crmFeatures = [
  {
    id: 'customer',
    title: 'Customer Directory & Profiles',
    subtitle: 'Complete identity, notes, and company metadata',
    badge: 'PROFILES & CONTACTS',
    detail: 'Add clients directly or ingest them automatically from booking links. Maintain verified contact details, custom notes, and account health.',
    preview: { name: 'Elena Vance', org: 'Apex Engineering Inc.', status: 'Active Client' }
  },
  {
    id: 'deals',
    title: 'Pipeline & Stage Management',
    subtitle: 'Visual Kanban tracking from lead to closed revenue',
    badge: 'DEALS & REVENUE',
    detail: 'Create customized deal stages. Assign monetary contract values and move deals seamlessly as meetings conclude.',
    preview: { title: 'Full Architecture Advisory', value: '$12,500', stage: 'Proposal Sent' }
  },
  {
    id: 'activities',
    title: 'Activities & Task Orchestration',
    subtitle: 'Structured calls, action items, and follow-ups',
    badge: 'ACTIVITY LOGGING',
    detail: 'Log meeting notes, assign next steps, and trigger reminder schedules directly tied to booking slots.',
    preview: { activity: 'Architecture Scope Document', priority: 'High', dueDate: 'Tomorrow' }
  },
  {
    id: 'timeline',
    title: 'Chronological Customer Timeline',
    subtitle: 'Unbroken historical ledger of every touchpoint',
    badge: 'INTERACTION LEDGER',
    detail: 'Every booking, email confirmation, deal transition, and internal note forms an immutable stream.',
    preview: { lastEvent: 'Public booking completed', timestamp: '14:02 GMT' }
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [activeCrmLayer, setActiveCrmLayer] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('14:00');
  const lenisRef = useRef(null);
  const ambientMoonRef = useRef(null);

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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (ambientMoonRef.current) {
      gsap.to(ambientMoonRef.current, {
        yPercent: 30,
        opacity: 0.05,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      });
    }

    return () => {
      if (lenisRef.current) lenisRef.current.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-white/20 relative overflow-x-hidden">

      {/* Background Ambience and Video */}
      <div ref={ambientMoonRef} className="fixed top-1/6 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />
      <HomeBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 md:px-12 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
            <span className="h-2 w-2 rounded-full moon-dot" />
            <span>miniCRM</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a href="#crm" onClick={(e) => handleAnchorClick(e, '#crm')} className="hover:text-foreground transition-colors">CRM Suite</a>
            <a href="#capabilities" onClick={(e) => handleAnchorClick(e, '#capabilities')} className="hover:text-foreground transition-colors">Capabilities</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/signin" className="px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">Sign In</a>
            <Button className="rounded-lg bg-primary text-primary-foreground px-4 h-8 text-xs font-semibold" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 border border-border"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur-2xl">
                <VisuallyHidden><SheetTitle>Menu</SheetTitle><SheetDescription>Navigation</SheetDescription></VisuallyHidden>
                <nav className="flex flex-col gap-4 text-sm mt-12">
                  <SheetClose asChild><a href="#crm" onClick={(e) => handleAnchorClick(e, '#crm')}>CRM Suite</a></SheetClose>
                  <SheetClose asChild><a href="#capabilities" onClick={(e) => handleAnchorClick(e, '#capabilities')}>Capabilities</a></SheetClose>
                  <Button className="w-full mt-4" onClick={() => navigate("/signup")}>Start Free Trial</Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Experience Flow */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* 1. Cockpit Hero */}
        <HeroCockpit
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          onExploreClick={(e) => handleAnchorClick(e, '#crm')}
        />

        {/* 2. GSAP Cinematic Scroll Story & Morphing Product */}
        <ScrollStoryShowcase />

        {/* 3. 3D CRM Deck & Operational Capabilities */}
        <CrmCapabilitiesDeck
          activeLayer={activeCrmLayer}
          setActiveLayer={setActiveCrmLayer}
          features={crmFeatures}
        />

        {/* CTA */}
        <section className="w-full px-6 py-20 border-t border-border/40">
          <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-8 md:p-12 text-center flex flex-col items-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">From first booked slot to closed deal.</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg">Run client booking, live interaction timelines, and your sales pipeline in a single surgical workspace.</p>
            <Button className="mt-6 h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 md:px-12 border-t border-border/40 bg-background/90 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} miniCRM. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/signin" className="hover:text-foreground">Sign In</a>
            <a href="/signup" className="hover:text-foreground">Sign Up</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;