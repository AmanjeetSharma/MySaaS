import React from 'react';
import { Video, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Zoom = () => {
  const handleConnect = () => {
    toast.info('🚀 Zoom integration is coming soon!', {
      description: 'We\'re working on bringing seamless video conferencing to your dashboard.',
      duration: 4000,
      position: 'top-center',
      icon: '🎥',
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          {/* Decorative glow behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[var(--radius-3xl)] blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-card text-card-foreground border border-border shadow-2xl rounded-[var(--radius-3xl)] overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[var(--radius-2xl)] flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
                  <Video size={40} strokeWidth={1.5} />
                </div>
                
                <h1 className="text-3xl font-heading font-bold tracking-tight mb-3">
                  Zoom Meetings
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  Schedule, join, and manage Zoom meetings directly from your command center.
                </p>

                <button 
                  onClick={handleConnect}
                  className="w-full sm:w-auto px-10 py-4 bg-[#0B5CFF] hover:bg-[#0a4fd6] text-white font-bold rounded-[var(--radius-xl)] shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  <ExternalLink size={20} />
                  Connect Account
                </button>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-10">
                  {['HD Video', 'Screen Sharing', 'Meeting Scheduler', 'Cloud Recording'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                      <CheckCircle2 size={16} className="text-blue-500" />
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

export default Zoom;