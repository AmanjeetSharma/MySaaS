import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, User } from 'lucide-react';
import { useDealStore } from '@/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const DealDetails = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { currentDeal, getDealById, isLoading } = useDealStore();
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    const loadDeal = async () => {
      try {
        const data = await getDealById(dealId);
        setDeal(data);
      } catch {
        navigate('/deals');
      }
    };

    loadDeal();
  }, [dealId, getDealById, navigate]);

  useEffect(() => {
    if (currentDeal && getEntityId(currentDeal) === dealId) {
      setDeal(currentDeal);
    }
  }, [currentDeal, dealId]);

  const statusTone = useMemo(() => {
    if (!deal?.status || deal.status === 'active') return 'outline';
    if (deal.status === 'won') return 'default';
    return 'destructive';
  }, [deal?.status]);

  if (isLoading && !deal) {
    return <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />;
  }

  if (!deal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/deals')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to deals
      </button>

            <section className="rounded-3xl border border-border/70 bg-linear-to-br from-background via-background to-muted/35 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Clock3 className="size-3.5" />
              Deal record
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{deal.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              This page is backed by <span className="font-medium text-foreground">getDealById</span> and is ready for your deeper deal workflow.
            </p>
          </div>

          <Badge variant={statusTone}>{deal.status || 'active'}</Badge>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
            <p className="mt-2 text-sm font-medium">
              {deal.customer?.name ? (
                <Link to={`/customers/${getEntityId(deal.customer)}`} className="inline-flex items-center gap-1 hover:underline">
                  {deal.customer.name}
                  <ExternalLink className="size-3.5" />
                </Link>
              ) : 'Not populated'}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(deal.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Updated</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(deal.updatedAt)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Closed at</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(deal.closedAt)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Deal details</CardTitle>
            <CardDescription>Core fields returned from the deal API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <User className="size-3.5" />
                  Assigned customer
                </div>
                <p className="mt-2 text-sm font-medium">{deal.customer?.name || 'Not populated'}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Latest interaction
                </div>
                <p className="mt-2 text-sm font-medium">{formatDateTime(deal.latestInteractionAt)}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Use this page as the landing screen after creating a new deal from the customer workflow.
              </p>
              <p>
                The next step is usually to add pipeline stages, notes, and activities around the deal itself.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Related links</CardTitle>
            <CardDescription>Jump back to the customer or deal list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link to={deal.customer?.name ? `/customers/${getEntityId(deal.customer)}` : '/customers'}>
                <User className="size-4" />
                Open customer
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link to="/deals">
                <ExternalLink className="size-4" />
                Back to deals
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealDetails;
