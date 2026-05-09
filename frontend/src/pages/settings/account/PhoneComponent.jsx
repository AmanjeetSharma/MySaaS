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
    Trash2
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

        <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden rounded-2xl">

            {/* Header */}
            <CardHeader className="border-b border-border/40 bg-muted/20">

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    <div className="flex items-center gap-3">

                        <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 shrink-0">

                            <Phone className="h-5 w-5 text-primary" />

                        </div>

                        <div>

                            <CardTitle className="text-base sm:text-lg font-semibold">
                                Phone Number
                            </CardTitle>

                            <CardDescription className="mt-0.5 text-xs sm:text-sm">
                                Secure your account with OTP verification.
                            </CardDescription>

                        </div>

                    </div>

                    {statusConfig.type === 'verified' && (

                        <Badge className="rounded-full border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/10 text-[11px] sm:text-xs px-2.5 py-1">

                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />

                            Verified

                        </Badge>

                    )}

                    {statusConfig.type === 'pending' && (

                        <Badge className="rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/10 text-[11px] sm:text-xs px-2.5 py-1">

                            <ShieldAlert className="mr-1 h-3.5 w-3.5" />

                            Verification Pending

                        </Badge>

                    )}

                </div>

            </CardHeader>

            <CardContent className="p-3 sm:p-5 space-y-4 sm:space-y-5">

                {/* Status */}
                <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-muted/20 p-3 sm:p-4">

                    <div className="flex items-start gap-2.5 sm:gap-3">

                        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-background/60 border border-border flex items-center justify-center shrink-0">

                            <Smartphone className="h-5 w-5 text-primary" />

                        </div>

                        <div className="space-y-1 min-w-0">

                            <p className="text-sm sm:text-base font-medium break-all">

                                {verifiedPhone ||
                                    pendingPhone ||
                                    'No phone number added'}

                            </p>

                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">

                                {statusConfig.description}

                            </p>

                        </div>

                    </div>

                </div>

                {/* Phone Input */}
                {!isVerified && (

                    <div className="space-y-2">

                        <Label htmlFor="phone">
                            Phone Number
                        </Label>

                        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">

                            <div className="relative flex-1">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    +91
                                </span>

                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter phone number"
                                    className="h-10 sm:h-11 pl-11 sm:pl-12 rounded-xl border-border/50 bg-background/50 text-sm"
                                />

                            </div>

                            <Button
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || phone.length !== 10}
                                className="h-10 sm:h-11 rounded-xl w-full sm:w-auto sm:min-w-[140px] text-sm"
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
                        <Separator className="bg-border/40" />

                        <div className="space-y-3">

                            <div className="space-y-1">

                                <h3 className="text-sm font-semibold">
                                    Verify OTP
                                </h3>

                                <p className="text-[11px] sm:text-xs text-muted-foreground">
                                    Enter the 6-digit OTP sent to your phone number.
                                </p>

                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">

                                <Input
                                    type="text"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="Enter OTP"
                                    className="h-10 sm:h-11 rounded-xl border-border/50 bg-background/50 text-sm"
                                />

                                <Button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifyingOtp || otp.length !== 6}
                                    className="h-10 sm:h-11 rounded-xl w-full sm:w-auto sm:min-w-[140px] text-sm"
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
                        <Separator className="bg-border/40" />

                        <Button
                            variant="destructive"
                            onClick={handleRemovePhone}
                            disabled={isRemovingPhone || isUpdating}
                            className="w-full h-10 sm:h-11 rounded-xl text-sm"
                        >

                            {isRemovingPhone ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />

                                    {isVerified
                                        ? 'Unlink Phone'
                                        : 'Remove Phone'}

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