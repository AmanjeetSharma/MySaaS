import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore } from '@/stores';

export default function OrganizationDetails() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const { getOrganization, updateOrganization, ownedOrganization, isLoading, isUpdating } = useOrganizationStore();

    const [organization, setOrganization] = useState(null);
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const data = await getOrganization(orgId);
                setOrganization(data);
                setOrgName(data.name);
            } catch (error) {
                toast.error('Failed to load organization');
                navigate('/organizations');
            }
        };
        fetchOrganization();
    }, [orgId, getOrganization, navigate]);

    const isOwner = ownedOrganization?._id === orgId;

    const handleUpdate = async () => {
        try {
            await updateOrganization(orgId, orgName);
            toast.success('Organization updated');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update failed');
        }
    };

    if (isLoading || !organization) {
        return <div className="flex h-screen items-center justify-center font-medium">Please wait...</div>;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
            {/* Breadcrumb/Back */}
            <button
                onClick={() => navigate('/organizations')}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Organizations
            </button>

            {/* Header Card */}
            <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <h1 className="text-3xl font-extrabold tracking-tight">{organization.name}</h1>
                            {isOwner && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Owner
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-muted-foreground">ID: {organization._id}</p>
                    </div>
                </div>
            </div>

            {/* Main Settings Form */}
            <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="border-b bg-muted/30 px-8 py-5">
                    <h2 className="text-lg font-bold">General Settings</h2>
                    <p className="text-sm text-muted-foreground">Manage your workspace identity and basic information.</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Organization Name
                            </label>
                            <input
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                disabled={!isOwner}
                                className="h-12 w-full rounded-xl border bg-background px-4 transition-all focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                placeholder="e.g. Acme Corp"
                            />
                            {!isOwner && (
                                <p className="text-xs text-muted-foreground">Only owners can rename this organization.</p>
                            )}
                        </div>

                        {isOwner && (
                            <div className="flex justify-end border-t pt-6">
                                <button
                                    onClick={handleUpdate}
                                    disabled={isUpdating || orgName === organization.name}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                    <Save className="h-5 w-5" />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}