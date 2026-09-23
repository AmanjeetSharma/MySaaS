import { CheckCircle2 } from "lucide-react";

const ConfirmationSuccess = ({ serviceName, orgName, date, slot, timezone, attendee }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased selection:bg-primary selection:text-primary-foreground">
            <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1">
                        <span className="font-extrabold text-foreground tracking-tight text-base sm:text-lg group-hover:opacity-80 transition-opacity">
                            mini<span className="text-primary">CRM</span>
                        </span>
                    </a>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-3.5 sm:px-6 py-12 sm:py-16 flex-1 flex items-center justify-center w-full">
                <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8 text-center space-y-6 w-full text-card-foreground">
                    <div className="w-14 h-14 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center mx-auto text-success">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Booking Confirmed!</h2>
                        <p className="text-xs text-muted-foreground">A calendar invitation has been sent to <strong className="text-foreground">{attendee?.email}</strong></p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 sm:p-5 border border-border/80 text-left space-y-3 text-xs">
                        <div className="flex justify-between border-b border-border/60 pb-2.5">
                            <span className="text-muted-foreground">Service</span>
                            <span className="font-bold text-foreground">{serviceName}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2.5">
                            <span className="text-muted-foreground">Organization</span>
                            <span className="font-semibold text-foreground">{orgName}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2.5">
                            <span className="text-muted-foreground">Date & Time</span>
                            <span className="font-semibold text-foreground">
                                {date?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} @ {slot} ({timezone?.replace(/_/g, " ")})
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Attendee</span>
                            <span className="font-semibold text-foreground">{attendee?.name}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                        Book Another Session
                    </button>
                </div>
            </main>

            <footer className="border-t border-border/60 bg-background/50 py-3.5 sm:py-4 shrink-0 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

export default ConfirmationSuccess;