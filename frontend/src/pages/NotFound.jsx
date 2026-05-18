// pages/NotFound.jsx
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft, Compass } from "lucide-react";
import { useEffect } from "react";

const NotFound = () => {
    const navigate = useNavigate();
    const controls = useAnimation();
    const entranceControls = useAnimation();

    useEffect(() => {
        // Entrance animation
        entranceControls.start({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        });

        let timeoutId;

        const triggerGlitch = () => {
            const randomDelay = Math.random() * 4000 + 1500;

            timeoutId = setTimeout(() => {
                controls.start({
                    x: [0, -5, 4, -3, 5, -4, 3, -2, 4, -3, 2, -1, 1, 0],
                    y: [0, 2, -3, 4, -2, 3, -1, -2, 1, 0],
                    skew: [0, 8, -6, 10, -8, 5, -3, 2, -1, 0],
                    scale: [1, 1.03, 0.97, 1.02, 0.98, 1.01, 0.99, 1],
                    rotate: [0, 0.5, -0.8, 1, -0.5, 0.3, -0.2, 0],
                    transition: { duration: 0.3, ease: "easeInOut" }
                });

                setTimeout(() => {
                    controls.start({
                        textShadow: [
                            "0 0 0px transparent",
                            "3px 0 0px color-mix(in srgb, var(--color-primary) 70%, transparent), -3px 0 0px color-mix(in srgb, var(--color-chart-2) 70%, transparent)",
                            "-4px 0 0px color-mix(in srgb, var(--color-primary) 70%, transparent), 4px 0 0px color-mix(in srgb, var(--color-chart-2) 70%, transparent)",
                            "2px 0 0px color-mix(in srgb, var(--color-primary) 70%, transparent), -2px 0 0px color-mix(in srgb, var(--color-chart-2) 70%, transparent)",
                            "0 0 0px transparent"
                        ],
                        transition: { duration: 0.25 }
                    });
                }, 50);

                setTimeout(() => {
                    controls.start({
                        x: [0, -2, 2, -1, 1, 0],
                        y: [0, 1, -1, 0],
                        transition: { duration: 0.1 }
                    });
                }, 150);

                triggerGlitch();
            }, randomDelay);
        };

        triggerGlitch();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [controls, entranceControls]);

    return (
        <div className="flex-1 overflow-auto">
            <div
                className="min-h-full flex items-center justify-center p-4 pt-8 md:pt-12 relative overflow-hidden"
                style={{
                    background: "linear-gradient(to bottom, var(--color-background), color-mix(in srgb, var(--color-background) 85%, var(--color-secondary) 15%))",
                    color: "var(--color-foreground)",
                    fontFamily: "var(--font-sans)"
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={entranceControls}
                    className="text-center space-y-6 max-w-md w-full relative z-10"
                >
                    {/* 404 */}
                    <div className="relative">
                        <motion.h1
                            animate={controls}
                            className="text-8xl md:text-9xl font-bold tracking-tighter"
                            style={{
                                background: `linear-gradient(
                                    to right,
                                    var(--color-primary),
                                    color-mix(in srgb, var(--color-primary) 80%, white),
                                    color-mix(in srgb, var(--color-primary) 60%, transparent)
                                )`,
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                willChange: "transform",
                                display: "inline-block",
                                fontFamily: "var(--font-heading)"
                            }}
                        >
                            404
                        </motion.h1>

                        <div
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-0.5 w-60"
                            style={{
                                background: `linear-gradient(
                                    to right,
                                    transparent,
                                    color-mix(in srgb, var(--color-primary) 70%, transparent),
                                    transparent
                                )`
                            }}
                        />
                    </div>

                    {/* Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.2,
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="space-y-3"
                    >
                        <h2
                            className="text-2xl md:text-3xl font-semibold tracking-tight"
                            style={{ color: "var(--color-foreground)" }}
                        >
                            Oops! Looks like you're lost.
                        </h2>

                        <p
                            className="text-sm md:text-base leading-relaxed"
                            style={{
                                color: "color-mix(in srgb, var(--color-muted-foreground) 90%, transparent)"
                            }}
                        >
                            The page you're looking for doesn't exist or has been
                            moved to a different URL.
                        </p>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.35,
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
                    >
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            size="lg"
                            className="gap-2 active:scale-95 transition-all duration-200 cursor-pointer"
                            style={{
                                borderColor: "var(--color-border)",
                                background: "var(--color-card)",
                                color: "var(--color-foreground)",
                                borderRadius: "var(--radius-lg)"
                            }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>

                        <Button
                            onClick={() => navigate("/dashboard")}
                            size="lg"
                            className="gap-2 active:scale-95 transition-all duration-200 cursor-pointer"
                            style={{
                                background: "var(--color-primary)",
                                color: "var(--color-primary-foreground)",
                                borderRadius: "var(--radius-lg)"
                            }}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Go To Dashboard
                        </Button>
                    </motion.div>

                    {/* Helpful hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            delay: 0.5,
                            duration: 0.5
                        }}
                        className="pt-4"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs">
                            <Compass className="h-3 w-3" style={{ color: "var(--color-muted-foreground)" }} />
                            <span style={{ color: "var(--color-muted-foreground)" }}>
                                Need help? Or want to report this issue? Contact{" "}
                                <button
                                    onClick={() => navigate("/support")}
                                    className="underline hover:no-underline transition-all cursor-pointer"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    Support
                                </button>
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;