import React from "react";
import homeBg from "@/assets/animations/home-bg.webm";

export const HomeBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen overflow-hidden select-none">
            {/* Full-screen background video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
            >
                <source src={homeBg} type="video/webm" />
            </video>

            {/* Subtle blur to blend the animation */}
            <div className="absolute inset-0 backdrop-blur-[10px]" />

            {/* Dark gradient fades for header / hero / footer readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/80" />
        </div>
    );
};
