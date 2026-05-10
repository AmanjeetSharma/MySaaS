import React from 'react';
import { MessageCircle, ExternalLink, CheckCircle2 } from 'lucide-react';

const WhatsApp = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          {/* Decorative glow behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-[var(--radius-3xl)] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-card text-card-foreground border border-border shadow-2xl rounded-[var(--radius-3xl)] overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-[var(--radius-2xl)] flex items-center justify-center mb-6 ring-1 ring-green-500/20">
                  <MessageCircle size={40} strokeWidth={1.5} />
                </div>
                
                <h1 className="text-3xl font-heading font-bold tracking-tight mb-3">
                  WhatsApp Business
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  Seamlessly manage customer conversations and automated alerts from your central command center.
                </p>

                <button className="w-full sm:w-auto px-10 py-4 bg-[#25D366] hover:bg-[#20bd5b] text-white font-bold rounded-[var(--radius-xl)] shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
                  <ExternalLink size={20} />
                  Connect Account
                </button>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-10">
                  {['Instant Sync', '256-bit Encryption', 'Auto-Replies', 'API Access'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {feat}
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