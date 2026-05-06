import { useEffect } from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CTASection } from './CTASection';
import { initializeThemeFromLocalStorage } from '@/theme/themeSync.utils';

export const Home = () => {
    useEffect(() => {
        // Initialize theme from localStorage on page load
        initializeThemeFromLocalStorage();
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CTASection />

            {/* Add custom animation keyframes */}
            <style jsx global>{`
                @keyframes scroll {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(8px); opacity: 0; }
                }
                .animate-scroll {
                    animation: scroll 1.5s infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
};