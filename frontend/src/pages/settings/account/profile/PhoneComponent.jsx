import React, { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    Smartphone,
    Unlink,
    KeyRound,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

import { toast } from 'sonner';

const phoneNumberValidator = (phoneNumber) => {
    const errors = [];
    const cleaned = phoneNumber.trim();

    if (!cleaned) errors.push('Phone number is required');
    if (cleaned && !/^\d+$/.test(cleaned)) errors.push('Phone number must contain only numbers');
    if (cleaned && cleaned.length !== 10) errors.push('Phone number must be exactly 10 digits');
    if (cleaned && !/^[6-9]/.test(cleaned)) errors.push('Phone number must start with 6, 7, 8, or 9');

    return {
        valid: errors.length === 0,
        errors
    };
};

const PhoneComponent = () => {
    const {
        userProfile,
        addPhoneNumber,
        verifyPhoneOtp,
        unlinkPhoneNumber
    } = useUserStore();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpSection, setShowOtpSection] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpFeedback, setOtpFeedback] = useState(null);

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isRemovingPhone, setIsRemovingPhone] = useState(false);

    const phoneData = userProfile?.phone;

    const verifiedPhone = phoneData?.number || null;
    const pendingPhone = phoneData?.pendingNumber || null;
    const isVerified = phoneData?.isVerified || false;

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (isVerified && verifiedPhone) {
            setPhone(verifiedPhone);
            setShowOtpSection(false);
            setOtp('');
            setOtpFeedback(null);
            return;
        }

        if (pendingPhone && !isVerified) {
            // Pre-fill phone if available, but OTP section should ONLY appear when send OTP is clicked
            setPhone(pendingPhone);
            return;
        }

        if (!verifiedPhone && !pendingPhone) {
            setPhone('');
            setOtp('');
            setShowOtpSection(false);
            setOtpFeedback(null);
        }
    }, [verifiedPhone, pendingPhone, isVerified]);

    const statusConfig = useMemo(() => {
        if (isVerified && verifiedPhone) {
            return {
                type: 'verified',
                description: 'Your phone number is verified and linked for security notifications.'
            };
        }

        if (pendingPhone && !isVerified) {
            return {
                type: 'pending',
                description: 'OTP verification is pending. Please enter the 6-digit code sent to your phone.'
            };
        }

        return {
            type: 'none',
            description: 'Link your phone number to enable SMS notifications and enhance account security.'
        };
    }, [verifiedPhone, pendingPhone, isVerified]);

    const handlePhoneChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        if (onlyNumbers.length <= 10) {
            setPhone(onlyNumbers);
        }
    };

    const handleOtpChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        if (onlyNumbers.length <= 6) {
            setOtp(onlyNumbers);
        }
    };

    const handleSendOtp = async () => {
        const validation = phoneNumberValidator(phone);

        if (!validation.valid) {
            return toast.error(validation.errors[0]);
        }

        setIsSendingOtp(true);
        setOtpFeedback(null);

        try {
            const result = await addPhoneNumber(phone);
            // OTP section should only appear when send OTP is clicked
            setShowOtpSection(true);

            // Compute cooldown from backend resendAfter
            let cooldown = 60;
            if (result?.resendAfter) {
                const targetTime = typeof result.resendAfter === 'number'
                    ? result.resendAfter
                    : new Date(result.resendAfter).getTime();
                const diffSeconds = Math.ceil((targetTime - Date.now()) / 1000);
                if (diffSeconds > 0) {
                    cooldown = diffSeconds;
                }
            }
            setResendCooldown(cooldown);

            // Handle the two distinct backend return cases
            if (result?.otpSent === false) {
                const infoMsg = result?.message || `Please wait ${cooldown} seconds before requesting a new OTP`;
                setOtpFeedback({ type: 'info', message: infoMsg });
            } else {
                const successMsg = result?.message || 'OTP sent successfully. Please verify it to add your phone number.';
                setOtpFeedback({ type: 'success', message: successMsg });
            }
        } catch (error) {
            setShowOtpSection(true);
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to send OTP';
            setOtpFeedback({ type: 'error', message: errorMsg });
            toast.error(errorMsg);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            return toast.error('OTP is required');
        }

        if (!/^\d{6}$/.test(otp)) {
            return toast.error('OTP must be a valid 6-digit number');
        }

        setIsVerifyingOtp(true);

        try {
            await verifyPhoneOtp(otp);
            setOtp('');
            setShowOtpSection(false);
            setOtpFeedback(null);
            toast.success('Phone verified successfully');
        } catch (error) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to verify OTP';
            setOtpFeedback({ type: 'error', message: errorMsg });
            toast.error(errorMsg);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleRemovePhone = async () => {
        setIsRemovingPhone(true);

        try {
            await unlinkPhoneNumber();
            setPhone('');
            setOtp('');
            setShowOtpSection(false);
            setOtpFeedback(null);
            toast.success(
                isVerified
                    ? 'Phone unlinked successfully'
                    : 'Phone removed successfully'
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to remove phone number'
            );
        } finally {
            setIsRemovingPhone(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with status badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Phone & SMS Security
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Verify your phone number for account alerts and verification.
                    </p>
                </div>

                <div>
                    {statusConfig.type === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                        </span>
                    )}

                    {statusConfig.type === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-warning">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Pending Verification
                        </span>
                    )}

                    {statusConfig.type === 'none' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-subtle-foreground">
                            Not Configured
                        </span>
                    )}
                </div>
            </div>

            <Separator className="bg-border-subtle" />

            <div className="space-y-4 pt-1">
                {/* Active Phone Overview Tile */}
                <div className="rounded-xl border border-border-subtle bg-surface/50 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-surface-sunken border border-border-subtle flex items-center justify-center shrink-0 text-primary">
                            <Smartphone className="h-4 w-4" />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                            <p className="font-heading text-xs sm:text-sm font-semibold text-foreground truncate">
                                {verifiedPhone ? `+91 ${verifiedPhone}` : pendingPhone ? `+91 ${pendingPhone}` : 'No phone linked'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {statusConfig.description}
                            </p>
                        </div>
                    </div>

                    {(verifiedPhone || pendingPhone) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePhone}
                            disabled={isRemovingPhone || isSendingOtp || isVerifyingOtp}
                            className="h-8 px-2.5 text-xs text-subtle-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors shrink-0"
                        >
                            {isRemovingPhone ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : (
                                <Unlink className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            <span>{isVerified ? 'Unlink Number' : 'Remove'}</span>
                        </Button>
                    )}
                </div>

                {/* Add / Change Phone Input */}
                {!isVerified && (
                    <div className="space-y-2 max-w-lg">
                        <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                            {pendingPhone ? 'Phone Number' : 'Enter Phone Number (India)'}
                        </Label>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-subtle-foreground select-none">
                                    +91
                                </span>

                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (!isSendingOtp && phone.length === 10) {
                                                handleSendOtp();
                                            }
                                        }
                                    }}
                                    placeholder="Enter 10-digit number"
                                    className="h-9 pl-11 rounded-lg border-border bg-surface text-xs sm:text-sm text-foreground focus-visible:ring-primary"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || phone.length !== 10}
                                className="h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-1.5 h-3.5 w-3.5" />
                                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Send OTP'}
                                    </>
                                )}
                            </Button>
                        </div>

                        {!showOtpSection && pendingPhone && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                                <span>Have an unexpired verification code?</span>
                                <button
                                    type="button"
                                    onClick={() => setShowOtpSection(true)}
                                    className="text-primary hover:underline font-medium cursor-pointer"
                                >
                                    Enter OTP
                                </button>
                            </p>
                        )}
                    </div>
                )}

                {/* OTP Verification Box */}
                {showOtpSection && !isVerified && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3.5 max-w-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-primary" />
                                <h4 className="font-heading text-xs font-semibold text-foreground">
                                    Verify One-Time Passcode (OTP)
                                </h4>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowOtpSection(false);
                                    setOtp('');
                                    setOtpFeedback(null);
                                }}
                                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer rounded"
                            >
                                Change number
                            </Button>
                        </div>

                        {otpFeedback && (
                            <div
                                className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
                                    otpFeedback.type === 'success'
                                        ? 'bg-success/10 border border-success/20 text-success'
                                        : otpFeedback.type === 'info'
                                        ? 'bg-warning/10 border border-warning/20 text-warning'
                                        : 'bg-destructive/10 border border-destructive/20 text-destructive'
                                }`}
                            >
                                {otpFeedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                                {otpFeedback.type === 'info' && <Clock className="h-4 w-4 shrink-0 mt-0.5" />}
                                {otpFeedback.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                                <span className="leading-snug">{otpFeedback.message}</span>
                            </div>
                        )}

                        <p className="text-[11px] text-muted-foreground">
                            A 6-digit confirmation code was sent via SMS to <span className="font-medium text-foreground">+91 {phone}</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <Input
                                type="text"
                                value={otp}
                                onChange={handleOtpChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (!isVerifyingOtp && otp.length === 6) {
                                            handleVerifyOtp();
                                        }
                                    }
                                }}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="h-9 rounded-lg border-border bg-surface text-xs sm:text-sm text-foreground focus-visible:ring-primary flex-1 tracking-widest text-center sm:text-left font-mono"
                            />

                            <Button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp || otp.length !== 6}
                                className="h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer shrink-0"
                            >
                                {isVerifyingOtp ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>Verify OTP</>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                            <span>Didn't receive the SMS code?</span>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || resendCooldown > 0}
                                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneComponent;