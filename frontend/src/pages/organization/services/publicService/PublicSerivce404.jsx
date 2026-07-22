// src/components/PublicService404.jsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

const PublicService404 = () => {
    const navigate = useNavigate();
    const glitchControls = useAnimation();
    const entranceControls = useAnimation();

    useEffect(() => {
        // Entrance animation
        entranceControls.start({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        });

        let timeoutId;

        // Glitch animation loop
        const triggerGlitch = () => {
            const randomDelay = Math.random() * 4000 + 1500;

            timeoutId = setTimeout(() => {
                glitchControls.start({
                    x: [0, -5, 4, -3, 5, -4, 3, -2, 4, -3, 2, -1, 1, 0],
                    y: [0, 2, -3, 4, -2, 3, -1, -2, 1, 0],
                    skew: [0, 8, -6, 10, -8, 5, -3, 2, -1, 0],
                    scale: [1, 1.03, 0.97, 1.02, 0.98, 1.01, 0.99, 1],
                    rotate: [0, 0.5, -0.8, 1, -0.5, 0.3, -0.2, 0],
                    transition: { duration: 0.3, ease: "easeInOut" },
                });

                setTimeout(() => {
                    glitchControls.start({
                        textShadow: [
                            "0 0 0px transparent",
                            "3px 0 0px rgba(15, 23, 42, 0.7), -3px 0 0px rgba(100, 116, 139, 0.7)",
                            "-4px 0 0px rgba(15, 23, 42, 0.7), 4px 0 0px rgba(100, 116, 139, 0.7)",
                            "2px 0 0px rgba(15, 23, 42, 0.7), -2px 0 0px rgba(100, 116, 139, 0.7)",
                            "0 0 0px transparent",
                        ],
                        transition: { duration: 0.25 },
                    });
                }, 50);
                
                setTimeout(() => {
                    glitchControls.start({
                        x: [0, -2, 2, -1, 1, 0],
                        y: [0, 1, -1, 0],
                        transition: { duration: 0.1 },
                    });
                }, 150);

                triggerGlitch();
            }, randomDelay);
        };

        triggerGlitch();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [glitchControls, entranceControls]);

    return (
        <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col justify-between antialiased relative overflow-hidden">

            {/* Brand Header */}
            <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
                        <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                            mini<span className="text-slate-500">CRM</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={entranceControls}
                    className="text-center space-y-6 max-w-md w-full"
                >
                    {/* Animated Glitch 404 Header */}
                    <div className="relative inline-block">
                        <motion.h1
                            animate={glitchControls}
                            className="text-8xl sm:text-9xl font-black tracking-tighter select-none"
                            style={{
                                background: "linear-gradient(to right, #0F172A, #334155, #64748B)",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                willChange: "transform",
                                display: "inline-block",
                            }}
                        >
                            404
                        </motion.h1>

                        {/* Subtle Gradient Glow Line */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-48 bg-linear-to-r from-transparent via-slate-500/50 to-transparent rounded-full" />
                    </div>

                    {/* Heading & Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className="space-y-2.5"
                    >
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Page Not Found
                        </h2>

                        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-sm mx-auto">
                            The link you followed may be broken, expired, or the booking page has been removed by the host.
                        </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-3 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-slate-600/20 cursor-pointer"
                        >
                            <Home className="h-4 w-4" />
                            Visit miniCRM
                        </button>
                    </motion.div>

                    {/* Support Hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="pt-4"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <Compass className="h-3.5 w-3.5" />
                            <span>
                                Need assistance?{" "}
                                <button
                                    onClick={() => navigate("/support")}
                                    className="text-blue-600 font-medium underline hover:no-underline transition-all cursor-pointer"
                                >
                                    Contact Support
                                </button>
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white py-4 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-600">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicService404;