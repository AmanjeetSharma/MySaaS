import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const DangerZone = ({ onDeleteAccount, isUpdating }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        try {
            await onDeleteAccount();
            setIsDeleteDialogOpen(false);
            setDeleteConfirmation('');
        } catch (error) {
            toast.error(error.message || 'Failed to delete account');
        }
    };

    return (
        <Card className="relative overflow-hidden border-destructive/30 bg-destructive/5 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">

            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-60 pointer-events-none" />

            <CardHeader className="relative z-10 border-b border-destructive/10 pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    This action cannot be undone.
                </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 p-4 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">

                    {/* Text */}
                    <div className="space-y-1">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground">
                            Delete Account
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                            Once deleted, your account cannot be recovered. All personal data and active sessions will be permanently removed.
                        </p>
                    </div>

                    {/* Button */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto shrink-0 bg-destructive/10 hover:bg-destructive/30 transition-all duration-200 shadow-sm cursor-pointer"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[420px] rounded-2xl">

                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-destructive text-lg">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Account
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-sm">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>

                            <Alert variant="destructive" className="my-3 bg-destructive/10 border-destructive/20 text-destructive">
                                <AlertTitle className="font-semibold">Warning</AlertTitle>
                                <AlertDescription className="text-xs mt-1">
                                    All your settings, preferences, and active sessions will be permanently lost.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2 py-1">
                                <Label htmlFor="confirm" className="text-sm font-medium">
                                    Type <span className="font-bold text-foreground">DELETE</span> to confirm
                                </Label>

                                <Input
                                    id="confirm"
                                    placeholder="DELETE"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="h-10 font-mono focus-visible:ring-destructive"
                                    autoComplete="off"
                                />
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setDeleteConfirmation('');
                                    }}
                                    disabled={isUpdating}
                                    className="w-full sm:w-auto cursor-pointer"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== 'DELETE' || isUpdating}
                                    className="w-full sm:w-auto bg-destructive/20 hover:bg-destructive/30 transition-all duration-200 cursor-pointer"
                                >
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Permanently Delete
                                </Button>
                            </DialogFooter>

                        </DialogContent>
                    </Dialog>

                </div>
            </CardContent>
        </Card>
    );
};

export default DangerZone;