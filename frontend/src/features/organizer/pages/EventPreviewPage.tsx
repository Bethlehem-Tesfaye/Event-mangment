import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrganizerEvent } from "../hoooks/useEvents";
import {
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useCreateSpeaker,
  useUpdateSpeaker,
  useDeleteSpeaker,
} from "../hoooks/useEvents";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

const ticketSchema = z.object({
  type: z.string().min(1, "Type is required"),
  price: z.number().nonnegative("Price must be ≥ 0"),
  totalQuantity: z.number().int().positive("Total quantity must be > 0"),
  maxPerUser: z.number().int().positive().optional(),
});

const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional(),
});

export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("dashboard");
  const [editable, setEditable] = useState(false);
  const { data: event, isLoading, error } = useOrganizerEvent(Number(eventId));

  const createTicket = useCreateTicket(Number(eventId));
  const updateTicket = useUpdateTicket(Number(eventId));
  const deleteTicketMutation = useDeleteTicket(Number(eventId));

  const createSpeaker = useCreateSpeaker(Number(eventId));
  const updateSpeaker = useUpdateSpeaker(Number(eventId));
  const deleteSpeakerMutation = useDeleteSpeaker(Number(eventId));

  const [editableEvent, setEditableEvent] = useState(event);
  const [newTicket, setNewTicket] = useState<{ type: string; price: string; totalQuantity: string; maxPerUser?: string } | null>(null);
  const [newSpeaker, setNewSpeaker] = useState<{ name: string; bio?: string; photoUrl?: string } | null>(null);

  const [ticketError, setTicketError] = useState<string | null>(null);
  const [speakerError, setSpeakerError] = useState<string | null>(null);

  useEffect(() => {
    setEditableEvent(event);
  }, [event]);

  const handleAddTicket = () => {
    if (!newTicket) return;
    const parsed = ticketSchema.safeParse({
      ...newTicket,
      price: Number(newTicket.price),
      totalQuantity: Number(newTicket.totalQuantity),
      maxPerUser: newTicket.maxPerUser ? Number(newTicket.maxPerUser) : undefined,
    });

    if (!parsed.success) {
      setTicketError(parsed.error.errors.map(e => e.message).join(", "));
      return;
    }
    setTicketError(null);

    createTicket.mutate(parsed.data, {
      onSuccess: () => setNewTicket(null),
    });
  };

  const handleAddSpeaker = () => {
    if (!newSpeaker) return;
    const parsed = speakerSchema.safeParse(newSpeaker);
    if (!parsed.success) {
      setSpeakerError(parsed.error.errors.map(e => e.message).join(", "));
      return;
    }
    setSpeakerError(null);
    createSpeaker.mutate(parsed.data, {
      onSuccess: () => setNewSpeaker(null),
    });
  };

  const handleCancelNewTicket = () => setNewTicket(null);
  const handleCancelNewSpeaker = () => setNewSpeaker(null);

  if (isLoading) return <p className="p-4">Loading event...</p>;
  if (error || !event) return <p className="p-4 text-red-500">Failed to load event.</p>;

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Event Preview</h1>
            {editable ? (
              <div className="flex gap-2">
                <Button onClick={() => setEditable(false)}>Save</Button>
                <Button variant="destructive" onClick={() => setEditable(false)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setEditable(true)}>Edit</Button>
            )}
          </div>

          {/* Tickets */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Tickets</CardTitle>
              {editable && !newTicket && <Button size="sm" onClick={() => setNewTicket({ type: "", price: "", totalQuantity: "", maxPerUser: "" })}>Add Ticket</Button>}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {editable && (
                <div className="flex gap-2 font-semibold border-b p-2">
                  <span className="w-1/4">Type</span>
                  <span className="w-1/4">Price</span>
                  <span className="w-1/4">Total Qty</span>
                  <span className="w-1/4">Max/User</span>
                  <span className="w-1/6"></span>
                </div>
              )}

              {event.tickets.map(ticket => (
                <div key={ticket.id} className="flex gap-2 items-center border p-2 rounded">
                  {editable ? (
                    <>
                      <Input className="w-1/4" value={ticket.type} onChange={e => updateTicket.mutate({ ticketId: ticket.id, data: { type: e.target.value } })} />
                      <Input className="w-1/4" value={ticket.price} type="number" onChange={e => updateTicket.mutate({ ticketId: ticket.id, data: { price: Number(e.target.value) } })} />
                      <Input className="w-1/4" value={ticket.totalQuantity} type="number" onChange={e => updateTicket.mutate({ ticketId: ticket.id, data: { totalQuantity: Number(e.target.value) } })} />
                      <Input className="w-1/4" value={ticket.maxPerUser || ""} type="number" onChange={e => updateTicket.mutate({ ticketId: ticket.id, data: { maxPerUser: Number(e.target.value) } })} />
                      <Button variant="destructive" size="sm" onClick={() => deleteTicketMutation.mutate(ticket.id)}>Delete</Button>
                    </>
                  ) : (
                    <>
                      <span className="w-1/4">{ticket.type}</span>
                      <span className="w-1/4">${ticket.price}</span>
                      <span className="w-1/4">Remaining: {ticket.remainingQuantity}</span>
                      <span className="w-1/4">{ticket.maxPerUser || "-"}</span>
                    </>
                  )}
                </div>
              ))}

              {/* New Ticket */}
              {newTicket && editable && (
                <div className="flex gap-2 items-center border p-2 rounded">
                  <Input className="w-1/4" placeholder="Type" value={newTicket.type} onChange={e => setNewTicket({ ...newTicket, type: e.target.value })} />
                  <Input className="w-1/4" placeholder="Price" type="number" value={newTicket.price} onChange={e => setNewTicket({ ...newTicket, price: e.target.value })} />
                  <Input className="w-1/4" placeholder="Total Quantity" type="number" value={newTicket.totalQuantity} onChange={e => setNewTicket({ ...newTicket, totalQuantity: e.target.value })} />
                  <Input className="w-1/4" placeholder="Max/User" type="number" value={newTicket.maxPerUser || ""} onChange={e => setNewTicket({ ...newTicket, maxPerUser: e.target.value })} />
                  <Button size="sm" onClick={handleAddTicket}>Add</Button>
                  <Button size="sm" variant="destructive" onClick={handleCancelNewTicket}>Cancel</Button>
                </div>
              )}
              {ticketError && <p className="text-red-500 text-sm">{ticketError}</p>}
            </CardContent>
          </Card>

          {/* Speakers */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Speakers</CardTitle>
              {editable && !newSpeaker && <Button size="sm" onClick={() => setNewSpeaker({ name: "" })}>Add Speaker</Button>}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {event.eventSpeakers.map(speaker => (
                <div key={speaker.id} className="flex gap-2 items-center border p-2 rounded">
                  {editable ? (
                    <>
                      <Input className="w-1/4" value={speaker.name} onChange={e => updateSpeaker.mutate({ speakerId: speaker.id, data: { name: e.target.value } })} />
                      <Input className="w-1/4" value={speaker.bio || ""} placeholder="Bio" onChange={e => updateSpeaker.mutate({ speakerId: speaker.id, data: { bio: e.target.value } })} />
                      <Input className="w-1/4" value={speaker.photoUrl || ""} placeholder="Photo URL" onChange={e => updateSpeaker.mutate({ speakerId: speaker.id, data: { photoUrl: e.target.value } })} />
                      <Button variant="destructive" size="sm" onClick={() => deleteSpeakerMutation.mutate(speaker.id)}>Delete</Button>
                    </>
                  ) : (
                    <>
                      {speaker.photoUrl && <img src={speaker.photoUrl} className="w-12 h-12 rounded-full" />}
                      <div className="flex flex-col">
                        <span className="font-semibold">{speaker.name}</span>
                        {speaker.bio && <span className="text-sm text-muted-foreground">{speaker.bio}</span>}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* New Speaker */}
              {newSpeaker && editable && (
                <div className="flex gap-2 items-center border p-2 rounded">
                  <Input className="w-1/4" placeholder="Name" value={newSpeaker.name} onChange={e => setNewSpeaker({ ...newSpeaker, name: e.target.value })} />
                  <Input className="w-1/4" placeholder="Bio" value={newSpeaker.bio || ""} onChange={e => setNewSpeaker({ ...newSpeaker, bio: e.target.value })} />
                  <Input className="w-1/4" placeholder="Photo URL" value={newSpeaker.photoUrl || ""} onChange={e => setNewSpeaker({ ...newSpeaker, photoUrl: e.target.value })} />
                  <Button size="sm" onClick={handleAddSpeaker}>Add</Button>
                  <Button size="sm" variant="destructive" onClick={handleCancelNewSpeaker}>Cancel</Button>
                </div>
              )}
              {speakerError && <p className="text-red-500 text-sm">{speakerError}</p>}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
