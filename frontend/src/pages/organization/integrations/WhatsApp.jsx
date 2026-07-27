import React from 'react';
import { MessageCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const WhatsApp = () => {
  const handleConnect = () => {
    toast.info('WhatsApp Business is coming soon!', {
      description: 'Stay tuned!',
      duration: 4000,
      position: 'top-center',
      icon: '💬',
    });
  };

  return (
    /* Deducts the 4rem navbar height from 100vh for accurate vertical centering */
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-background p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          {/* Decorative glow behind the card */}
          <div className="absolute -inset-1 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-2xl sm:rounded-3xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>

          <div className="relative bg-card text-card-foreground border border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                {/* Responsive Icon Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-500/10 text-green-500 rounded-xl sm:rounded-(--radius-2xl) flex items-center justify-center mb-4 sm:mb-6 ring-1 ring-green-500/20">
                  <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>

                {/* Responsive Typography */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight mb-2 sm:mb-3">
                  WhatsApp Business
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-md">
                  Seamlessly manage customer conversations and automated alerts from your central command center.
                </p>

                {/* Responsive Button Wrapper */}
                <div className="group/btn w-full sm:w-auto">
                  <button
                    onClick={handleConnect}
                    className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-(--radius-xl) shadow-xl shadow-green-500/20 transition-all group-hover/btn:-translate-y-1 active:scale-95 flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    Connect Account
                  </button>
                </div>

                {/* Responsive Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-2.5 sm:gap-y-3 mt-8 sm:mt-10 w-full sm:w-auto text-left">
                  {['Instant Sync', '256-bit Encryption', 'Auto-Replies', 'API Access'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground/80">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;