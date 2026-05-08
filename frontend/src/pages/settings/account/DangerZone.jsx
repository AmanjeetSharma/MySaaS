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
        <Card className="border-destructive/30 shadow-sm overflow-hidden bg-destructive/5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-50 pointer-events-none" />

            <CardHeader className="pb-4 border-b border-destructive/10 relative z-10">
                <CardTitle className="text-xl text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-base">
                    Irreversible and destructive actions for your account.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1 max-w-2xl">
                        <h4 className="font-semibold text-foreground">Delete Account</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Once you delete your account, there is no going back. This will permanently delete your personal data, active sessions, and remove you from our servers. Please be certain.
                        </p>
                    </div>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="shrink-0 shadow-sm cursor-pointer hover:bg-destructive/40">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Account
                                </DialogTitle>
                                <DialogDescription className="pt-3">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>

                            <Alert variant="destructive" className="my-4 bg-destructive/10 border-destructive/20 text-destructive">
                                <AlertTitle className="font-semibold">Warning</AlertTitle>
                                <AlertDescription className="text-xs mt-1">
                                    All your settings, preferences, and active sessions will be permanently lost.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3 py-2">
                                <Label htmlFor="confirm" className="text-sm font-medium">
                                    To verify, type <span className="font-bold text-foreground">DELETE</span> below:
                                </Label>
                                <Input
                                    id="confirm"
                                    placeholder="DELETE"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="font-mono focus-visible:ring-destructive"
                                    autoComplete="off"
                                />
                            </div>

                            <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setDeleteConfirmation('');
                                    }}
                                    disabled={isUpdating}
                                    className={'cursor-pointer'}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== 'DELETE' || isUpdating}
                                    className="group hover:bg-destructive/40 hover:text-destructive-foreground transition-all duration-200 cursor-pointer"
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