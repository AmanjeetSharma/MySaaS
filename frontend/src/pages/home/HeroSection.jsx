import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

const backgroundImage = '../../assets/hero-bg.png';

export const HeroSection = () => {
    const targetRef = useRef(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/dashboard");
        } else {
            navigate("/register");
        }
    };

    const handleWatchDemo = () => {
        // Add demo video modal or scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div ref={targetRef} className="relative h-screen overflow-hidden">
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ scale, y }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundPosition: 'center',
                    }}
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
            </motion.div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-1 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full px-4"
                style={{ opacity }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-6xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-white/90">Never Miss a Follow-up Again</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
                    >
                        Transform Your
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {" "}Customer Conversations
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8"
                    >
                        The lightweight follow-up management system that helps small businesses
                        track leads, automate reminders, and close more deals—without the CRM complexity.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Button 
                            size="lg" 
                            className="group bg-white text-black hover:bg-gray-100"
                            onClick={handleGetStarted}
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={handleWatchDemo}
                        >
                            Watch Demo
                            <Zap className="ml-2 w-4 h-4" />
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-white/10"
                    >
                        {[
                            { label: "Follow-ups Saved", value: "50K+" },
                            { label: "Businesses Using", value: "2K+" },
                            { label: "Conversion Rate", value: "45%" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-scroll" />
                </div>
            </motion.div>
        </div>
    );
};