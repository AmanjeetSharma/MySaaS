import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket } from 'lucide-react';

export const CTASection = () => {
    return (
        <section className="relative py-24 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10" />
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
                <div className="absolute bottom-0 right-1/2 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative z-10 max-w-4xl mx-auto text-center"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                    <Rocket className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Limited Time Offer</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Ready to Never Miss a Follow-up Again?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Join thousands of businesses already using our platform to convert more leads and grow their revenue.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="group bg-white text-black hover:bg-gray-100">
                        Start Your Free Trial
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Contact Sales
                    </Button>
                </div>

                <p className="text-sm text-gray-400 mt-6">
                    No credit card required • Free 14-day trial • Cancel anytime
                </p>
            </motion.div>
        </section>
    );
};