// src/pages/public-service/PublicService.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { toastIcon } from "@/constants/toastIcon.constant";
import {
    Clock,
    MapPin,
    Video,
    ShieldCheck,
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

import PublicServiceSkeleton from "./PublicServiceSkeleton";

const PublicService = () => {
    const { orgSlug, serviceSlug } = useParams();
    const { publicService, getServiceBySlug, isLoading, error, clearPublicService } = useServiceStore();
    const { createPayment, verifyPayment, isCreatingPayment, clearPayment } = usePaymentStore();

    // Unified payment & verification status: "idle" | "verifying" | "success" | "confirmed"
    const [bookingStatus, setBookingStatus] = useState("idle");

    // Timezone State
    const [displayTimezone, setDisplayTimezone] = useState(() => getUserBrowserTimezone());

    // Booking Form State
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });

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
            <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
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
                booker: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || "N/A",
                },
                startTime: selectedSlot.isoString,
                notes: formData.notes.trim() || "No additional notes provided.",
            };

            const paymentOrder = await createPayment(payload);
            const paymentTimeout = Math.max(
                1,
                Math.floor((new Date(paymentOrder.paymentExpiresAt).getTime() - Date.now()) / 1000)
            );

            const options = {
                key: paymentOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency || "INR",
                order_id: paymentOrder.razorpayOrderId,
                name: service?.name || "Booking Service",
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                timeout: paymentTimeout,
                theme: { color: "#000000" },
                modal: {
                    backdropclose: false,
                    escape: false,
                    confirm_close: true,
                    ondismiss: () => {
                        toast.info("The payment was not completed. Please try again to finish your booking.", {
                            icon: toastIcon("info")
                        });
                    },
                },
                handler: async (response) => {
                    // Lock into verifying state immediately
                    setBookingStatus("verifying");

                    try {
                        // Ensure at least 1500ms loader runtime
                        await Promise.all([
                            verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                            new Promise((resolve) => setTimeout(resolve, 1500))
                        ]);

                        // Direct atomic switch to success state without exiting overlay
                        setBookingStatus("success");

                        // Hold success badge for 2s before final confirmation
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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
            <Header />

            <main className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: Service Summary */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100">
                                    <Building2 className="w-3 h-3 text-indigo-500" />
                                    <span>{organization?.name || "Workspace"}</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {name}
                                </h1>
                            </div>

                            {description && (
                                <p className="text-slate-600 text-sm leading-relaxed border-b border-slate-100 pb-5">
                                    {description}
                                </p>
                            )}

                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Price</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        {formatCurrency(price, currency)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Duration</span>
                                    <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{durationInMinutes} mins</span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between pt-2 border-t border-slate-100">
                                    <span className="text-slate-500 mt-0.5">Location</span>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                                            {mode === "OFFLINE" ? (
                                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                                            ) : (
                                                <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                                            )}
                                            <span>{mode === "OFFLINE" ? "In-Person Meeting" : "Virtual Video Call"}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {mode === "OFFLINE"
                                                ? "Address provided below"
                                                : meetingProvider?.replace("_", " ") || "Google Meet"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-slate-500">Service Timezone</span>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800">
                                        <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>{formattedServiceTimezone}</span>
                                    </div>
                                </div>

                                {mode === "OFFLINE" && address && (
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-0.5 mt-2">
                                        <p className="font-semibold text-slate-900">{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-slate-400">{address.country}</p>
                                    </div>
                                )}
                            </div>

                            {selectedDate && selectedSlot && (
                                <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-2xl space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Selected Appointment</p>
                                    <p className="text-xs font-semibold text-slate-900">
                                        {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {selectedSlot.formattedTime}
                                    </p>
                                    <p className="text-[10px] text-slate-400">Timezone: {formattedDisplayTimezone}</p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: Booking Flow */}
                    <section className="lg:col-span-8 space-y-8">
                        {/* Step 1: Calendar & Slots */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select Date & Time</h2>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span>
                                            Provider operates in <strong className="text-slate-700 font-semibold">{formattedServiceTimezone}</strong>. Displayed slots are adjusted to your timezone.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Viewing in</span>
                                    <TimezoneCombobox
                                        value={displayTimezone}
                                        onChange={(newTz) => {
                                            setDisplayTimezone(newTz);
                                            setSelectedSlot(null);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center p-4 sm:p-6 bg-slate-50/60 rounded-2xl border border-slate-100">
                                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 w-full max-w-md">
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
                            formData={formData}
                            onInputChange={handleInputChange}
                            onSubmit={handleBookingSubmit}
                            isFormValid={isFormValid}
                            isProcessing={isCreatingPayment}
                            price={price}
                            currency={currency}
                        />
                    </section>
                </div>
            </main>

            {/* Mobile Fixed CTA */}
            <div className="sm:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 p-4 shadow-xl">
                <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={!isFormValid || isCreatingPayment}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${isFormValid && !isCreatingPayment
                        ? "bg-indigo-600 text-white cursor-pointer active:scale-[0.98]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {isCreatingPayment ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Opening Checkout...</span>
                        </>
                    ) : (
                        <>
                            <span>{selectedSlot ? `Pay & Book (${selectedSlot.formattedTime})` : "Select Slot to Book"}</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            <Footer />
        </div>
    );
};

/* --- Supplementary Layout Components --- */
const Header = () => (
    <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a
                href="/"
                className="flex items-center gap-2 group transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 rounded-lg p-1 -ml-1"
            >
                <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:opacity-80 transition-opacity">
                    mini<span className="text-indigo-600">CRM</span>
                </span>
            </a>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Verified Booking Page</span>
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="border-t border-slate-200/60 bg-white py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-600">miniCRM</span>. All rights reserved.
    </footer>
);

const EmptyState = ({ title, description }) => (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 text-center space-y-3 w-full">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-2">
            <CalendarX2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{description}</p>
    </div>
);

export default PublicService;