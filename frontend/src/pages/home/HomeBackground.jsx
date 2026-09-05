import React from 'react';
import { Lottie } from 'lottie-react';
import gradientWaveAnimation from '@/assets/animations/audio_wave_bg.json';

export const HomeBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen overflow-hidden select-none">
            {/* Full-width Lottie container */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center ">
                <Lottie
                    src={gradientWaveAnimation}
                    loop
                    autoplay
                    rendererSettings={{
                        preserveAspectRatio: 'xMidYMid slice',
                    }}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Subtle backdrop blur over the wave to smooth edges without hiding it */}
            <div className="absolute inset-0 backdrop-blur-[10px]" />

            {/* Soft gradient fades at top/bottom only so header and footer blend smoothly */}
            <div className="absolute inset-0 bg-linear-to-b from-[#050505]/60 via-transparent to-[#050505]/80" />
        </div>
    );
};