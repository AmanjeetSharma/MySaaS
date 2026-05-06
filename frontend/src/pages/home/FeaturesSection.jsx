import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
    Users,
    Notebook,
    Bell,
    LayoutDashboard,
    MessageCircle,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
    {
        icon: Users,
        title: "Customer Management",
        description: "Store and organize all your clients in one place with essential details, tags, and interaction history.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Notebook,
        title: "Notes & Timeline",
        description: "Maintain a complete interaction history for every customer—what was discussed and their current status.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Bell,
        title: "Follow-up Reminders",
        description: "Never miss a follow-up with intelligent reminders for calls, messages, or meetings.",
        color: "from-orange-500 to-red-500"
    },
    {
        icon: LayoutDashboard,
        title: "Smart Dashboard",
        description: "Clean, focused interface highlighting today's follow-ups and missed actions.",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: MessageCircle,
        title: "WhatsApp Integration",
        description: "Send pre-written follow-up messages instantly with one-click WhatsApp integration.",
        color: "from-teal-500 to-green-500"
    },
    {
        icon: Calendar,
        title: "Calendar Support",
        description: "Schedule meetings and sync with Google Calendar. (Pro Feature)",
        color: "from-indigo-500 to-purple-500"
    }
];

const FeatureCard = ({ icon: Icon, title, description, color, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -10 }}
            className="group"
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600 transition-all duration-300 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} p-2.5 mb-4`}>
                        <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 leading-relaxed">{description}</p>
                </div>
            </Card>
        </motion.div>
    );
};

export const FeaturesSection = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

    return (
        <section ref={targetRef} className="relative py-24 px-4 bg-black overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px]" />
            </div>

            <motion.div
                className="relative z-10 max-w-7xl mx-auto"
                style={{ opacity, y }}
            >
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4"
                    >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-white/80">Powerful Features</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Everything You Need to
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {" "}Stay On Top
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-400 max-w-3xl mx-auto"
                    >
                        Focus on what matters most—building relationships and closing deals.
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} index={index} />
                    ))}
                </div>

                {/* Pro Feature Highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <span className="text-white">Pro features available</span>
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};