// src/components/publicService/VerifyPaymentPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import PageBackground from "@/components/publicService/loader/PageBackground";
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
        }, 1000);
        return () => clearInterval(interval);
    }, [isSuccess]);

    return (
        <PageBackground>
            <div className="flex w-full items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-[430px] rounded-[28px] border border-white/90 bg-white/80 p-8 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.06),0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all sm:p-9"
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
                                {/* Centered speed loader */}
                                <div className="mx-auto flex w-full items-center justify-center py-2">
                                    <VerifyPaymentLoader />
                                </div>

                                {/* Headings & status text animation */}
                                <div className="mt-4 text-center">
                                    <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                        Verifying Payment
                                    </h1>

                                    <div className="mt-1.5 h-6 flex items-center justify-center overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={stepIndex}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="text-xs sm:text-sm font-normal text-slate-500"
                                            >
                                                {VERIFICATION_STEPS[stepIndex]}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Indeterminate progress line */}
                                <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-slate-200 via-slate-700 to-slate-900"
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
                                <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-50/40 p-3.5 text-left">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <p className="text-xs font-normal leading-relaxed text-amber-950/80">
                                        Please do not refresh or close this page while we confirm your booking.
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
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 shadow-inner">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                    >
                                        <CheckCircle2 className="h-10 w-10" />
                                    </motion.div>
                                </div>

                                {/* Success message */}
                                <div className="mt-6 space-y-1.5">
                                    <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                        Payment Verified!
                                    </h1>
                                    <p className="text-xs sm:text-sm font-normal text-slate-500">
                                        Generating your booking confirmation...
                                    </p>
                                </div>

                                {/* Completed progress line */}
                                <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-emerald-100">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.2, ease: "easeInOut" }}
                                        className="h-full rounded-full bg-emerald-600"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </PageBackground>
    );
};

export default VerifyPaymentPage;