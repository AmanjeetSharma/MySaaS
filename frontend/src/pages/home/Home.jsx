import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sparkles, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505] selection:bg-indigo-500/30 text-slate-200">

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">

          <div className="text-2xl font-bold tracking-tighter text-white z-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            miniCRM
          </div>

          {/* Desktop Navigation */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <a
              href="/signin"
              className="px-5 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-all rounded-full hover:bg-white/5"
            >
              Sign In
            </a>

            {/* CTA Button: Darker slate with a crisp border */}
            <Button className="rounded-full bg-slate-100 text-black hover:bg-white/90 px-5 py-4 h-9 text-xs font-bold hover:scale-103 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              {/* <Sparkles className="w-3.5 h-3.5 mr-2 fill-current" /> */}
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden z-20">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-zinc-900/50 backdrop-blur-md rounded-full border border-white/10 w-11 h-11 hover:bg-zinc-800">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/5 flex flex-col pt-24 w-75">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Mobile navigation menu</SheetDescription>
                </VisuallyHidden>

                <nav className="flex flex-col gap-6 items-center">
                  <SheetClose asChild>
                    <a href="/signin" className="text-xl font-medium text-white hover:text-white transition-colors">Sign In</a>
                  </SheetClose>

                  <div className="pt-6 w-full px-4">
                    <SheetClose asChild>
                      <Button
                        className="w-full rounded-2xl bg-white text-black py-7 text-lg font-bold hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-20 relative overflow-hidden">
        {/* Subtle Background Glow for "Excellent" Look */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/50 blur-[120px] pointer-events-none rounded-full" />

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 z-10">
          {/* Badge: Darker with Indigo accent */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-md text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-indigo-300 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Pre-Release Build(v0.1)
          </div>

          {/* Heading: Pure White to Slate gradient */}
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            The miniCRM for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-white to-slate-500">
              effortless growth.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
            A professional workspace designed to manage leads without the clutter of traditional enterprise software.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
            <Button size="lg"
              className="h-16 px-12 text-xl rounded-2xl bg-white text-black hover:bg-slate-200 cursor-pointer transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-white/5 bg-[#050505]">
        <p className="text-[10px] text-slate-500 tracking-[0.4em] uppercase font-bold">
          &copy; {new Date().getFullYear()} miniCRM. <span className="text-slate-700">Engineered for Speed.</span>
        </p>
      </footer>
    </div>
  );
};

export default Home;