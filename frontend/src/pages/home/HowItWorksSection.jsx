import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
    UserPlus,
    Users,
    BellRing,
    MessageSquare,
    ArrowRight
} from 'lucide-react';

const steps = [
    {
        number: "01",
        title: "Sign Up & Setup",
        description: "Create your account in seconds and set up your workspace.",
        icon: UserPlus,
        color: "from-blue-500 to-cyan-500"
    },
    {
        number: "02",
        title: "Add Customers",
        description: "Import your clients and organize them with tags and notes.",
        icon: Users,
        color: "from-purple-500 to-pink-500"
    },
    {
        number: "03",
        title: "Set Reminders",
        description: "Create follow-up reminders for calls, messages, or meetings.",
        icon: BellRing,
        color: "from-orange-500 to-red-500"
    },
    {
        number: "04",
        title: "Take Action",
        description: "Send WhatsApp messages instantly and track your progress.",
        icon: MessageSquare,
        color: "from-green-500 to-emerald-500"
    }
];

export const HowItWorksSection = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const x = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <section ref={targetRef} className="relative py-24 px-4 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            <motion.div className="absolute inset-0 opacity-20" style={{ x }}>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4"
                    >
                        <span className="text-sm font-medium text-white/80">Simple Process</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        How It Works
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-400 max-w-2xl mx-auto"
                    >
                        Get started in minutes and start closing more deals
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-20 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent">
                                    <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/30 w-5 h-5" />
                                </div>
                            )}
                            <div className="text-center">
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-4 relative group`}>
                                    <step.icon className="w-full h-full text-white" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 border border-white/20 flex items-center justify-center text-sm font-bold text-white">
                                        {step.number}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-400">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};