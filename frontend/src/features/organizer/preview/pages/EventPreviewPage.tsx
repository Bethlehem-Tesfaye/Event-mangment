import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrganizerEvent, Ticket, Speaker } from "../../types/organizer";
import {
  useOrganizerEvent,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useCreateSpeaker,
  useUpdateSpeaker,
  useDeleteSpeaker,
} from "../../Dashboard/hooks/useEvents";
import EventPreviewLayout from "../components/EventPreviewLayout";
import EventInfo from "../components/EventInfo";
import TicketsList from "../components/Tickets/TicketsList";
import SpeakersList from "../components/Speakers/SpeakersList";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PulseLoader from "@/components/custom/PulseLoader";

const ticketSchema = z.object({
  type: z.string().min(1),
  price: z.number().nonnegative(),
  totalQuantity: z.number().int().positive(),
  maxPerUser: z.number().int().positive().optional(),
});

const speakerSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

function getBannerFromEvent(ev: any): string | null {
  return ev?.banner ?? ev?.bannerUrl ?? ev?.eventBannerUrl ?? ev?.event_banner_url ?? null;
}

export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("events");
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const id = useMemo(() => (eventId ? Number(eventId) : NaN), [eventId]);
  const { data: event, isLoading, error } = useOrganizerEvent(Number.isFinite(id) ? id : 0);

  const createTicket = useCreateTicket(Number(id));
  const updateTicket = useUpdateTicket(Number(id));
  const deleteTicketMutation = useDeleteTicket(Number(id));
  const createSpeaker = useCreateSpeaker(Number(id));
  const updateSpeaker = useUpdateSpeaker(Number(id));
  const deleteSpeakerMutation = useDeleteSpeaker(Number(id));

  const [editableEvent, setEditableEvent] = useState<OrganizerEvent | null>(null);
  const [newTicket, setNewTicket] = useState<any>(null);
  const [newSpeaker, setNewSpeaker] = useState<any>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [speakerError, setSpeakerError] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!event) return;
    const tickets = (event as any).tickets ?? (event as any).eventTickets ?? [];
    const speakers = (event as any).eventSpeakers ?? (event as any).speakers ?? [];
    const banner = getBannerFromEvent(event);
    setEditableEvent({
      ...event,
      banner: banner ?? undefined,
      tickets: tickets.map((t: any) => ({ ...t })),
      speakers: speakers.map((s: any) => ({ ...s })),
    } as OrganizerEvent);
    setBannerPreview(banner);
  }, [event]);

  if (isLoading) {
    return (
      <EventPreviewLayout route={route} setRoute={setRoute}>
        <main className="p-6 flex-1 space-y-6">
          {/* Navigation to Dashboard */}
          <div className="mb-4">
            <Link
              to="/organizer/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Skeleton className="w-full h-48 rounded-md" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-2 font-semibold border-b p-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2 items-center border p-2 rounded">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-2 items-center border p-2 rounded">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </EventPreviewLayout>
    );
  }

  if (error || !editableEvent) return <p className="p-4 text-red-500">Failed to load event.</p>;

  const bannerSrc = (editableEvent?.banner ?? bannerPreview) ?? undefined;
  const makeTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleChangeField = (k: string, v: string) => setEditableEvent(prev => prev ? ({ ...prev, [k]: v }) : prev);

  const handleAddTicketLocal = () => {
    if (!newTicket) return;
    const parsed = ticketSchema.safeParse({
      type: newTicket.type,
      price: Number(newTicket.price),
      totalQuantity: Number(newTicket.totalQuantity),
      maxPerUser: newTicket.maxPerUser ? Number(newTicket.maxPerUser) : undefined,
    });
    if (!parsed.success) {
      setTicketError(parsed.error.issues.map(i => i.message).join(", "));
      return;
    }
    setTicketError(null);
    const t: Ticket = { id: makeTempId(), ...parsed.data, isTemp: true };
    setEditableEvent(prev => (prev ? { ...prev, tickets: [...(prev.tickets ?? []), t] } : prev));
    setNewTicket(null);
  };

  const handleAddSpeakerLocal = () => {
    if (!newSpeaker) return;
    const parsed = speakerSchema.safeParse(newSpeaker);
    if (!parsed.success) {
      setSpeakerError(parsed.error.issues.map(i => i.message).join(", "));
      return;
    }
    setSpeakerError(null);
    const s: Speaker = { id: makeTempId(), ...parsed.data, isTemp: true };
    setEditableEvent(prev => (prev ? { ...prev, speakers: [...(prev.speakers ?? []), s] } : prev));
    setNewSpeaker(null);
  };

  const handleRemoveLocal = (type: "ticket" | "speaker", idToRemove: string | number) => {
    setEditableEvent(prev => {
      if (!prev) return prev;
      if (type === "ticket") return { ...prev, tickets: (prev.tickets ?? []).filter(t => t.id !== idToRemove) };
      return { ...prev, speakers: (prev.speakers ?? []).filter(s => s.id !== idToRemove) };
    });
  };

  const handleChangeTicket = (id: number | string, field: string, value: any) => {
    setEditableEvent(prev => prev ? ({ ...prev, tickets: prev.tickets!.map(t => t.id === id ? { ...t, [field]: value } : t) }) : prev);
    const existing = (editableEvent?.tickets ?? []).find(t => t.id === id);
    if (existing && !(existing as any).isTemp) updateTicket.mutate({ ticketId: Number(id), data: { [field]: value } });
  };

  const handleDeleteTicketRemote = (ticketId: number) => deleteTicketMutation.mutate(ticketId);

  const handleChangeSpeaker = (id: number | string, field: string, value: any) => {
    setEditableEvent(prev => prev ? ({ ...prev, speakers: prev.speakers!.map(s => s.id === id ? { ...s, [field]: value } : s) }) : prev);
    const existing = (editableEvent?.speakers ?? []).find(s => s.id === id);
    if (existing && !(existing as any).isTemp) updateSpeaker.mutate({ speakerId: Number(id), data: { [field]: value } });
  };

  const handleDeleteSpeakerRemote = (id: number) => deleteSpeakerMutation.mutate(id);

  const handleSave = async () => {
    if (!editableEvent || !Number.isFinite(id)) return;
    setSaving(true);
    const createdTickets = (editableEvent.tickets ?? []).filter(t => (t as any).isTemp);
    const createdSpeakers = (editableEvent.speakers ?? []).filter(s => (s as any).isTemp);
    try {
      await api.put(`/organizer/events/${id}`, {
        title: editableEvent.title,
        description: editableEvent.description,
        location: editableEvent.location,
        startDatetime: editableEvent.startDatetime,
        endDatetime: editableEvent.endDatetime,
      });
      for (const t of createdTickets) {
        await createTicket.mutateAsync({
          type: t.type,
          price: Number(t.price),
          totalQuantity: Number(t.totalQuantity),
          maxPerUser: Number((t as any).maxPerUser ?? 1),
        });
      }
      for (const s of createdSpeakers) {
        await createSpeaker.mutateAsync({
          name: s.name,
          bio: s.bio,
          photoUrl: s.photoUrl,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["organizer-event", id] });
      setEditable(false);
    } catch {
      // handle error if needed
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!event) {
      setEditable(false);
      return;
    }
    const tickets = (event as any).tickets ?? (event as any).eventTickets ?? [];
    const speakers = (event as any).eventSpeakers ?? (event as any).speakers ?? [];
    const banner = getBannerFromEvent(event);
    setEditableEvent({
      ...event,
      banner,
      tickets: tickets.map((t: any) => ({ ...t })),
      speakers: speakers.map((s: any) => ({ ...s })),
    } as OrganizerEvent);
    setBannerPreview(banner);
    setNewTicket(null);
    setNewSpeaker(null);
    setTicketError(null);
    setSpeakerError(null);
    setEditable(false);
  };

  return (
    <EventPreviewLayout route={route} setRoute={setRoute}>
      <PulseLoader show={saving} />
      <main className="p-6 flex-1 space-y-6">
        {/* Navigation to Dashboard */}
        <div className="mb-4">
          <Link
            to="/organizer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Event Preview</h1>
          {editable ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditable(true)}>Edit</Button>
          )}
        </div>

        <EventInfo bannerSrc={bannerSrc} editable={editable} editableEvent={editableEvent} onChangeField={handleChangeField} />

        <TicketsList
          tickets={editableEvent.tickets ?? []}
          editable={editable}
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          onAddLocal={handleAddTicketLocal}
          onChangeTicket={handleChangeTicket}
          onRemoveLocal={handleRemoveLocal}
          onRemoteDelete={handleDeleteTicketRemote}
          error={ticketError}
        />

        <SpeakersList
          speakers={editableEvent.speakers ?? []}
          editable={editable}
          newSpeaker={newSpeaker}
          setNewSpeaker={setNewSpeaker}
          onAddLocal={handleAddSpeakerLocal}
          onChangeSpeaker={handleChangeSpeaker}
          onRemoveLocal={handleRemoveLocal}
          onRemoteDelete={handleDeleteSpeakerRemote}
          error={speakerError}
        />
      </main>
    </EventPreviewLayout>
  );
}
