// src/components/publicService/VerifyPaymentPage.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import VerifyPaymentLoader from "@/components/publicService/loader/VerifyPaymentLoader";

const VERIFICATION_STEPS = [
    "Payment received successfully...",
    "Verifying payment confirmation...",
    "Locking in your appointment...",
    "Generating your booking details..."
];

const VerifyPaymentPage = ({ isSuccess = false }) => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (isSuccess) return;
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % VERIFICATION_STEPS.length);
        }, 1800);
        return () => clearInterval(interval);
    }, [isSuccess]);

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 antialiased selection:bg-primary selection:text-primary-foreground">
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[440px] rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-7 sm:p-9 shadow-xs transition-all text-card-foreground"
            >
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Centered velocity loader */}
                            <div className="mx-auto flex w-full items-center justify-center py-3">
                                <VerifyPaymentLoader />
                            </div>

                            {/* Headings & status text animation */}
                            <div className="mt-4 text-center">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Verifying Payment
                                </h1>

                                <div className="mt-2 h-6 flex items-center justify-center overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={stepIndex}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="text-xs sm:text-sm font-medium text-muted-foreground"
                                        >
                                            {VERIFICATION_STEPS[stepIndex]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Indeterminate progress line */}
                            <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-muted border border-border/60">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-primary/30 via-primary to-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.4)]"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.6,
                                        ease: "easeInOut"
                                    }}
                                    style={{ width: "55%" }}
                                />
                            </div>

                            {/* Caution notice */}
                            <div className="mt-7 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-3.5 text-left">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                                <p className="text-xs font-medium leading-relaxed text-foreground/80">
                                    Please do not refresh or close this page while we confirm your appointment.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center py-2"
                        >
                            {/* Animated check icon badge */}
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success ring-8 ring-success/10 border border-success/30 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                >
                                    <CheckCircle2 className="h-10 w-10 text-success" />
                                </motion.div>
                            </div>

                            {/* Success message */}
                            <div className="mt-6 space-y-1.5">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Payment Verified!
                                </h1>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Almost done...
                                </p>
                            </div>

                            {/* Completed progress line */}
                            <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-success/20 border border-success/30">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                    className="h-full rounded-full bg-success shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default VerifyPaymentPage;