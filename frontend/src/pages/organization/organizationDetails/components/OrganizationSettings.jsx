import { memo } from 'react';
import { Settings2, Edit3, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from './SectionHeader';

export const OrganizationSettings = memo(({
    organization,
    isOwner,
    isEditing,
    orgName,
    setOrgName,
    orgDescription,
    setOrgDescription,
    nameInputRef,
    descriptionInputRef,
    descriptionLimit = 500,
    isUpdating,
    onOpenEditMode,
    onCancelEdit,
    onSave,
    onEditKeyDown,
}) => {
    if (!organization) return null;

    return (
        <section className="space-y-5">
            <SectionHeader
                icon={Settings2}
                title="Organization Settings"
                description="Manage your organization's basic information and public profile"
                action={
                    isOwner && !isEditing && (
                        <button
                            type="button"
                            onClick={() => onOpenEditMode('name')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit Details</span>
                        </button>
                    )
                }
            />

            {isEditing ? (
                <div className="space-y-4 pt-1" onKeyDown={onEditKeyDown}>
                    <div>
                        <label
                            htmlFor="org-name-input"
                            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                        >
                            Organization Name
                        </label>
                        <input
                            id="org-name-input"
                            ref={nameInputRef}
                            type="text"
                            disabled={isUpdating}
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full h-9 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm disabled:opacity-50"
                            placeholder="Organization name"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label
                                htmlFor="org-description-input"
                                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                Description
                            </label>
                            <span className={cn(
                                "text-[11px] font-mono tabular-nums",
                                orgDescription.length > descriptionLimit ? "text-destructive font-medium" : "text-muted-foreground"
                            )}>
                                {orgDescription.length}/{descriptionLimit}
                            </span>
                        </div>
                        <textarea
                            id="org-description-input"
                            ref={descriptionInputRef}
                            rows={4}
                            maxLength={descriptionLimit}
                            disabled={isUpdating}
                            value={orgDescription}
                            onChange={(e) => setOrgDescription(e.target.value)}
                            className="w-full p-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm resize-y disabled:opacity-50"
                            placeholder="Briefly describe your organization's mission or service..."
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">Esc</kbd> to cancel, <kbd className="px-1 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">Ctrl</kbd>+<kbd className="px-1 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">Enter</kbd> to save.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            disabled={isUpdating}
                            onClick={onCancelEdit}
                            className="h-8 px-3 border border-border rounded-lg text-xs font-medium hover:bg-hover hover:text-hover-foreground transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={isUpdating || !orgName.trim() || orgDescription.length > descriptionLimit}
                            className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save changes</span>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border-subtle/50">
                        <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Organization Name
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {organization.name}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Public URL: Path
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-surface px-2.5 py-0.5 rounded text-foreground border border-border-subtle">
                                    /{organization.slug}
                                </span>
                                {organization.isSlugStale ? (
                                    <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 uppercase tracking-wide">
                                        Sync needed
                                    </span>
                                ) : (
                                    <span className="text-xs text-success inline-flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="h-3 w-3" /> Synced
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> Description
                            </span>
                            {organization?.description && (
                                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/70">
                                    {organization.description.length}/{descriptionLimit} chars
                                </span>
                            )}
                        </div>

                        {organization?.description ? (
                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                {organization.description}
                            </p>
                        ) : (
                            <div className="py-2">
                                <p className="text-xs text-muted-foreground italic">
                                    No description provided yet.
                                </p>
                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenEditMode('description')}
                                        className="mt-1 text-xs font-medium text-primary hover:underline cursor-pointer inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
                                    >
                                        + Add description
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {!isOwner && (
                        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Contact your organization owner to edit these details.
                        </div>
                    )}
                </div>
            )}
        </section>
    );
});
OrganizationSettings.displayName = 'OrganizationSettings';
