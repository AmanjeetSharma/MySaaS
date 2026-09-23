import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { toastIcon } from "@/constants/toastIcon.constant";
import {
    Clock,
    MapPin,
    Video,
    Building2,
    ArrowRight,
    CalendarX2,
    Loader2,
    Globe2,
    Info
} from "lucide-react";
import { useServiceStore, usePaymentStore } from "@/stores";
import PublicService404 from "./PublicSerivce404";
import {
    formatCurrency,
    getDateKeyInTimezone,
    generateAllAvailableInstants,
    isDayDisabledInDisplayTz,
    formatSlotTimeInTimezone,
    loadRazorpayScript,
    getUserBrowserTimezone,
    normalizeTimezone,
} from "./publicService.helper";

import CustomCalendar from "@/components/publicService/CustomCalendar";
import BookingSlotsGrid from "@/components/publicService/BookingSlotsGrid";
import AttendeeForm from "@/components/publicService/AttendeeForm";
import ConfirmationSuccess from "@/components/publicService/ConfirmationSuccess";
import TimezoneCombobox from "@/components/publicService/TimezoneCombobox";
import VerifyPaymentPage from "@/components/publicService/VerifyPaymentPage";
import { Separator } from "@/components/ui/separator";

import PublicServiceSkeleton from "./PublicServiceSkeleton";

