// src/pages/PublicService.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
    Clock,
    MapPin,
    Video,
    ShieldCheck,
    Building2,
    ArrowRight,
    CalendarX2,
    CheckCircle2,
    Globe,
    User,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useServiceStore } from "@/stores";
import PublicService404 from "./PublicSerivce404";
import {
    formatCurrency,
    getTodayMidnight,
    getMaxBookingDate,
    isDateDisabled,
    generateBookableSlotsForDate
} from "./publicService.helper";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const isSameDay = (a, b) =>
    Boolean(a) && Boolean(b) && a.toDateString() === b.toDateString();

const buildMonthGrid = (viewDate) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
};

/* --- Custom Calendar Component --- */

const CustomCalendar = ({ selected, onSelect, minDate, maxDate, isDayDisabled }) => {
    const [viewDate, setViewDate] = useState(
        () => new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    const today = getTodayMidnight();
    const weeks = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const canGoPrev = useMemo(() => {
        const prevMonthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0);
        return prevMonthEnd >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    }, [viewDate, minDate]);

    const canGoNext = useMemo(() => {
        const nextMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        return nextMonthStart <= maxDate;
    }, [viewDate, maxDate]);

    const goToMonth = (offset) => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div className="w-full max-w-md select-none">
            {/* Month Navigation Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <button
                    type="button"
                    onClick={() => canGoPrev && goToMonth(-1)}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${canGoPrev
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
                        : "text-slate-200 cursor-not-allowed"
                        }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm font-bold text-slate-900 tracking-tight">
                    {monthLabel}
                </span>

                <button
                    type="button"
                    onClick={() => canGoNext && goToMonth(1)}
                    disabled={!canGoNext}
                    aria-label="Next month"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${canGoNext
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
                        : "text-slate-200 cursor-not-allowed"
                        }`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 mb-1.5">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="h-8 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Day Grid */}
            <div key={monthLabel} className="space-y-1 animate-in fade-in duration-200">
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                        {week.map((date, di) => {
                            if (!date) return <div key={di} className="h-10" />;

                            const disabled =
                                date < minDate || date > maxDate || isDayDisabled(date);
                            const isSelected = isSameDay(date, selected);
                            const isToday = isSameDay(date, today);

                            return (
                                <button
                                    key={di}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => !disabled && onSelect(date)}
                                    className={`relative h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${isSelected
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20 cursor-pointer"
                                        : disabled
                                            ? "text-slate-300 cursor-not-allowed"
                                            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 cursor-pointer"
                                        }`}
                                >
                                    {date.getDate()}
                                    {isToday && !isSelected && (
                                        <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PublicService = () => {
    const { orgSlug, serviceSlug } = useParams();
    const { publicService, getServiceBySlug, isLoading, error, clearPublicService } = useServiceStore();

    // Booking state
    const [selectedDate, setSelectedDate] = useState(getTodayMidnight());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [isBooking, setIsBooking] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        getServiceBySlug(orgSlug, serviceSlug);
        return () => clearPublicService();
    }, [orgSlug, serviceSlug, getServiceBySlug, clearPublicService]);

    // Derived slots for selected date
    const availableSlots = useMemo(() => {
        if (!publicService?.availability || !selectedDate) return [];
        return generateBookableSlotsForDate(
            selectedDate,
            publicService.availability,
            publicService.service?.durationInMinutes || 30
        );
    }, [selectedDate, publicService]);

    // Validation logic
    const isFormValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            Boolean(selectedDate) &&
            Boolean(selectedSlot) &&
            formData.name.trim().length >= 2 &&
            emailRegex.test(formData.email.trim())
        );
    }, [selectedDate, selectedSlot, formData]);

    if (isLoading) return <PublicServiceSkeleton />;
    if (error || !publicService) {
        return <PublicService404 message={error || "We couldn't find the requested booking page."} />;
    }

    const { service, organization, availability, isBookable } = publicService;

    // Disabled / Unbookable State
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBookingSubmit = (e) => {
        e?.preventDefault();
        if (!isFormValid || isBooking) return;

        setIsBooking(true);
        setTimeout(() => {
            setIsBooking(false);
            setIsSubmitted(true);
        }, 800);
    };

    if (isSubmitted) {
        return (
            <ConfirmationSuccess
                serviceName={name}
                orgName={organization?.name}
                date={selectedDate}
                slot={selectedSlot}
                attendee={formData}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
            <Header />

            <main className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
                {/* TWO-COLUMN GRID: 35% Left (Summary), 65% Right (Booking Controls) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: Sticky Service Summary Card (~35% / 4 cols) */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">

                            {/* Organization Badge & Title */}
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100">
                                    <Building2 className="w-3 h-3 text-indigo-500" />
                                    <span>{organization?.name || "Workspace"}</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {name}
                                </h1>
                            </div>

                            {/* Service Description */}
                            {description && (
                                <p className="text-slate-600 text-sm leading-relaxed border-b border-slate-100 pb-5">
                                    {description}
                                </p>
                            )}

                            {/* Key Attributes List */}
                            <div className="space-y-4 text-sm font-medium">
                                {/* Price */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Price</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        {formatCurrency(price, currency)}
                                    </span>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Duration</span>
                                    <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{durationInMinutes} mins</span>
                                    </div>
                                </div>

                                {/* Meeting Type */}
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

                                {/* Address card for Offline Mode */}
                                {mode === "OFFLINE" && address && (
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-0.5 mt-2">
                                        <p className="font-semibold text-slate-900">{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-slate-400">{address.country}</p>
                                    </div>
                                )}
                            </div>

                            {/* Summary Footer Widget */}
                            {selectedDate && selectedSlot && (
                                <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-2xl space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Selected Appointment</p>
                                    <p className="text-xs font-semibold text-slate-900">
                                        {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {selectedSlot}
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: Interactive Booking Flow (~65% / 8 cols) */}
                    <section className="lg:col-span-8 space-y-8">

                        {/* Step 1: Calendar & Time Slots Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">

                            {/* Calendar Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select Date & Time</h2>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Timezone: <strong className="text-slate-700">{availability.timezone || "UTC"}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Calendar Wrapper */}
                            <div className="flex justify-center p-4 sm:p-6 bg-slate-50/60 rounded-2xl border border-slate-100">
                                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 w-full max-w-md">
                                    <CustomCalendar
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date);
                                            setSelectedSlot(null);
                                        }}
                                        minDate={getTodayMidnight()}
                                        maxDate={getMaxBookingDate()}
                                        isDayDisabled={(date) => isDateDisabled(date, availability)}
                                    />
                                </div>
                            </div>

                            {/* Time Slot Picker Grid */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Available Slots ({selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""})
                                    </label>
                                    {availableSlots.length > 0 && (
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {availableSlots.length} slots available
                                        </span>
                                    )}
                                </div>

                                {availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                        {availableSlots.map((slot) => {
                                            const isSelected = selectedSlot === slot;
                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${isSelected
                                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600/20"
                                                        : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                                                        }`}
                                                >
                                                    <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-200" : "text-slate-400"}`} />
                                                    <span>{slot}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-8 text-center">
                                        <p className="text-xs text-slate-500 font-medium">
                                            No available slots on this day. Please select another date from the calendar above.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Attendee Details Form Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Details</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Please provide your contact information to finalize the booking.</p>
                            </div>

                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Desktop Submit CTA Button */}
                                <div className="pt-4 hidden sm:block">
                                    <button
                                        type="submit"
                                        disabled={!isFormValid || isBooking}
                                        className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${isFormValid && !isBooking
                                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 cursor-pointer active:scale-[0.99]"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                            }`}
                                    >
                                        {isBooking ? (
                                            <span>Confirming Appointment...</span>
                                        ) : (
                                            <>
                                                <span>Complete Booking</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </main>

            {/* Mobile Fixed Sticky CTA Footer */}
            <div className="sm:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 p-4 shadow-xl">
                <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={!isFormValid || isBooking}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${isFormValid && !isBooking
                        ? "bg-indigo-600 text-white cursor-pointer active:scale-[0.98]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {isBooking ? (
                        <span>Processing...</span>
                    ) : (
                        <>
                            <span>{selectedSlot ? `Book for ${selectedSlot}` : "Select Slot to Book"}</span>
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
            {/* Logo Link */}
            <a
                href="http://mysaas-temp.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 rounded-lg p-1 -ml-1"
            >
                <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:opacity-80 transition-opacity">
                    mini<span className="text-indigo-600">CRM</span>
                </span>
            </a>

            {/* Verified Badge */}
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

const ConfirmationSuccess = ({ serviceName, orgName, date, slot, attendee }) => (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-16 flex-1 flex items-center justify-center w-full">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-6 w-full">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h2>
                    <p className="text-xs text-slate-500">A calendar invitation has been sent to <strong>{attendee.email}</strong></p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                        <span className="text-slate-500">Service</span>
                        <span className="font-bold text-slate-900">{serviceName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                        <span className="text-slate-500">Organization</span>
                        <span className="font-semibold text-slate-800">{orgName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                        <span className="text-slate-500">Date & Time</span>
                        <span className="font-semibold text-slate-800">
                            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} @ {slot}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Attendee</span>
                        <span className="font-semibold text-slate-800">{attendee.name}</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all cursor-pointer"
                >
                    Book Another Session
                </button>
            </div>
        </main>
        <Footer />
    </div>
);

const PublicServiceSkeleton = () => (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse p-8 max-w-335 mx-auto space-y-8">
        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-112.5 bg-slate-200 rounded-3xl"></div>
            <div className="lg:col-span-8 space-y-6">
                <div className="h-95 bg-slate-200 rounded-3xl"></div>
                <div className="h-55 bg-slate-200 rounded-3xl"></div>
            </div>
        </div>
    </div>
);

export default PublicService;