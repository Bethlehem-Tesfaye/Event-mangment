import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrganizerEvent, Ticket, Speaker } from "../../types/organizer";
import { useCategories } from "@/features/organizer/createEvents/hooks/useCreateEvent";
import EventInfo from "../components/EventInfo";
import TicketsList from "../components/Tickets/TicketsList";
import SpeakersList from "../components/Speakers/SpeakersList";
import { CategoryBadge } from "@/features/organizer/createEvents/components/CategoryBadge";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/schemas/event";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function EventCreate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  const [editableEvent, setEditableEvent] = useState<OrganizerEvent>({
    id: undefined as any,
    title: "",
    status: "draft",
    description: "",
    location: "",
    tickets: [],
    speakers: [],
    categories: [],
  });

  const [saving, setSaving] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState<any>(null);
  const [newSpeaker, setNewSpeaker] = useState<any>(null);
  const [, setSpeakerError] = useState<string | null>(null);

  const makeTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleChangeField = (k: string, v: any) =>
    setEditableEvent((prev) => ({ ...prev, [k]: v }));

  const handleAddTicketLocal = () => {
    if (!newTicket) return;
    const parsed = ticketSchema.safeParse({
      type: newTicket.type,
      price: Number(newTicket.price),
      totalQuantity: Number(newTicket.totalQuantity),
      maxPerUser: newTicket.maxPerUser
        ? Number(newTicket.maxPerUser)
        : undefined,
    });
    if (!parsed.success) {
      setTicketsError(parsed.error.issues.map((i) => i.message).join(", "));
      return;
    }
    setTicketsError(null);
    const t: Ticket = { id: makeTempId(), ...parsed.data, isTemp: true } as any;
    setEditableEvent((prev) => ({
      ...prev,
      tickets: [...(prev.tickets ?? []), t],
    }));
    setNewTicket(null);
  };

  const handleAddSpeakerLocal = () => {
    if (!newSpeaker) return;

    const parsed = speakerSchema.safeParse({
      name: newSpeaker.name,
      bio: newSpeaker.bio,
      photoUrl: newSpeaker.photoUrl ?? undefined,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      setSpeakerError(msg);
      return;
    }

    setSpeakerError(null);

    const s: Speaker = {
      id: makeTempId(),
      name: parsed.data.name,
      bio: parsed.data.bio,
      photoUrl: parsed.data.photoUrl,
      isTemp: true,
      photoFile: newSpeaker.photoFile,
      photoPreview: newSpeaker.photoPreview,
    } as any;

    setEditableEvent((prev) => ({
      ...prev,
      speakers: [...(prev.speakers ?? []), s],
    }));
    setNewSpeaker(null);
  };

  const handleRemoveLocal = (
    type: "ticket" | "speaker",
    idToRemove: string | number
  ) => {
    if (type === "ticket") {
      setEditableEvent((prev) => ({
        ...prev,
        tickets: (prev.tickets ?? []).filter((t) => t.id !== idToRemove),
      }));
      return;
    }
    setEditableEvent((prev) => ({
      ...prev,
      speakers: (prev.speakers ?? []).filter((s) => s.id !== idToRemove),
    }));
  };

  const methods = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      locationType: "",
      startDatetime: "",
      endDatetime: "",
      duration: "",
      eventBannerPreview: "",
      eventBannerUrl: "",
      eventBannerFile: null as File | null,
      hasSpeakers: true,
    },
  } as any);

  useEffect(() => {
    if (!editableEvent) return;
    methods.reset({
      title: editableEvent.title ?? "",
      description: editableEvent.description ?? "",
      location: editableEvent.location ?? "",
      locationType: editableEvent.locationType ?? "",
      startDatetime: editableEvent.startDatetime ?? "",
      endDatetime: editableEvent.endDatetime ?? "",
      duration: editableEvent.duration ? String(editableEvent.duration) : "",
      eventBannerPreview:
        editableEvent.eventBannerPreview ?? editableEvent.eventBannerUrl ?? "",
      eventBannerUrl: editableEvent.eventBannerUrl ?? "",
      eventBannerFile: editableEvent.eventBannerFile ?? null,
      hasSpeakers: (editableEvent.speakers?.length ?? 0) > 0,
    });
  }, []);

  const handleSave = async () => {
    if (!editableEvent) return;

    // validate tickets
    const tickets = editableEvent.tickets ?? [];
    if (tickets.length > 0) {
      const ticketErrors: string[] = [];
      for (const t of tickets) {
        const parsed = ticketSchema.safeParse({
          type: t.type ?? "",
          price: Number(t.price ?? ""),
          totalQuantity: Number(t.totalQuantity ?? ""),
          maxPerUser:
            t.maxPerUser !== undefined ? Number(t.maxPerUser) : undefined,
        });
        if (!parsed.success) {
          ticketErrors.push(
            `Ticket "${t.type || t.id}": ${parsed.error.issues
              .map((i) => i.message)
              .join(", ")}`
          );
        }
      }
      if (ticketErrors.length > 0) {
        setTicketsError(ticketErrors.join(" • "));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else {
        setTicketsError(null);
      }
    }

    setSaving(true);

    try {
      const fv = methods.getValues() as any;
      const hasSpeakers =
        fv.hasSpeakers ?? (editableEvent.speakers ?? []).length > 0;
      const speakersToProcess = hasSpeakers ? editableEvent.speakers ?? [] : [];

      // prepare event payload
      const eventPayload: any = {
        title: fv.title ?? editableEvent.title,
        description: fv.description ?? editableEvent.description,
        location: fv.location ?? editableEvent.location,
        locationType: fv.locationType ?? editableEvent.locationType,
        startDatetime: fv.startDatetime
          ? new Date(fv.startDatetime).toISOString()
          : undefined,
        endDatetime: fv.endDatetime
          ? new Date(fv.endDatetime).toISOString()
          : undefined,
        duration: fv.duration ? Number(fv.duration) : undefined,
      };

      const bannerFile = fv.eventBannerFile ?? editableEvent.eventBannerFile;
      const hasBannerFile = Boolean(bannerFile);

      let created;
      if (hasBannerFile) {
        const form = new FormData();
        Object.entries(eventPayload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        form.append("eventBanner", bannerFile as File);
        created = await api.post("/organizer/events", form);
      } else {
        created = await api.post("/organizer/events", eventPayload);
      }

      const createdId = String(
        created.data?.data?.id ?? created.data?.id ?? created.data?.event?.id
      );

      // add categories
      for (const cid of (editableEvent.categories ?? [])
        .map(Number)
        .filter(Boolean)) {
        try {
          await api.post(`/organizer/events/${createdId}/categories`, {
            categoryId: cid,
          });
        } catch (e) {
          console.error("Failed adding category", cid, e);
        }
      }

      // create speakers
      for (const s of speakersToProcess) {
        try {
          const form = new FormData();
          form.append("name", s.name);
          if (s.bio) form.append("bio", s.bio);
          if ((s as any).photoFile) form.append("photo", (s as any).photoFile);
          const res = await api.post(
            `/organizer/events/${createdId}/speakers`,
            form
          );
          // replace temp ID with server ID
          const newId = res.data?.data?.id ?? res.data?.id ?? "";
          setEditableEvent((prev) => ({
            ...prev,
            speakers: (prev.speakers ?? []).map((sp) =>
              sp.id === s.id ? { ...sp, id: newId, isTemp: false } : sp
            ),
          }));
        } catch (e) {
          console.error("Failed creating speaker", s, e);
        }
      }

      // create tickets
      for (const t of tickets) {
        try {
          const res = await api.post(`/organizer/events/${createdId}/tickets`, {
            type: t.type,
            price: Number(t.price),
            totalQuantity: Number(t.totalQuantity),
            maxPerUser: t.maxPerUser,
          });
          const newId = res.data?.data?.id ?? res.data?.id ?? "";
          setEditableEvent((prev) => ({
            ...prev,
            tickets: (prev.tickets ?? []).map((tk) =>
              tk.id === t.id ? { ...tk, id: newId, isTemp: false } : tk
            ),
          }));
        } catch (e) {
          console.error("Failed creating ticket", t, e);
        }
      }

      toast.success("Event created");
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      navigate("/organizer/events");
    } catch (err) {
      console.error("Create event error", err);
      toast.error("Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-6xl mx-auto">
        <PulseLoader show={saving} />

        <CardContent>
          <EventInfo
            editable
            editableEvent={editableEvent}
            onChangeField={handleChangeField}
            form={methods}
          />
        </CardContent>

        <div className="flex flex-col gap-4 mb-4 mt-4">
          <CardContent>
            <TicketsList
              tickets={editableEvent.tickets ?? []}
              editable
              newTicket={newTicket}
              setNewTicket={setNewTicket}
              onAddLocal={handleAddTicketLocal}
              onChangeTicket={(id, field, value) => {
                setEditableEvent((prev) => ({
                  ...prev,
                  tickets: (prev.tickets ?? []).map((t) =>
                    t.id === id ? { ...t, [field]: value } : t
                  ),
                }));
              }}
              onRemoveLocal={(_type, id) => handleRemoveLocal("ticket", id)}
              onRemoteDelete={(id: number) => handleRemoveLocal("ticket", id)}
              error={ticketsError}
            />
          </CardContent>

          {(methods.watch("hasSpeakers") ||
            (editableEvent.speakers?.length ?? 0) > 0) && (
            <CardContent>
              <SpeakersList
                speakers={editableEvent.speakers ?? []}
                editable
                newSpeaker={newSpeaker}
                setNewSpeaker={setNewSpeaker}
                onAddLocal={handleAddSpeakerLocal}
                onChangeSpeaker={(id, field, value) => {
                  setEditableEvent((prev) => ({
                    ...prev,
                    speakers: (prev.speakers ?? []).map((s) =>
                      s.id === id ? { ...s, [field]: value } : s
                    ),
                  }));
                }}
                onRemoveLocal={(_type, id) => handleRemoveLocal("speaker", id)}
                onRemoteDelete={(id: number) =>
                  handleRemoveLocal("speaker", id)
                }
                onFileChange={(idOrNew, file) => {
                  if (typeof idOrNew === "number") {
                    setEditableEvent((prev) => ({
                      ...prev,
                      speakers: (prev.speakers ?? []).map((s) =>
                        s.id === idOrNew ? { ...s, photoFile: file } : s
                      ),
                    }));
                  } else {
                    setNewSpeaker((prev: any) =>
                      prev ? { ...prev, photoFile: file } : null
                    );
                  }
                }}
              />
            </CardContent>
          )}
        </div>

        <CardContent>
          <div className="mb-2 font-medium">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat: any) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                selected={(editableEvent.categories ?? [])
                  .map(Number)
                  .includes(Number(cat.id))}
                onSelect={() =>
                  setEditableEvent((prev) => ({
                    ...prev,
                    categories: [
                      ...new Set([...(prev.categories ?? []), cat.id]),
                    ],
                  }))
                }
                onRemove={() =>
                  setEditableEvent((prev) => ({
                    ...prev,
                    categories: (prev.categories ?? []).filter(
                      (id: number | string) => id !== cat.id
                    ),
                  }))
                }
              />
            ))}
          </div>
        </CardContent>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => methods.handleSubmit(handleSave)()}
            disabled={saving}
          >
            <Plus /> Create Event
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