const PublicService = () => {
    const { orgSlug, serviceSlug } = useParams();
    const { publicService, getServiceBySlug, isLoading, error, clearPublicService } = useServiceStore();
    const { createPayment, verifyPayment, isCreatingPayment, clearPayment } = usePaymentStore();

    // Unified payment & verification status: "idle" | "verifying" | "success" | "confirmed"
    const [bookingStatus, setBookingStatus] = useState("idle");

    // Timezone State: default detected from user's device/browser
    const [displayTimezone, setDisplayTimezone] = useState(() => getUserBrowserTimezone());

    // Booking Form State
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });

    // Ref to attendee form for smooth mobile scroll
    const attendeeFormRef = useRef(null);

    useEffect(() => {
        getServiceBySlug(orgSlug, serviceSlug);
        return () => {
            clearPublicService();
            clearPayment();
        };
    }, [orgSlug, serviceSlug, getServiceBySlug, clearPublicService, clearPayment]);

    // Generate absolute UTC instants for all available slots
    const allSlotInstants = useMemo(() => {
        if (!publicService?.availability) return [];
        return generateAllAvailableInstants(
            publicService.availability,
            publicService.service?.durationInMinutes || 30
        );
    }, [publicService]);

    // Filter available slots for user date and chosen timezone
    const displayedSlots = useMemo(() => {
        if (!selectedDate || !allSlotInstants.length) return [];
        const dateKey = getDateKeyInTimezone(selectedDate, displayTimezone);

        return allSlotInstants
            .filter((slot) => getDateKeyInTimezone(slot.utcDate, displayTimezone) === dateKey)
            .map((slot) => ({
                ...slot,
                formattedTime: formatSlotTimeInTimezone(slot.utcDate, displayTimezone)
            }));
    }, [selectedDate, allSlotInstants, displayTimezone]);

    // Form Validation
    const isFormValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            Boolean(selectedDate) &&
            Boolean(selectedSlot) &&
            formData.name.trim().length >= 2 &&
            emailRegex.test(formData.email.trim())
        );
    }, [selectedDate, selectedSlot, formData]);

    // Continuous full-screen overlay for both verifying & success states
    if (bookingStatus === "verifying" || bookingStatus === "success") {
        return <VerifyPaymentPage isSuccess={bookingStatus === "success"} />;
    }

    if (isLoading) {
        return <PublicServiceSkeleton />;
    }
    if (error || !publicService) {
        return <PublicService404 message={error || "We couldn't find the requested booking page."} />;
    }

    const { service, organization, availability, isBookable } = publicService;

    if (!isBookable || !availability) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased selection:bg-primary selection:text-primary-foreground">
                <Header />
                <main className="max-w-2xl mx-auto px-4 py-16 flex-1 flex items-center justify-center w-full">
                    <EmptyState
                        title="Bookings are currently unavailable"
                        description="This service isn't accepting appointments right now. Please contact the organization or check back later."
                    />
                </main>
                <Footer />
            </div>
        );
    }

    const {
        name,
        description,
        mode,
        durationInMinutes,
        price,
        currency,
        address,
        meetingProvider
    } = service || {};

    const serviceTimezone = normalizeTimezone(availability?.timezone || "UTC");
    const formattedServiceTimezone = serviceTimezone.replace(/_/g, " ");
    const formattedDisplayTimezone = normalizeTimezone(displayTimezone).replace(/_/g, " ");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBookingSubmit = async (e) => {
        e?.preventDefault();
        if (!isFormValid || isCreatingPayment || bookingStatus !== "idle" || !selectedSlot?.isoString) return;

        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Razorpay SDK failed to load. Please check your internet connection.", {
                    icon: toastIcon("error")
                });
                return;
            }

            const payload = {
                organizationSlug: organization?.slug || orgSlug,
                serviceSlug: service?.slug || serviceSlug,
                startTime: selectedSlot.isoString,
                clientTimezone: displayTimezone,
                booker: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone?.trim() || undefined,
                },
                notes: formData.notes?.trim() || undefined,
            };

            const paymentData = await createPayment(payload);
            const razorpayOrderId = paymentData?.razorpayOrderId || paymentData?.orderId || paymentData?.order_id;
            const razorpayKey = paymentData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_default";

            const options = {
                key: razorpayKey,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: organization?.name || "Service Booking",
                description: `Booking for ${name}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#0F172A",
                },
                modal: {
                    ondismiss: () => {
                        setBookingStatus("idle");
                    },
                },
                handler: async (response) => {
                    setBookingStatus("verifying");

                    try {
                        await Promise.all([
                            verifyPayment({
                                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                            new Promise((resolve) => setTimeout(resolve, 2000))
                        ]);

                        setBookingStatus("success");

                        setTimeout(() => {
                            setBookingStatus("confirmed");
                            toast.success("Appointment booked and payment verified successfully!", {
                                icon: toastIcon("success")
                            });
                        }, 2000);

                    } catch (verifyErr) {
                        setBookingStatus("idle");
                        toast.error(verifyErr?.response?.data?.message || "Payment verification failed.", {
                            icon: toastIcon("error")
                        });
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response) => {
                setBookingStatus("idle");
                toast.error(response.error.description || "Payment transaction failed.", {
                    icon: toastIcon("error")
                });
            });
            rzp.open();
        } catch (err) {
            setBookingStatus("idle");
            toast.error(err?.response?.data?.message || "Failed to initiate payment. Please try again.");
        }
    };

    if (bookingStatus === "confirmed") {
        return (
            <ConfirmationSuccess
                serviceName={name}
                orgName={organization?.name}
                date={selectedDate}
                slot={selectedSlot?.formattedTime}
                timezone={displayTimezone}
                attendee={formData}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground antialiased flex flex-col justify-between selection:bg-primary selection:text-primary-foreground lg:h-screen lg:overflow-hidden">
            <Header />

            <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex-1 w-full flex flex-col lg:flex-row items-stretch lg:overflow-hidden min-h-0">
                {/* LEFT COLUMN: Service Info Card (Fixed part taking left space) */}
                <aside className="w-full lg:w-[440px] xl:w-[480px] shrink-0 py-4 sm:py-6 lg:py-8 lg:pr-6 xl:pr-8 flex flex-col lg:h-full lg:overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
                    <div className="bg-card rounded-2xl p-4 sm:p-6 lg:p-7 border border-border/80 shadow-xs space-y-4 sm:space-y-6 text-card-foreground flex-1 flex flex-col justify-between">
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-2 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                                    <Building2 className="w-3 h-3 text-primary" />
                                    <span>{organization?.name || "Workspace"}</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                                    {name}
                                </h1>
                            </div>

                            {description && (
                                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed border-b border-border/60 pb-4 sm:pb-5">
                                    {description}
                                </p>
                            )}

                            {/* Mobile compact key metrics pill bar */}
                            <div className="grid grid-cols-3 gap-2 p-2.5 sm:hidden bg-muted/40 rounded-xl border border-border/70 text-center">
                                <div className="min-w-0">
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Price</span>
                                    <span className="block text-xs font-bold text-foreground mt-0.5 truncate">{formatCurrency(price, currency)}</span>
                                </div>
                                <div className="border-x border-border/70 px-1 min-w-0">
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Duration</span>
                                    <span className="block text-xs font-bold text-foreground mt-0.5 truncate">{durationInMinutes} mins</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Format</span>
                                    <span className="block text-xs font-bold text-foreground mt-0.5 truncate">{mode === "OFFLINE" ? "In-Person" : "Video Call"}</span>
                                </div>
                            </div>

                            {/* Desktop & tablet detailed metrics list */}
                            <div className="hidden sm:block space-y-4 text-xs sm:text-sm font-medium">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="text-lg font-bold text-foreground">
                                        {formatCurrency(price, currency)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <div className="flex items-center gap-1.5 text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{durationInMinutes} mins</span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between pt-2 border-t border-border/60">
                                    <span className="text-muted-foreground mt-0.5">Location</span>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 text-foreground font-semibold text-xs">
                                            {mode === "OFFLINE" ? (
                                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                            ) : (
                                                <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                                            )}
                                            <span>{mode === "OFFLINE" ? "In-Person Meeting" : "Virtual Video Call"}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {mode === "OFFLINE"
                                                ? "Address provided below"
                                                : meetingProvider?.replace("_", " ") || "Google Meet"}
                                        </p>
                                    </div>
                                </div>

                                {/* Service Timezone (Immutable Provider Timezone) */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                    <span className="text-muted-foreground">Service Timezone</span>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/80 text-xs font-semibold text-foreground">
                                        <Globe2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{formattedServiceTimezone}</span>
                                    </div>
                                </div>

                                {/* User / Viewing Timezone */}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Your Timezone</span>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                        <Globe2 className="w-3.5 h-3.5 text-primary" />
                                        <span>{formattedDisplayTimezone}</span>
                                    </div>
                                </div>

                                {mode === "OFFLINE" && address && (
                                    <div className="bg-muted/40 p-3.5 rounded-xl border border-border/80 text-xs text-muted-foreground space-y-0.5 mt-2">
                                        <p className="font-semibold text-foreground">{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-muted-foreground/70">{address.country}</p>
                                    </div>
                                )}
                            </div>

                            {/* Mobile offline address display */}
                            {mode === "OFFLINE" && address && (
                                <div className="sm:hidden bg-muted/40 p-3 rounded-xl border border-border/70 text-xs text-muted-foreground space-y-0.5">
                                    <p className="font-semibold text-foreground">{address.street}</p>
                                    <p>{address.city}, {address.state} {address.zipCode}</p>
                                </div>
                            )}
                        </div>

                        {selectedDate && selectedSlot && (
                            <div className="bg-primary/5 border border-primary/20 p-3.5 sm:p-4 rounded-xl space-y-1.5 mt-4 sm:mt-6">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Selected Appointment</p>
                                <p className="text-xs sm:text-sm font-bold text-foreground">
                                    {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {selectedSlot.formattedTime}
                                </p>
                                <p className="text-xs text-primary font-medium flex items-center gap-1">
                                    <Globe2 className="w-3 h-3" />
                                    <span>In your timezone ({formattedDisplayTimezone})</span>
                                </p>
                                {displayTimezone !== serviceTimezone && (
                                    <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-1 mt-1">
                                        Host time: {formatSlotTimeInTimezone(selectedSlot.utcDate, serviceTimezone)} ({formattedServiceTimezone})
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* VERTICAL SHADCN SEPARATOR */}
                <Separator orientation="vertical" className="hidden lg:block shrink-0 self-stretch my-6 lg:my-8" />
                <Separator orientation="horizontal" className="block lg:hidden shrink-0 my-3" />

                {/* RIGHT COLUMN: Booking Flow (Scrollable part) */}
                <section className="flex-1 w-full py-4 sm:py-6 lg:py-8 lg:pl-6 xl:pl-8 space-y-6 sm:space-y-8 lg:h-full lg:overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
                    {/* Step 1: Calendar & Slots */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-card-foreground">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/60 pb-4 sm:pb-5">
                            <div className="space-y-1">
                                <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Select Date & Time</h2>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>
                                        Service operates in <strong className="text-foreground font-semibold">{formattedServiceTimezone}</strong>. Displayed slots are converted to your timezone.
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-1 shrink-0">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Your Timezone</span>
                                <TimezoneCombobox
                                    value={displayTimezone}
                                    onChange={(newTz) => {
                                        setDisplayTimezone(newTz);
                                        setSelectedSlot(null);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center p-2.5 sm:p-5 bg-muted/20 rounded-xl sm:rounded-2xl border border-border/80">
                            <div className="bg-card rounded-xl sm:rounded-2xl border border-border/80 shadow-xs p-3 sm:p-5 w-full max-w-md">
                                <CustomCalendar
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                        setSelectedSlot(null);
                                    }}
                                    isDayDisabled={(date) => isDayDisabledInDisplayTz(date, allSlotInstants, displayTimezone)}
                                />
                            </div>
                        </div>

                        <BookingSlotsGrid
                            slots={displayedSlots}
                            selectedSlot={selectedSlot}
                            onSelectSlot={(slot) => setSelectedSlot(slot)}
                            selectedDate={selectedDate}
                            displayTimezone={displayTimezone}
                        />
                    </div>

                    {/* Step 2: Attendee Details */}
                    <AttendeeForm
                        ref={attendeeFormRef}
                        formData={formData}
                        onInputChange={handleInputChange}
                        onSubmit={handleBookingSubmit}
                        isFormValid={isFormValid}
                        isProcessing={isCreatingPayment}
                        price={price}
                        currency={currency}
                    />
                </section>
            </main>

            {/* Mobile Fixed Sticky Action Bar with iOS Safe-Area Inset */}
            <div className="sm:hidden sticky bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        {selectedSlot ? (
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-primary truncate">
                                    {selectedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {selectedSlot.formattedTime}
                                </span>
                                <span className="block text-xs font-semibold text-foreground truncate">
                                    {formatCurrency(price, currency)}
                                </span>
                            </div>
                        ) : (
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1 of 2</span>
                                <span className="block text-xs font-semibold text-muted-foreground/80">Select date & time</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedSlot) return;
                            if (!isFormValid) {
                                attendeeFormRef.current?.scrollIntoView({ behavior: "smooth" });
                            } else {
                                handleBookingSubmit();
                            }
                        }}
                        disabled={!selectedSlot || isCreatingPayment}
                        className={`py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 ${
                            selectedSlot && !isCreatingPayment
                                ? "bg-primary text-primary-foreground cursor-pointer active:scale-[0.98]"
                                : "bg-muted text-muted-foreground/60 cursor-not-allowed"
                        }`}
                    >
                        {isCreatingPayment ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-foreground" />
                                <span>Processing...</span>
                            </>
                        ) : isFormValid ? (
                            <>
                                <span>Pay & Book</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        ) : selectedSlot ? (
                            <>
                                <span>Enter Details</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            <span>Select Slot</span>
                        )}
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

/* --- Supplementary Layout Components --- */
const Header = () => (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <a
                href="/"
                className="flex items-center gap-2 group transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1"
            >
                <span className="font-extrabold text-foreground tracking-tight text-base sm:text-lg group-hover:opacity-80 transition-opacity">
                    mini<span className="text-primary">CRM</span>
                </span>
            </a>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline">
                Public Booking
            </span>
        </div>
    </header>
);

const Footer = () => (
    <footer className="border-t border-border/60 bg-background/50 py-3.5 sm:py-4 shrink-0 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">miniCRM</span>. All rights reserved.
    </footer>
);

const EmptyState = ({ title, description }) => (
    <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-8 sm:p-12 text-center space-y-3 w-full text-card-foreground">
        <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto text-warning border border-warning/20 mb-2">
            <CalendarX2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{description}</p>
    </div>
);

export default PublicService;