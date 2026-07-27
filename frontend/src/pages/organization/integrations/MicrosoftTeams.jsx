import React from 'react';
import { Users, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MicrosoftTeams = () => {
  const handleConnect = () => {
    toast.info('💼 Microsoft Teams integration is coming soon!', {
      description: 'We\'re building seamless collaboration with Teams for your workspace.',
      duration: 4000,
      position: 'top-center',
      icon: '📅',
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          {/* Decorative glow behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#464EB8]/20 to-[#7B83EB]/20 rounded-[var(--radius-3xl)] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-card text-card-foreground border border-border shadow-2xl rounded-[var(--radius-3xl)] overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#464EB8]/10 text-[#464EB8] rounded-[var(--radius-2xl)] flex items-center justify-center mb-6 ring-1 ring-[#464EB8]/20">
                  <Users size={40} strokeWidth={1.5} />
                </div>
                
                <h1 className="text-3xl font-heading font-bold tracking-tight mb-3">
                  Microsoft Teams
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  Unify team communication, file sharing, and collaboration all in one place.
                </p>

                <button 
                  onClick={handleConnect}
                  className="w-full sm:w-auto px-10 py-4 bg-[#464EB8] hover:bg-[#3b42a3] text-white font-bold rounded-[var(--radius-xl)] shadow-xl shadow-[#464EB8]/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  <ExternalLink size={20} />
                  Connect Account
                </button>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-10">
                  {['Team Chat', 'File Sharing', 'Calendar Sync', 'Meeting Calls'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                      <CheckCircle2 size={16} className="text-[#464EB8]" />
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

export default MicrosoftTeams;