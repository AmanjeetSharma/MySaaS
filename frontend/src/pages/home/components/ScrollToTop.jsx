// components/ui/ScrollToTop.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScrollToTopOnRouteChange = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [pathname]);

    return null;
};

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);  
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="relative shadow-lg bg-gray-900 hover:bg-gray-800 text-white 
                                 border-2 border-amber-400/60 hover:border-white/50 transition-all duration-300
                                 overflow-hidden group cursor-pointer"
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            padding: 0,
                            minWidth: "44px",
                            flexShrink: 0
                        }}
                    >
                        {/* Shine Effect */}
                        <div
                            className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                                       transition-transform duration-700 ease-out 
                                       bg-gradient-to-r from-transparent via-white/40 to-transparent 
                                       -skew-x-12 pointer-events-none"
                        />
                        <ChevronUp className="h-5 w-5 relative z-10" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ScrollToTop = () => {
    return (
        <>
            <ScrollToTopOnRouteChange />
            <ScrollToTopButton />
        </>
    );
};

export default ScrollToTop;