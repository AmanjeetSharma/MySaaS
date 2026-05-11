import React from 'react';
import { Calendar, RefreshCw, ShieldCheck, ChevronRight } from 'lucide-react';

const GoogleCalendar = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 font-sans">
            {/* max-w-md makes it feel more compact and premium */}
            <div className="w-full max-w-md">
                <div className="relative group">

                    {/* Multi-layered shadow "Outer Glow" */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-[var(--radius-3xl)] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                    <div className="relative bg-card text-card-foreground border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[var(--radius-3xl)] overflow-hidden">

                        <div className="p-8 md:p-10 flex flex-col items-center text-center">

                            {/* Floating Icon with Depth */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                                <div className="relative w-16 h-16 bg-white dark:bg-zinc-900 border border-border shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] rounded-[var(--radius-xl)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                                    {/* Google Calendar Blue Icon Style */}
                                    <Calendar size={32} className="text-[#4285F4]" strokeWidth={2} />
                                </div>
                            </div>

                            <h1 className="text-2xl font-heading font-bold tracking-tight mb-2">
                                Google Calendar
                            </h1>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-[240px]">
                                Sync your schedule with real-time data mirroring.
                            </p>

                            {/* High-Depth Multi-color Google Button */}
                            <button className="group/btn relative w-full p-[1px] rounded-(--radius-lg) transition-all active:scale-[0.97] hover:shadow-[0_0_20px_rgba(66,133,244,0.15)]">
                                {/* The "Google Color" Border Gradient */}
                                <div className="absolute inset-0 bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-[var(--radius-lg)]"></div>

                                {/* Inner Button Content */}
                                <div className="relative bg-white dark:bg-zinc-950 py-3 px-6 rounded-[calc(var(--radius-lg)-1px)] flex items-center justify-center gap-3 transition-colors group-hover/btn:bg-opacity-95">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm font-bold text-black">Sign in with Google</span>
                                    <ChevronRight size={16} className="text-black group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleCalendar;