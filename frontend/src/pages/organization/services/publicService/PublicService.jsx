// src/pages/PublicService.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Clock,
    MapPin,
    Video,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    Sparkles,
    ArrowRight
} from "lucide-react";
import { useServiceStore } from "@/stores";
import PublicService404 from "./PublicSerivce404";

// Currency Formatter
const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Available Time Slots
const TIME_SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

const PublicService = () => {
    const { orgSlug, serviceSlug } = useParams();
    const { publicService, getServiceBySlug, isLoading, error, clearPublicService } = useServiceStore();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        getServiceBySlug(orgSlug, serviceSlug);

        return () => clearPublicService();
    }, [orgSlug, serviceSlug, getServiceBySlug, clearPublicService]);

    // Loading Skeleton State
    if (isLoading) {
        return <PublicServiceSkeleton />;
    }

    // Error State or Missing Data -> Return 404 Component
    if (error || !publicService) {
        return <PublicService404 message={error || "We couldn't find the requested booking page."} />;
    }

    const {
        name,
        description,
        mode,
        durationInMinutes,
        price,
        currency,
        address,
        meetingProvider,
        isActive,
    } = publicService;

    const formattedOrgName = orgSlug
        ? orgSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "Organization";

    const handleBookingSubmit = () => {
        if (!selectedSlot) return;
        setIsBooking(true);
        setTimeout(() => {
            alert(`Booking initiated for ${selectedDate.toDateString()} at ${selectedSlot}`);
            setIsBooking(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFC] text-slate-900 antialiased flex flex-col justify-between selection:bg-indigo-600 selection:text-white">

            {/* HEADER: miniCRM Logo & Verification Badge */}
            <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* miniCRM Brand Logo */}
                    <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                            mini<span className="text-indigo-600">CRM</span>
                        </span>
                    </div>

                    {/* Trust Badge */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Verified Booking</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">

                {/* HEADER HIERARCHY: Org Name -> Service Name */}
                <section className="mb-10 max-w-3xl">

                    {/* Organization Name */}
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        {formattedOrgName}
                    </div>

                    {/* Service Name */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                        {name}
                    </h1>

                    {/* Service Description */}
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        {description}
                    </p>
                </section>

                {/* TWO-COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: Service Specs */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Service Details
                            </h3>

                            {/* Price & Duration */}
                            <div className="flex items-baseline justify-between border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {formatCurrency(price, currency)}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500"> / session</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium text-sm">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <span>{durationInMinutes} mins</span>
                                </div>
                            </div>

                            {/* Meeting Mode */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700 mt-0.5">
                                        {mode === "OFFLINE" ? (
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                        ) : (
                                            <Video className="w-5 h-5 text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">
                                            {mode === "OFFLINE" ? "In-Person Meeting" : "Virtual Video Call"}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {mode === "OFFLINE"
                                                ? "Location address provided below"
                                                : `Conducted via ${meetingProvider?.replace("_", " ") || "Google Meet"}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Offline Address */}
                                {mode === "OFFLINE" && address && (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-1 ml-12">
                                        <p className="font-semibold text-slate-900">{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-slate-400">{address.country}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Booking Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
                            {!isActive ? (
                                <div className="py-12 text-center space-y-3">
                                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                                    <h3 className="text-lg font-bold text-slate-900">Bookings Currently Paused</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                        This service is currently not accepting new appointments.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Select Date & Time</h2>
                                            <p className="text-xs text-slate-500">Local time zone</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-slate-600">
                                            <button className="p-1 hover:bg-white rounded-md transition-all">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs font-semibold px-2">July 2026</span>
                                            <button className="p-1 hover:bg-white rounded-md transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Selector */}
                                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
                                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                            const date = new Date();
                                            date.setDate(date.getDate() + offset);
                                            const isSelected = selectedDate.toDateString() === date.toDateString();

                                            return (
                                                <button
                                                    key={offset}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        setSelectedSlot(null);
                                                    }}
                                                    className={`flex-1 min-w-[70px] py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${isSelected
                                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                                                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                                                    </span>
                                                    <span className="text-lg font-bold">
                                                        {date.getDate()}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Time Slots */}
                                    <div className="mb-8">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                            Available Slots
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {TIME_SLOTS.map((slot) => {
                                                const isSlotSelected = selectedSlot === slot;
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${isSlotSelected
                                                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20"
                                                            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        disabled={!selectedSlot || isBooking}
                                        onClick={handleBookingSubmit}
                                        className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${selectedSlot && !isBooking
                                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 cursor-pointer active:scale-[0.99]"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                            }`}
                                    >
                                        {isBooking ? (
                                            <span>Reserving Slot...</span>
                                        ) : (
                                            <>
                                                <span>Book Appointment</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white py-4 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-600">miniCRM</span>. All rights reserved.
            </footer>
        </div>
    );
};

// Skeleton Loader
const PublicServiceSkeleton = () => (
    <div className="min-h-screen bg-[#FAFAFC] animate-pulse p-8 max-w-6xl mx-auto space-y-8">
        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        <div className="space-y-3">
            <div className="h-6 w-40 bg-slate-200 rounded-full"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-80 bg-slate-200 rounded-3xl"></div>
            <div className="lg:col-span-7 h-96 bg-slate-200 rounded-3xl"></div>
        </div>
    </div>
);

export default PublicService;