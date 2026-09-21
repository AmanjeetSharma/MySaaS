import { useState, useEffect } from 'react';
import homeBg from "@/assets/animations/home-bg1.webm";

export const HomeBackground = () => {
    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen overflow-hidden select-none">
            {/* Full-screen background video with GPU compositing and metadata preload */}
            {!reducedMotion ? (
                <video
                    className="absolute inset-0 w-full h-full object-cover filter blur-[5px] scale-100 opacity-90 transform-gpu"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                >
                    <source src={homeBg} type="video/webm" />
                </video>
            ) : (
                <div className="absolute inset-0 bg-radial-[circle_at_50%_20%] from-primary/5 via-background to-background" />
            )}

            {/* Subtle atmospheric vignette that keeps video prominent while protecting text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/25 to-background/70" />
        </div>
    );
};
