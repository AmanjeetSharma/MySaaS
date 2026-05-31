import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Trash2, 
  LogOut, 
  Check, 
  X, 
  Search, 
  ShieldAlert 
} from 'lucide-react';

// --- Mock Data representing your API endpoints state ---
const initialMembers = [
  { id: 'm1', name: 'Alex Rivera', email: 'alex@company.com', role: 'Owner', joinedAt: '2026-01-15' },
  { id: 'm2', name: 'Sarah Chen', email: 'sarah.c@company.com', role: 'Admin', joinedAt: '2026-02-10' },
  { id: 'm3', name: 'Michael Novak', email: 'mike@company.com', role: 'Member', joinedAt: '2026-03-22' },
];

const initialInvitations = [
  { id: 'i1', email: 'design@company.com', role: 'Member', sentAt: '2026-05-28' },
  { id: 'i2', email: 'engineering-lead@company.com', role: 'Admin', sentAt: '2026-05-30' },
];

export default function MemberManagement() {
  // State for switching tabs ("members" vs "invitations")
  const [activeTab, setActiveTab] = useState('members');
  // State for Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Organization Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members, invites, and organization access roles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Action: leaveOrganizationController */}
            <button className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors border border-destructive/30 text-destructive hover:bg-destructive/10 h-10 px-4 py-2">
              <LogOut className="h-4 w-4" />
              Leave Org
            </button>
            {/* Trigger for inviteMemberController Modal */}
            <button 
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          </div>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="flex border-b border-border space-x-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'members' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Members ({initialMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'invitations' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Invites ({initialInvitations.length})
          </button>
        </div>

        {/* --- TAB CONTENT: MEMBERS LIST (getMembersController) --- */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* Search Bar Utility */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search members..." 
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Desktop Table & Mobile Card Layout */}
            <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      <th className="p-4">Member</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {initialMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role === 'Owner' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{member.joinedAt}</td>
                        <td className="p-4 text-right">
                          {/* Action: removeMemberController */}
                          {member.role !== 'Owner' && (
                            <button className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-border">
                {initialMembers.map((member) => (
                  <div key={member.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'Owner' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-dashed border-border text-muted-foreground">
                      <span>Joined {member.joinedAt}</span>
                      {member.role !== 'Owner' && (
                        <button className="flex items-center gap-1 text-destructive font-medium px-2 py-1 rounded hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: PENDING INVITATIONS (getPendingInvitationsController) --- */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {/* Demo Header Info Box for simulated user actions */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Accepting Invitations?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Users received an email containing a secure token. This interface acts as the control panel to see or revoke active invites.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      <th className="p-4">Invited Email</th>
                      <th className="p-4">Target Role</th>
                      <th className="p-4">Sent Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {initialInvitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium text-foreground">{invite.email}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                            {invite.role}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{invite.sentAt}</td>
                        <td className="p-4 text-right space-x-2">
                          {/* Demo of user accepting invitation: acceptInvitationController */}
                          <button className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-border bg-background hover:bg-accent h-8 px-2.5 text-emerald-600 gap-1">
                            <Check className="h-3.5 w-3.5" /> Accept Demo
                          </button>
                          {/* Revoke Invitation */}
                          <button className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors inline-flex align-middle">
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-border">
                {initialInvitations.map((invite) => (
                  <div key={invite.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{invite.email}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Sent: {invite.sentAt}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                        {invite.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-border">
                      <button className="text-xs font-medium text-emerald-600 px-2 py-1 rounded hover:bg-emerald-500/10 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button className="text-xs font-medium text-destructive px-2 py-1 rounded hover:bg-destructive/10 flex items-center gap-1">
                        <X className="h-3.5 w-3.5" /> Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- SHADCN DIALOG DIALOG: INVITE MEMBER (inviteMemberController) --- */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border max-w-md w-full rounded-xl shadow-lg p-6 relative animate-in fade-in-50 zoom-in-95 duration-150">
            
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold font-heading">Invite a teammate</h3>
              <p className="text-sm text-muted-foreground">
                Send an organization invitation link to a new member's email address.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsInviteOpen(false); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Role Allocation</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Member">Member (View & Edit assignments)</option>
                  <option value="Admin">Admin (Full write configurations)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}