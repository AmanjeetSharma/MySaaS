import { memo } from 'react';
import { Users, ChevronRight, UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SectionHeader } from './SectionHeader';

const getInitials = (name = '') => {
    if (!name) return 'U';
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export const OrganizationTeam = memo(({
    memberCount,
    maxMembers,
    remainingSlots,
    membersList = [],
    visibleMembers = [],
    overflowMembersCount = 0,
    maxVisibleAvatars = 4,
    onNavigateToMembers,
    onOpenInviteModal,
}) => {
    return (
        <section className="space-y-4">
            <SectionHeader
                icon={Users}
                title="Team Members"
                description={`${memberCount} of ${maxMembers} members`}
            />

            <div className="space-y-3 pt-1">
                <button
                    type="button"
                    onClick={onNavigateToMembers}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-hover hover:border-border transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left"
                >
                    <div className="text-left min-w-0 pr-2">
                        <span className="text-xs font-semibold text-foreground group-hover:text-hover-foreground block truncate">
                            View all members
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate block">
                            Member permissions & invitations
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {membersList.length > 0 && (
                            <div className="flex items-center -space-x-2 group-hover:space-x-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                {visibleMembers.map((member, index) => {
                                    const isLast = index === maxVisibleAvatars - 1;
                                    const hasOverlay = isLast && overflowMembersCount > 0;
                                    const memberName = member.name || member.user?.name || member.email || 'Member';
                                    const memberAvatar = member.avatar || member.user?.avatar;
                                    const memberId = member._id || member.id || member.userId || index;

                                    return (
                                        <div
                                            key={memberId}
                                            className="relative shrink-0 transition-transform duration-200 group-hover:scale-105"
                                            style={{ zIndex: index + 1 }}
                                        >
                                            <Avatar className="h-6 w-6 border-2 border-background shadow-xs">
                                                <AvatarImage src={memberAvatar} alt={memberName} />
                                                <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">
                                                    {getInitials(memberName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {hasOverlay && (
                                                <div className="absolute inset-0 rounded-full border border-background bg-foreground/90 text-background text-[9px] font-bold flex items-center justify-center shadow-xs pointer-events-none">
                                                    +{overflowMembersCount}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </div>
                </button>

                {remainingSlots > 0 ? (
                    <button
                        type="button"
                        onClick={onOpenInviteModal}
                        className="w-full h-8 px-3 text-xs font-semibold text-primary hover:bg-primary/10 border border-dashed border-primary/50 hover:border-primary rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Invite Team Member</span>
                    </button>
                ) : (
                    <div className="p-2.5 bg-surface rounded-lg border border-border-subtle text-center">
                        <p className="text-[11px] text-muted-foreground">
                            Member limit reached. Upgrade to add more members.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
});
OrganizationTeam.displayName = 'OrganizationTeam';
