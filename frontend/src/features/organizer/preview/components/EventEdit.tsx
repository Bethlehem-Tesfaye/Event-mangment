import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrganizerEvent, Ticket, Speaker } from "../../types/organizer";
import { useOrganizerEvent } from "../../Dashboard/hooks/useEvents";
import {
  useCategories,
  useDeleteSpeaker,
  useDeleteTicket,
  useUpdateSpeaker,
  useUpdateTicket,
} from "@/features/organizer/createEvents/hooks/useCreateEvent";
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
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Check } from "lucide-react";

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

type Props = {
  id: string;
};

export default function EventEdit({ id }: Props) {
  const queryClient = useQueryClient();
  const { data: eventRemote, isLoading } = useOrganizerEvent(id);
  const { data: categories } = useCategories();

  const [editableEvent, setEditableEvent] = useState<OrganizerEvent | null>(
    null
  );
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [ticketsToDelete, setTicketsToDelete] = useState<number[]>([]);
  const [speakersToDelete, setSpeakersToDelete] = useState<number[]>([]);

  const [newTicket, setNewTicket] = useState<any>(null);
  const [, setTicketError] = useState<string | null>(null);

  const [newSpeaker, setNewSpeaker] = useState<any>(null);
  const [, setSpeakerError] = useState<string | null>(null);

  const originalCategoryIdsRef = useRef<number[]>([]);
  const originalTicketsRef = useRef<Ticket[] | null>(null);
  const originalSpeakersRef = useRef<Speaker[] | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const updateTicket: any = useUpdateTicket(id);
  const updateSpeaker: any = useUpdateSpeaker(id);
  const deleteTicket: any = useDeleteTicket(id);
  const deleteSpeaker: any = useDeleteSpeaker(id);

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
  const hasSpeakersValue = methods.watch("hasSpeakers");

  useEffect(() => {
    if (!eventRemote) return;

    const evt = (eventRemote as any).data ?? eventRemote;

    const tickets = evt.tickets ?? evt.eventTickets ?? evt.ticketsData ?? [];
    const speakers =
      evt.speakers ?? evt.eventSpeakers ?? evt.eventSpeakersData ?? [];

    originalTicketsRef.current = (tickets ?? []).map((t: any) => ({ ...t }));
    originalSpeakersRef.current = (speakers ?? []).map((s: any) => ({ ...s }));

    const eventCategoryIds = (
      evt.categories ??
      evt.eventCategories?.map((c: any) => c.categoryId ?? c.id ?? c) ??
      []
    )
      .map((c: any) => Number(c))
      .filter(Boolean);

    setEditableEvent({
      ...evt,
      locationType: evt.locationType ?? "",
      tickets,
      speakers,
      categories: eventCategoryIds,
    });

    methods.reset({
      title: evt.title ?? "",
      description: evt.description ?? "",
      location: evt.location ?? "",
      locationType: evt.locationType ?? "",
      startDatetime: evt.startDatetime ?? "",
      endDatetime: evt.endDatetime ?? "",
      duration: evt.duration ?? "",
      eventBannerPreview: evt.eventBannerPreview ?? evt.eventBannerUrl ?? "",
      eventBannerUrl: evt.eventBannerUrl ?? "",
      eventBannerFile: evt.eventBannerFile ?? null,
      hasSpeakers: (speakers ?? []).length > 0,
    });
  }, [eventRemote]);
  useEffect(() => {
    if (!editableEvent) return;

    const hasExistingSpeakers = (editableEvent.speakers ?? []).length > 0;
    const hasSpeakersChecked = methods.getValues("hasSpeakers");

    if (hasExistingSpeakers && !hasSpeakersChecked) {
      methods.setValue("hasSpeakers", true, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [editableEvent?.speakers?.length]);

  const makeTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const isRemoteId = (iid: any) =>
    typeof iid === "number" ||
    (typeof iid === "string" &&
      !iid.startsWith("temp") &&
      Number.isFinite(Number(iid)));

  const handleChangeField = (k: string, v: any) =>
    setEditableEvent((prev) => (prev ? { ...prev, [k]: v } : prev));

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
      setTicketError(parsed.error.issues.map((i) => i.message).join(", "));
      return;
    }
    setTicketError(null);
    const t: Ticket = { id: makeTempId(), ...parsed.data, isTemp: true } as any;
    setEditableEvent((prev) =>
      prev ? { ...prev, tickets: [...(prev.tickets ?? []), t] } : null
    );
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
      setSpeakerError(parsed.error.issues.map((i) => i.message).join(", "));
      return;
    }
    const s: Speaker = {
      id: makeTempId(),
      ...parsed.data,
      isTemp: true,
      photoFile: newSpeaker.photoFile,
      photoPreview: newSpeaker.photoPreview,
    } as any;
    setEditableEvent((prev) =>
      prev ? { ...prev, speakers: [...(prev.speakers ?? []), s] } : null
    );
    setNewSpeaker(null);
  };

  const saveEventInfo = async () => {
    if (!editableEvent) return;
    setSavingSection("info");
    try {
      const fv = methods.getValues() as any;
      const payload: any = {
        title: fv.title ?? editableEvent.title,
        description: fv.description ?? editableEvent.description,
        location: fv.location ?? editableEvent.location,
        locationType:
          fv.locationType !== undefined && fv.locationType !== ""
            ? fv.locationType
            : editableEvent.locationType,
        startDatetime: fv.startDatetime
          ? new Date(fv.startDatetime).toISOString()
          : undefined,
        endDatetime: fv.endDatetime
          ? new Date(fv.endDatetime).toISOString()
          : undefined,
        duration:
          fv.duration !== undefined && fv.duration !== ""
            ? Number(fv.duration)
            : undefined,
      };

      const bannerFile = fv.eventBannerFile ?? editableEvent.eventBannerFile;
      if (bannerFile) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined) form.append(k, String(v));
        });
        form.append("eventBanner", bannerFile);
        await api.put(`/organizer/events/${id}`, form);
      } else {
        await api.put(`/organizer/events/${id}`, payload);
      }
      toast.success("Event info saved");
      setEditableEvent((prev) =>
        prev
          ? {
              ...prev,
              title: payload.title ?? prev.title,
              description: payload.description ?? prev.description,
              locationType: payload.locationType ?? prev.locationType,
              location: payload.location ?? prev.location,
              startDatetime: payload.startDatetime ?? prev.startDatetime,
              endDatetime: payload.endDatetime ?? prev.endDatetime,
              duration: payload.duration ?? prev.duration,
            }
          : prev
      );

      queryClient.invalidateQueries({ queryKey: ["organizer-event", id] });
    } catch (e) {
      console.error(e);
      toast.error("Failed saving event info");
    } finally {
      setSavingSection(null);
    }
  };

  const saveTickets = async () => {
    if (!editableEvent) return;
    setSavingSection("tickets");
    try {
      for (const t of editableEvent.tickets ?? []) {
        const isTemp = (t as any).isTemp;
        const payload: any = {
          type: t.type,
          price: Number(t.price),
          totalQuantity: Number(t.totalQuantity),
          maxPerUser:
            t.maxPerUser !== undefined ? Number(t.maxPerUser) : undefined,
        };

        if (isTemp) {
          const res = await api.post(
            `/organizer/events/${id}/tickets`,
            payload
          );
          (t as any).id = String(
            res.data?.data?.id ?? res.data?.id ?? res.data?.ticket?.id
          );
          (t as any).isTemp = false;
          continue;
        }

        const orig = originalTicketsRef.current?.find(
          (ot) => String(ot.id) === String(t.id)
        );
        if (orig) {
          const unchanged =
            orig.type === t.type &&
            Number(orig.price) === Number(t.price) &&
            Number(orig.totalQuantity) === Number(t.totalQuantity) &&
            (orig.maxPerUser ?? null) === (t.maxPerUser ?? null);
          if (unchanged) continue;
        }

        await updateTicket.mutateAsync(
          { ticketId: Number(t.id), data: payload },
          { onSuccess: () => {} }
        );
      }

      for (const tid of ticketsToDelete) {
        await deleteTicket.mutateAsync(tid);
      }
      setTicketsToDelete([]);
      queryClient.invalidateQueries({ queryKey: ["organizer-event", id] });
      originalTicketsRef.current = (editableEvent.tickets ?? []).map((t) => ({
        ...t,
      }));
      toast.success("Tickets saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed saving tickets");
    } finally {
      setSavingSection(null);
    }
  };

  const saveSpeakers = async () => {
    if (!editableEvent) return;
    setSavingSection("speakers");
    try {
      for (const s of editableEvent.speakers ?? []) {
        const isTemp = (s as any).isTemp;
        const hasFile = (s as any).photoFile;
        if (isTemp) {
          const form = new FormData();
          form.append("name", s.name);
          if (s.bio) form.append("bio", s.bio);
          if (hasFile) form.append("photo", (s as any).photoFile);
          const res = await api.post(`/organizer/events/${id}/speakers`, form);
          (s as any).id = String(
            res.data?.data?.id ?? res.data?.id ?? res.data?.speaker?.id
          );
          (s as any).isTemp = false;
        } else {
          const orig = originalSpeakersRef.current?.find(
            (os) => String(os.id) === String(s.id)
          );
          if (orig) {
            const unchanged =
              orig.name === s.name && (orig.bio ?? null) === (s.bio ?? null);
            if (unchanged && !hasFile) continue;
          }
          const payload: any = { name: s.name, bio: s.bio };
          if (hasFile) {
            const form = new FormData();
            Object.entries(payload).forEach(([k, v]) =>
              form.append(k, String(v))
            );
            await updateSpeaker.mutateAsync(
              { speakerId: Number(s.id), data: form } as any,
              // @ts-ignore
              { onSuccess: () => {} }
            );
          } else {
            await updateSpeaker.mutateAsync(
              { speakerId: Number(s.id), data: payload } as any,
              // @ts-ignore
              { onSuccess: () => {} }
            );
          }
        }
      }

      for (const sid of speakersToDelete) {
        await deleteSpeaker.mutateAsync(sid);
      }
      setSpeakersToDelete([]);
      toast.success("Speakers saved");
      queryClient.invalidateQueries({ queryKey: ["organizer-event", id] });
      originalSpeakersRef.current = (editableEvent.speakers ?? []).map((s) => ({
        ...s,
      }));
    } catch (e) {
      console.error(e);
      toast.error("Failed saving speakers");
    } finally {
      setSavingSection(null);
    }
  };

  const saveCategories = async () => {
    if (!editableEvent) return;
    setSavingSection("categories");
    try {
      const prev = originalCategoryIdsRef.current;
      const next = (editableEvent.categories ?? []).map(Number).filter(Boolean);

      const toAdd = next.filter((c: any) => !prev.includes(c));
      const toRemove = prev.filter((c) => !next.includes(c));

      for (const cid of toAdd) {
        await api.post(`/organizer/events/${id}/categories`, {
          categoryId: cid,
        });
      }
      for (const cid of toRemove) {
        await api.delete(`/organizer/events/${id}/categories/${cid}`);
      }
      originalCategoryIdsRef.current = next;
      toast.success("Categories saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed saving categories");
    } finally {
      setSavingSection(null);
    }
  };

  if (!editableEvent)
    return (
      <div className="p-6">
        {isLoading ? "Loading..." : "Preparing editor..."}
      </div>
    );

  return (
    <FormProvider {...methods}>
      <div className="max-w-6xl mx-auto">
        <PulseLoader show={savingSection !== null} />

        <CardContent>
          <EventInfo
            editableEvent={editableEvent}
            editable
            onChangeField={handleChangeField}
            form={methods}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={saveEventInfo}>
              <Check /> Save Event Info
            </Button>
          </div>
        </CardContent>

        <CardContent className="mt-4">
          <TicketsList
            tickets={editableEvent.tickets ?? []}
            editable
            newTicket={newTicket}
            setNewTicket={setNewTicket}
            onAddLocal={handleAddTicketLocal}
            onChangeTicket={(id, field, value) =>
              setEditableEvent((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  tickets: prev.tickets?.map((t) =>
                    t.id === id ? { ...t, [field]: value } : t
                  ),
                };
              })
            }
            onRemoveLocal={(_type, id) => {
              setEditableEvent((prev) =>
                prev
                  ? {
                      ...prev,
                      tickets: (prev.tickets ?? []).filter((t) => t.id !== id),
                    }
                  : prev
              );
              if (isRemoteId(id)) {
                setTicketsToDelete((prev) =>
                  Array.from(new Set([...prev, Number(id)]))
                );
              }
            }}
            onRemoteDelete={(id: number) => {
              if (isRemoteId(id)) {
                setTicketsToDelete((prev) =>
                  Array.from(new Set([...prev, Number(id)]))
                );
              }
              setEditableEvent((prev) =>
                prev
                  ? {
                      ...prev,
                      tickets: (prev.tickets ?? []).filter((t) => t.id !== id),
                    }
                  : prev
              );
            }}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={saveTickets}>
              <Check /> Save Tickets
            </Button>
          </div>
        </CardContent>

        <CardContent className="mt-4">
          <Controller
            control={methods.control}
            name="hasSpeakers"
            defaultValue={(editableEvent.speakers ?? []).length > 0}
            render={({ field }) => (
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(field.value)}
                  onChange={(e) => {
                    if (
                      !e.target.checked &&
                      (editableEvent.speakers ?? []).length > 0
                    ) {
                      setShowDeleteAllConfirm(true);
                      return;
                    }
                    field.onChange(e.target.checked);
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm">I have speakers for this event</span>
              </label>
            )}
          />
          {showDeleteAllConfirm && (
            <CardContent className="mt-2">
              <div>Unchecking will delete all speakers for this event.</div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={async () => {
                    const remoteIds = (editableEvent.speakers ?? [])
                      .filter((s) => isRemoteId(s.id))
                      .map((s) => Number(s.id));
                    setSavingSection("speakers");
                    try {
                      await Promise.all(
                        remoteIds.map((sid) => deleteSpeaker.mutateAsync(sid))
                      );
                      setEditableEvent((prev) =>
                        prev ? { ...prev, speakers: [] } : prev
                      );
                      setSpeakersToDelete([]);
                      methods.setValue("hasSpeakers", false, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      originalSpeakersRef.current = [];
                      queryClient.invalidateQueries({
                        queryKey: ["organizer-event", id],
                      });
                      toast.success("All speakers deleted");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed deleting speakers");
                    } finally {
                      setShowDeleteAllConfirm(false);
                      setSavingSection(null);
                    }
                  }}
                >
                  Delete all speakers
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteAllConfirm(false);
                    methods.setValue("hasSpeakers", true, {
                      shouldDirty: false,
                      shouldTouch: false,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </CardContent>

        {(hasSpeakersValue || (editableEvent.speakers ?? []).length > 0) && (
          <CardContent className="mt-4">
            <SpeakersList
              speakers={editableEvent.speakers ?? []}
              editable
              newSpeaker={newSpeaker}
              setNewSpeaker={setNewSpeaker}
              onAddLocal={handleAddSpeakerLocal}
              onChangeSpeaker={(id, field, value) =>
                setEditableEvent((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    speakers: prev.speakers?.map((s) =>
                      s.id === id ? { ...s, [field]: value } : s
                    ),
                  };
                })
              }
              onRemoveLocal={(_type, id) => {
                setEditableEvent((prev) =>
                  prev
                    ? {
                        ...prev,
                        speakers: (prev.speakers ?? []).filter(
                          (s) => s.id !== id
                        ),
                      }
                    : prev
                );
                if (isRemoteId(id)) {
                  setSpeakersToDelete((prev) =>
                    Array.from(new Set([...prev, Number(id)]))
                  );
                }
              }}
              onRemoteDelete={(id: number) => {
                if (isRemoteId(id)) {
                  setSpeakersToDelete((prev) =>
                    Array.from(new Set([...prev, Number(id)]))
                  );
                }
                setEditableEvent((prev) =>
                  prev
                    ? {
                        ...prev,
                        speakers: (prev.speakers ?? []).filter(
                          (s) => s.id !== id
                        ),
                      }
                    : prev
                );
              }}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={saveSpeakers}>
                <Check /> Save Speakers
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent
          className="mt-4 bg-white  dark:bg-[#0b0b0b]
        "
        >
          <div className="mb-2 font-medium">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                selected={(editableEvent.categories ?? [])
                  .map(Number)
                  .includes(cat.id)}
                onSelect={() =>
                  setEditableEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          categories: [
                            ...new Set([...(prev.categories ?? []), cat.id]),
                          ],
                        }
                      : prev
                  )
                }
                onRemove={() =>
                  setEditableEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          categories: (prev.categories ?? []).filter(
                            (c: number) => c !== cat.id
                          ),
                        }
                      : prev
                  )
                }
              />
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <Button onClick={saveCategories}>
              <Check /> Save Categories
            </Button>
          </div>
        </CardContent>
      </div>
    </FormProvider>
  );
}
