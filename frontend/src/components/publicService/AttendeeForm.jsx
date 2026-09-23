import { forwardRef } from "react";
import { User, Mail, Phone, FileText, ArrowRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/pages/organization/services/publicService/publicService.helper.js";

const AttendeeForm = forwardRef(({
    formData,
    onInputChange,
    onSubmit,
    isFormValid,
    isProcessing,
    price,
    currency
}, ref) => {
    return (
        <div ref={ref} id="attendee-form" className="bg-card rounded-2xl border border-border/80 shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 text-card-foreground">
            <div className="border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Your Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Please provide your contact information to finalize and pay.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Full Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="Your full name"
                            className="w-full pl-10 pr-4 py-2.5 h-11 sm:h-10 rounded-xl border border-input bg-input/20 text-foreground text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Email Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={onInputChange}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-2.5 h-11 sm:h-10 rounded-xl border border-input bg-input/20 text-foreground text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={onInputChange}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 h-11 sm:h-10 rounded-xl border border-input bg-input/20 text-foreground text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <FileText className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            placeholder="Any specific requests or notes for the appointment"
                            className="w-full pl-10 pr-4 py-2.5 h-11 sm:h-10 rounded-xl border border-input bg-input/20 text-foreground text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="pt-4 hidden sm:block">
                    <button
                        type="submit"
                        disabled={!isFormValid || isProcessing}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs ${
                            isFormValid && !isProcessing
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer active:scale-[0.99]"
                                : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground/70" />
                                <span>Securing appointment...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm & Pay {price > 0 ? formatCurrency(price, currency) : ""}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
});

AttendeeForm.displayName = "AttendeeForm";

export default AttendeeForm;