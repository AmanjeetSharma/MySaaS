import { useEffect, useState, useRef, memo } from 'react';
import { UserPlus, X, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Invite Member Modal (Memoized with unmount cleanup)
export const InviteMemberModal = memo(({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const sendTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isSending) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSending, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setIsSending(true);
        await new Promise((resolve) => {
            sendTimerRef.current = setTimeout(resolve, 800);
        });
        onInvite(email.trim());
        setEmail('');
        setIsSending(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSending) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs animate-in fade-in-0 duration-150"
        >
            <div className="bg-surface-elevated border border-border-strong rounded-xl w-full max-w-md shadow-2xl text-surface-elevated-foreground animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        <h3 id="invite-modal-title" className="font-heading text-base font-semibold text-foreground">Invite Team Member</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSending}
                        aria-label="Close modal"
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-md hover:bg-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-5 space-y-3">
                        <div>
                            <label
                                htmlFor="invite-member-email"
                                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                            >
                                Email Address
                            </label>
                            <input
                                id="invite-member-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                disabled={isSending}
                                className="w-full h-9 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm disabled:opacity-50"
                                autoFocus
                                required
                            />
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                They will receive an invitation to join this organization workspace.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2.5 p-4 sm:p-5 border-t border-border-subtle bg-surface/40">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSending}
                            className="flex-1 h-8 px-3 border border-border rounded-lg text-xs font-medium hover:bg-hover hover:text-hover-foreground transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex-1 h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            {isSending ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                <>
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Send Invite</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});
InviteMemberModal.displayName = 'InviteMemberModal';

// Sync Organization URL Slug Confirmation Modal (Memoized and self-contained)
export const SyncSlugModal = memo(({ isOpen, isSyncing, onConfirm, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isSyncing) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSyncing, onClose]);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSyncing) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-xs animate-in fade-in-0 duration-150"
        >
            <div className="w-full max-w-md space-y-4 rounded-xl border border-border-strong bg-surface-elevated p-5 sm:p-6 shadow-2xl text-surface-elevated-foreground animate-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning border border-warning/20">
                        <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                        <h3 id="sync-modal-title" className="font-heading text-base font-bold text-foreground">
                            Sync Organization URL?
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Create a new booking link that matches the current organization name.
                        </p>
                        <p className="text-xs font-semibold leading-relaxed text-warning pt-1">
                            Warning: All existing links using this organization prefix will be disabled immediately.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                        type="button"
                        disabled={isSyncing}
                        onClick={onClose}
                        className="h-8 w-full rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-hover transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={isSyncing}
                        onClick={onConfirm}
                        className="h-8 w-full cursor-pointer flex items-center justify-center gap-1.5 rounded-lg bg-warning px-3 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Syncing...</span>
                            </>
                        ) : (
                            'Confirm Sync'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});
SyncSlugModal.displayName = 'SyncSlugModal';
