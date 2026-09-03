import React, { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
    Loader2,
    Phone,
    ShieldCheck,
    ShieldAlert,
    Smartphone,
    Unlink,
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
        isUpdating,
        addPhoneNumber,
        verifyPhoneOtp,
        unlinkPhoneNumber
    } = useUserStore();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpSection, setShowOtpSection] = useState(false);

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isRemovingPhone, setIsRemovingPhone] = useState(false);

    const phoneData = userProfile?.phone;

    const verifiedPhone = phoneData?.number || null;
    const pendingPhone = phoneData?.pendingNumber || null;
    const isVerified = phoneData?.isVerified || false;

    useEffect(() => {
        if (isVerified && verifiedPhone) {
            setPhone(verifiedPhone);
            setShowOtpSection(false);
            return;
        }

        if (pendingPhone && !isVerified) {
            setPhone(pendingPhone);
            return;
        }

        setPhone('');
        setOtp('');
        setShowOtpSection(false);
    }, [verifiedPhone, pendingPhone, isVerified]);

    const statusConfig = useMemo(() => {
        if (isVerified && verifiedPhone) {
            return {
                type: 'verified',
                description: 'Your phone number is verified and linked to your account.'
            };
        }

        if (pendingPhone && !isVerified) {
            return {
                type: 'pending',
                description: 'OTP verification is pending for this phone number.'
            };
        }

        return {
            type: 'none',
            description: 'Add a phone number to improve account security.'
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

        try {
            await addPhoneNumber(phone);
            setShowOtpSection(true);
            toast.success('OTP sent successfully');
        } catch (error) {
            setShowOtpSection(false);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to send OTP'
            );
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
            toast.success('Phone verified successfully');
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to verify OTP'
            );
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
        <Card className="border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs overflow-hidden rounded-2xl">
            {/* Header */}
            <CardHeader className="border-b border-border-subtle bg-surface-sunken/40">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-accent/10 border border-accent/20 shrink-0">
                            <Phone className="h-5 w-5 text-accent" />
                        </div>

                        <div>
                            <CardTitle className="font-heading text-base sm:text-lg font-semibold text-foreground">
                                Phone Number
                            </CardTitle>

                            <CardDescription className="mt-0.5 text-xs sm:text-sm text-subtle-foreground">
                                Secure your account with OTP verification.
                            </CardDescription>
                        </div>
                    </div>

                    {statusConfig.type === 'verified' && (
                        <Badge className="rounded-full border border-success/20 bg-success/10 text-success hover:bg-success/15 text-[11px] sm:text-xs px-2.5 py-1">
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Verified
                        </Badge>
                    )}

                    {statusConfig.type === 'pending' && (
                        <Badge className="rounded-full border border-warning/20 bg-warning/10 text-warning hover:bg-warning/15 text-[11px] sm:text-xs px-2.5 py-1">
                            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                            Verification Pending
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-5 space-y-4 sm:space-y-5">
                {/* Status */}
                <div className="rounded-xl sm:rounded-2xl border border-border-subtle bg-surface p-3 sm:p-4">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-center shrink-0">
                            <Smartphone className="h-5 w-5 text-accent" />
                        </div>

                        <div className="space-y-1 min-w-0">
                            <p className="font-heading text-sm sm:text-base font-bold text-foreground break-all">
                                {verifiedPhone || pendingPhone || 'No phone number added'}
                            </p>

                            <p className="text-[11px] sm:text-xs text-subtle-foreground leading-relaxed">
                                {statusConfig.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Phone Input */}
                {!isVerified && (
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                            Phone Number
                        </Label>

                        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-subtle-foreground">
                                    +91
                                </span>

                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter phone number"
                                    className="h-10 sm:h-11 pl-11 sm:pl-12 rounded-xl border-border bg-surface text-sm text-foreground focus-visible:ring-ring"
                                />
                            </div>

                            <Button
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || phone.length !== 10}
                                className="h-10 sm:h-11 rounded-xl w-full sm:w-auto sm:min-w-35 text-xs font-bold uppercase tracking-wider bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>Send OTP</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* OTP */}
                {showOtpSection && !isVerified && (
                    <>
                        <Separator className="bg-border-subtle" />

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3 className="font-heading text-sm font-semibold text-foreground">
                                    Verify OTP
                                </h3>

                                <p className="text-[11px] sm:text-xs text-subtle-foreground">
                                    Enter the 6-digit OTP sent to your phone number.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <Input
                                    type="text"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="Enter OTP"
                                    className="h-10 sm:h-11 rounded-xl border-border bg-surface text-sm text-foreground focus-visible:ring-ring"
                                />

                                <Button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifyingOtp || otp.length !== 6}
                                    className="h-10 sm:h-11 rounded-xl w-full sm:w-auto sm:min-w-35 text-xs font-bold uppercase tracking-wider bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                >
                                    {isVerifyingOtp ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>Verify OTP</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Remove / Unlink */}
                {(verifiedPhone || pendingPhone) && (
                    <>
                        <Separator className="bg-border-subtle" />

                        <Button
                            variant="outline"
                            onClick={handleRemovePhone}
                            disabled={isRemovingPhone || isUpdating}
                            className="w-full h-10 sm:h-11 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer bg-secondary text-secondary-foreground border-border-subtle hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                        >
                            {isRemovingPhone ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Unlink  className="mr-2 h-4 w-4" />
                                    {isVerified ? 'Unlink Phone' : 'Remove Phone'}
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PhoneComponent;