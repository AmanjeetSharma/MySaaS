import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, ArrowUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { HomeBackground } from './HomeBackground';
import { HeroIntro } from './components/HeroIntro';
import { UnifiedOperatingEngine } from './components/UnifiedOperatingEngine';
import { ScrollStoryShowcase } from './components/ScrollStoryShowcase';
import { CrmCapabilitiesDeck } from './components/CrmCapabilitiesDeck';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const crmFeatures = [
  {
    id: 'customer',
    title: 'Customer Directory & Profiles',
    subtitle: 'Verified identity, custom notes, and company history',
    badge: 'PROFILES & CONTACTS',
    detail: 'Add clients directly or ingest them automatically from booking links. Maintain verified contact details, custom notes, and account interaction records in one unified place.',
    preview: { name: 'Elena Vance', org: 'Apex Engineering Inc.', status: 'Active Client' }
  },
  {
    id: 'deals',
    title: 'Pipeline & Stage Management',
    subtitle: 'Visual Kanban tracking from first meeting to closed revenue',
    badge: 'DEALS & REVENUE',
    detail: 'Create customized deal stages. Assign monetary contract values and advance deals across your pipeline as meetings conclude.',
    preview: { title: 'Full Architecture Advisory', value: '$12,500', stage: 'Proposal Sent' }
  },
  {
    id: 'activities',
    title: 'Activities & Task Orchestration',
    subtitle: 'Structured action items, calls, and follow-ups',
    badge: 'ACTIVITY ORCHESTRATION',
    detail: 'Log meeting notes, assign next steps, and trigger reminder schedules directly tied to booking slots.',
    preview: { activity: 'Architecture Scope Document', priority: 'High', dueDate: 'Tomorrow' }
  },
  {
    id: 'timeline',
    title: 'Chronological Customer Timeline',
    subtitle: 'Unbroken historical ledger of every client touchpoint',
    badge: 'INTERACTION LEDGER',
    detail: 'Every booking, email confirmation, deal transition, and internal note forms an immutable, chronological stream.',
    preview: { lastEvent: 'Public booking completed', timestamp: '14:02 GMT' }
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [activeCrmLayer, setActiveCrmLayer] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('14:00');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lenisRef = useRef(null);

  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (!element) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(element, { offset: -70, duration: 1.1 });
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // Refresh ScrollTrigger to calculate accurate pin spacers and trigger start/end offsets
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      if (lenisRef.current) lenisRef.current.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-primary/20 relative overflow-x-clip">

      {/* Single Fixed Background */}
      <HomeBackground />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 md:px-12 py-3 sm:py-3.5 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <span className="h-2 w-2 rounded-full moon-dot text-primary" />
            <span>miniCRM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a href="#engine" onClick={(e) => handleAnchorClick(e, '#engine')} className="hover:text-foreground transition-colors">
              Engine
            </a>
            <a href="#crm" onClick={(e) => handleAnchorClick(e, '#crm')} className="hover:text-foreground transition-colors">
              CRM Suite
            </a>
            <a href="#capabilities" onClick={(e) => handleAnchorClick(e, '#capabilities')} className="hover:text-foreground transition-colors">
              Capabilities
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              Sign In
            </Link>
            <Button
              className="rounded-lg bg-primary text-primary-foreground px-4 h-8 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="w-9 h-9 border border-border"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur-2xl border-l border-border w-72">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Main application navigation links</SheetDescription>
                </VisuallyHidden>
                <nav className="flex flex-col gap-4 text-sm mt-10">
                  <SheetClose asChild>
                    <a
                      href="#engine"
                      onClick={(e) => handleAnchorClick(e, '#engine')}
                      className="text-foreground hover:text-primary transition-colors py-1"
                    >
                      Engine
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#crm"
                      onClick={(e) => handleAnchorClick(e, '#crm')}
                      className="text-foreground hover:text-primary transition-colors py-1"
                    >
                      CRM Suite
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#capabilities"
                      onClick={(e) => handleAnchorClick(e, '#capabilities')}
                      className="text-foreground hover:text-primary transition-colors py-1"
                    >
                      Capabilities
                    </a>
                  </SheetClose>
                  <div className="pt-4 border-t border-border flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link
                        to="/signin"
                        className="text-center py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg"
                      >
                        Sign In
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        className="w-full h-9 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer"
                        onClick={() => navigate("/signup")}
                      >
                        Start Free Trial
                      </Button>
                    </SheetClose>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Experience Flow */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* 1. Full Viewport App Introduction (Headline, value prop, CTAs, metrology indicators) */}
        <HeroIntro
          onExploreClick={(e) => handleAnchorClick(e, '#crm')}
          onSimulatorClick={(e) => handleAnchorClick(e, '#engine')}
        />

        {/* 2. Unified Operating Engine (Cockpit Simulator - 2nd Section) */}
        <UnifiedOperatingEngine
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
        />

        {/* 3. Google Calendar Integration with 3D Flip to Arrow & Smooth Exit */}
        <ScrollStoryShowcase />

        {/* 4. Core CRM & Operations Suite (3D Stacking Deck) & Capabilities */}
        <CrmCapabilitiesDeck
          activeLayer={activeCrmLayer}
          setActiveLayer={setActiveCrmLayer}
          features={crmFeatures}
        />

        {/* CTA Section */}
        <section className="w-full px-4 sm:px-6 py-14 sm:py-20 md:py-24 border-t border-border">
          <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-6 sm:p-10 md:p-12 text-center flex flex-col items-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight max-w-xl">
              From first booked slot to closed revenue.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
              Run client scheduling, interaction timelines, and your sales pipeline in a single surgical workspace built for boutique teams.
            </p>
            <Button
              className="mt-6 h-9 sm:h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 shadow-sm cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
            </Button>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-8 px-4 sm:px-6 md:px-12 border-t border-border bg-background/95 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full moon-dot text-primary" />
            <span className="font-medium text-foreground">&copy; miniCRM 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Back to top
            </button>
            <span className="text-border">•</span>
            <Link to="/signin" className="hover:text-foreground transition-colors">Sign In</Link>
            <span className="text-border">•</span>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-surface-elevated/90 hover:bg-surface-elevated text-foreground border border-border/80 hover:border-primary/50 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}

    </div>
  );
};

export default Home;