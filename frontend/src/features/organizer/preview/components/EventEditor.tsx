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
import { Card, CardContent } from "@/components/ui/card";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { Check, Plus } from "lucide-react";
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

type Props = {
  id?: string | null;
  onCreated?: (id: string) => void;
};

export default function EventEditor({ id, onCreated }: Props) {
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const { data: eventRemote, isLoading } = useOrganizerEvent(id ?? "");
  const { data: categories } = useCategories();
  const [editableEvent, setEditableEvent] = useState<OrganizerEvent | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [ticketsToDelete, setTicketsToDelete] = useState<number[]>([]);
  const [speakersToDelete, setSpeakersToDelete] = useState<number[]>([]);

  const originalCategoryIdsRef = useRef<number[]>([]);

  const eventIdStr = id ?? undefined;

  const updateTicket: any = eventIdStr ? useUpdateTicket(eventIdStr) : null;
  const updateSpeaker: any = eventIdStr ? useUpdateSpeaker(eventIdStr) : null;
  const deleteTicket: any = eventIdStr ? useDeleteTicket(eventIdStr) : null;
  const deleteSpeaker: any = eventIdStr ? useDeleteSpeaker(eventIdStr) : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventRemote) {
      setEditableEvent(null);
      return;
    }

    const evt =
      (eventRemote as any).data ?? (eventRemote as any).event ?? eventRemote;

    const tickets = evt.tickets ?? evt.eventTickets ?? [];
    const speakers = evt.eventSpeakers ?? evt.speakers ?? [];

    const eventCategoryIds = (evt.eventCategories ?? evt.categories ?? []).map(
      (c: any) => {
        if (typeof c === "number") return c;
        if (c == null) return c;
        if (c?.category && typeof c.category.id !== "undefined")
          return Number(c.category.id);
        if (typeof c.categoryId !== "undefined") return Number(c.categoryId);
        if (typeof c.id !== "undefined") return Number(c.id);
        return Number(c);
      }
    );

    originalCategoryIdsRef.current = eventCategoryIds.filter(
      Boolean
    ) as number[];

    const locationType =
      evt.locationType === "inPerson" ? "in-person" : evt.locationType ?? "";

    setEditableEvent({
      ...evt,
      locationType,
      tickets: tickets.map((t: any) => ({ ...t })),
      speakers: speakers.map((s: any) => ({ ...s })),
      categories: eventCategoryIds,
    } as OrganizerEvent);
  }, [eventRemote]);

  useEffect(() => {
    if (!isEdit && editableEvent === null) {
      setEditableEvent({
        id: undefined as any,
        title: "",
        status: "draft",
        description: "",
        location: "",
        tickets: [],
        speakers: [],
        categories: [],
      } as OrganizerEvent);
    }
  }, [isEdit, editableEvent]);

  const eventInfoExtraProps = !isEdit
    ? {
        labels: {
          title: "Event Title",
          description: "Description",
          location: "Location",
          startDatetime: "Start Date",
          endDatetime: "End Date",
        },
        fieldTypes: {
          title: "text",
          description: "textarea",
          location: "text",
          startDatetime: "datetime-local",
          endDatetime: "datetime-local",
        },
      }
    : {};

  const makeTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const extractIdFromResponse = (res: any) =>
    String(
      res?.data?.data?.id ??
        res?.data?.id ??
        res?.data?.ticket?.id ??
        res?.data?.speaker?.id ??
        res?.data?.event?.id ??
        ""
    );

  const handleChangeField = (k: string, v: any) =>
    setEditableEvent((prev) => (prev ? { ...prev, [k]: v } : prev));

  const isRemoteId = (iid: any) =>
    typeof iid === "number" ||
    (typeof iid === "string" &&
      !String(iid).startsWith("temp") &&
      Number.isFinite(Number(iid)));

  const handleChangeTicket = (
    idArg: number | string,
    field: string,
    value: any
  ) => {
    setEditableEvent((prev) =>
      prev
        ? {
            ...prev,
            tickets: (prev.tickets ?? []).map((t) =>
              t.id === idArg ? { ...t, [field]: value } : t
            ),
          }
        : prev
    );

    if (isEdit && isRemoteId(idArg) && updateTicket) {
      const ticketId = Number(idArg);
      const payload: any = {};
      if (
        field === "price" ||
        field === "totalQuantity" ||
        field === "maxPerUser"
      ) {
        payload[field] = value === "" ? null : Number(value);
      } else {
        payload[field] = value;
      }
      updateTicket.mutate({ ticketId, data: payload });
    }
  };

  const handleChangeSpeaker = (
    idArg: number | string,
    field: string,
    value: any
  ) => {
    setEditableEvent((prev) =>
      prev
        ? {
            ...prev,
            speakers: (prev.speakers ?? []).map((s) =>
              s.id === idArg ? { ...s, [field]: value } : s
            ),
          }
        : prev
    );

    if (isEdit && isRemoteId(idArg) && updateSpeaker) {
      const speakerId = Number(idArg);
      if (field === "photoFile") {
        const form = new FormData();
        form.append("photo", value);
        updateSpeaker.mutate({ speakerId, data: form } as any);
      } else {
        const payload: any = { [field]: value };
        updateSpeaker.mutate({ speakerId, data: payload });
      }
    }
  };

  const handleRemoveLocal = (
    type: "ticket" | "speaker",
    idToRemove: string | number
  ) => {
    if (type === "ticket") {
      if (isEdit && isRemoteId(idToRemove)) {
        const idNum = Number(idToRemove);
        setTicketsToDelete((prev) => Array.from(new Set([...prev, idNum])));
        setEditableEvent((prev) =>
          prev
            ? {
                ...prev,
                tickets: (prev.tickets ?? []).filter(
                  (t) => t.id !== idToRemove
                ),
              }
            : prev
        );
        return;
      }
      setEditableEvent((prev) =>
        prev
          ? {
              ...prev,
              tickets: (prev.tickets ?? []).filter((t) => t.id !== idToRemove),
            }
          : prev
      );
      return;
    }

    if (isEdit && isRemoteId(idToRemove)) {
      const idNum = Number(idToRemove);
      setSpeakersToDelete((prev) => Array.from(new Set([...prev, idNum])));
      setEditableEvent((prev) =>
        prev
          ? {
              ...prev,
              speakers: (prev.speakers ?? []).filter(
                (s) => s.id !== idToRemove
              ),
            }
          : prev
      );
      return;
    }

    setEditableEvent((prev) =>
      prev
        ? {
            ...prev,
            speakers: (prev.speakers ?? []).filter((s) => s.id !== idToRemove),
          }
        : prev
    );
  };

  const [newTicket, setNewTicket] = useState<any>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
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
      prev
        ? { ...prev, tickets: [...(prev.tickets ?? []), t] }
        : ({
            id: undefined as any,
            title: "",
            status: "draft",
            description: "",
            location: "",
            tickets: [t],
            speakers: [],
            categories: [],
          } as OrganizerEvent)
    );
    setNewTicket(null);
  };

  const [newSpeaker, setNewSpeaker] = useState<any>(null);
  const [, setSpeakerError] = useState<string | null>(null);

  const handleAddSpeakerLocal = () => {
    // DEBUG: guard
    if (!newSpeaker) {
      console.debug("[dbg] handleAddSpeakerLocal called with no newSpeaker");
      return;
    }

    console.groupCollapsed("[dbg] handleAddSpeakerLocal start");
    console.debug("newSpeaker:", newSpeaker);
    console.trace("addSpeaker call stack");

    const parsed = speakerSchema.safeParse({
      name: newSpeaker.name,
      bio: newSpeaker.bio,
      photoUrl: newSpeaker.photoUrl ?? undefined,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      console.debug("[dbg] speaker validation failed:", msg);
      setSpeakerError(msg);
      console.groupEnd();
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

    // append speaker using functional update to avoid stale-state races
    setEditableEvent((prev) => {
      const current = prev?.speakers ?? [];
      const next = [...current, s];
      console.debug("[dbg] speakers current length:", current.length);
      console.debug("[dbg] speakers next length:", next.length);
      console.debug(
        "[dbg] speakers current ids:",
        current.map((x: any) => x.id)
      );
      console.debug(
        "[dbg] speakers next ids:",
        next.map((x: any) => x.id)
      );
      return prev
        ? { ...prev, speakers: next }
        : ({
            id: undefined as any,
            title: "",
            status: "draft",
            description: "",
            location: "",
            tickets: [],
            speakers: [s],
            categories: [],
          } as OrganizerEvent);
    });

    setNewSpeaker(null);
    console.groupEnd();
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
  const lastResetIdRef = useRef<string | number | null>(null);
  useEffect(() => {
    if (!editableEvent) return;
    const idKey =
      typeof editableEvent.id !== "undefined" && editableEvent.id !== null
        ? String(editableEvent.id)
        : "__new__";
    if (lastResetIdRef.current === idKey) return;

    methods.reset({
      title: editableEvent.title ?? "",
      description: editableEvent.description ?? "",
      location: editableEvent.location ?? "",
      locationType: editableEvent.locationType ?? "",
      startDatetime: editableEvent.startDatetime ?? "",
      endDatetime: editableEvent.endDatetime ?? "",
      duration:
        editableEvent.duration !== undefined && editableEvent.duration !== null
          ? String(editableEvent.duration)
          : "",
      eventBannerPreview:
        editableEvent.eventBannerPreview ?? editableEvent.eventBannerUrl ?? "",
      eventBannerUrl: editableEvent.eventBannerUrl ?? "",
      eventBannerFile: editableEvent.eventBannerFile ?? null,
      hasSpeakers: (editableEvent.speakers ?? []).length > 0,
    } as any);

    lastResetIdRef.current = idKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableEvent?.id, editableEvent]);

  const handleSave = async () => {
    if (!editableEvent) return;

    const tickets = editableEvent.tickets ?? [];
    if (tickets.length > 0) {
      const ticketErrors: string[] = [];

      for (const t of tickets) {
        const parsed = ticketSchema.safeParse({
          type: (t as any).type ?? "",
          price: Number((t as any).price ?? ""),
          totalQuantity: Number((t as any).totalQuantity ?? ""),
          maxPerUser:
            (t as any).maxPerUser === "" ||
            (t as any).maxPerUser === null ||
            (t as any).maxPerUser === undefined
              ? undefined
              : Number((t as any).maxPerUser),
        });

        if (!parsed.success) {
          const idLabel = (t as any).type
            ? `${(t as any).type}`
            : `${(t as any).id}`;
          ticketErrors.push(
            `Ticket "${idLabel}": ${parsed.error.issues
              .map((i) => i.message)
              .join(", ")}`
          );
        }
      }

      if (ticketErrors.length > 0) {
        setTicketError(ticketErrors.join(" • "));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else {
        setTicketError(null);
      }
    }

    setSaving(true);

    try {
      const fv = methods.getValues() as any;
      const hasSpeakers =
        fv.hasSpeakers ?? (editableEvent.speakers ?? []).length > 0;
      const speakersToProcess = hasSpeakers ? editableEvent.speakers ?? [] : [];

      let remoteSpeakerIdsToDelete: number[] = [];
      if (!hasSpeakers && isEdit && editableEvent.speakers?.length) {
        remoteSpeakerIdsToDelete = (editableEvent.speakers ?? [])
          .filter((s: any) => isRemoteId(s.id))
          .map((s: any) => Number(s.id));
        if (remoteSpeakerIdsToDelete.length > 0) {
          setSpeakersToDelete((prev) =>
            Array.from(new Set([...prev, ...remoteSpeakerIdsToDelete]))
          );
        }
      }

      // Prepare payload using form values first, falling back to editableEvent
      const eventPayload: any = {
        title: fv.title ?? editableEvent.title,
        description: fv.description ?? editableEvent.description,
        location: fv.location ?? editableEvent.location,
        locationType: fv.locationType ?? editableEvent.locationType,
        startDatetime: fv.startDatetime
          ? new Date(fv.startDatetime).toISOString()
          : editableEvent.startDatetime
          ? new Date(editableEvent.startDatetime).toISOString()
          : undefined,
        endDatetime: fv.endDatetime
          ? new Date(fv.endDatetime).toISOString()
          : editableEvent.endDatetime
          ? new Date(editableEvent.endDatetime).toISOString()
          : undefined,
        duration:
          fv.duration !== undefined && fv.duration !== ""
            ? Number(fv.duration)
            : editableEvent.duration !== undefined
            ? Number(editableEvent.duration)
            : undefined,
      };

      const bannerFile = fv.eventBannerFile ?? editableEvent.eventBannerFile;
      const hasBannerFile = Boolean(bannerFile);

      if (!isEdit) {
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

        // replace temp speaker ids with server ids as we create them
        for (const cid of (editableEvent.categories ?? [])
          .map(Number)
          .filter(Boolean)) {
          try {
            await api.post(`/organizer/events/${createdId}/categories`, {
              categoryId: cid,
            });
          } catch (e) {
            console.error("Error adding category (create)", cid, e);
          }
        }
        // Use speakersToProcess so if hasSpeakers was unchecked we skip creating speakers
        for (const s of speakersToProcess) {
          if ((s as any).isTemp) {
            try {
              if ((s as any).photoFile) {
                const form = new FormData();
                form.append("name", s.name);
                if (s.bio) form.append("bio", s.bio);
                form.append("photo", (s as any).photoFile);
                const res = await api.post(
                  `/organizer/events/${createdId}/speakers`,
                  form
                );
                const newId = extractIdFromResponse(res);
                // update local state to replace temp id with server id
                setEditableEvent((prev) =>
                  prev
                    ? {
                        ...prev,
                        speakers: (prev.speakers ?? []).map((sp) =>
                          sp.id === (s as any).id
                            ? { ...sp, id: newId, isTemp: false }
                            : sp
                        ),
                      }
                    : prev
                );
              } else {
                const res = await api.post(
                  `/organizer/events/${createdId}/speakers`,
                  {
                    name: s.name,
                    bio: s.bio,
                    photoUrl: s.photoUrl,
                  }
                );
                const newId = extractIdFromResponse(res);
                setEditableEvent((prev) =>
                  prev
                    ? {
                        ...prev,
                        speakers: (prev.speakers ?? []).map((sp) =>
                          sp.id === (s as any).id
                            ? { ...sp, id: newId, isTemp: false }
                            : sp
                        ),
                      }
                    : prev
                );
              }
            } catch (e) {
              console.error("Failed creating speaker", s, e);
            }
            continue;
          }

          const speakerId = Number((s as any).id);
          const hasFile = (s as any).photoFile;
          if (hasFile) {
            const form = new FormData();
            form.append("name", s.name);
            if (s.bio) form.append("bio", s.bio);
            form.append("photo", (s as any).photoFile);
            if (updateSpeaker) {
              await updateSpeaker.mutateAsync({ speakerId, data: form } as any);
            } else {
              await api.put(
                `/organizer/events/${id}/speakers/${speakerId}`,
                form
              );
            }
          } else {
            const payload: any = { name: s.name, bio: s.bio };
            if (updateSpeaker) {
              await updateSpeaker.mutateAsync({ speakerId, data: payload });
            } else {
              await api.put(
                `/organizer/events/${id}/speakers/${speakerId}`,
                payload
              );
            }
          }
        }

        // create tickets and replace temp ids with server ids
        for (const t of editableEvent.tickets ?? []) {
          if ((t as any).isTemp) {
            try {
              const res = await api.post(
                `/organizer/events/${createdId}/tickets`,
                {
                  type: t.type,
                  price: Number(t.price),
                  totalQuantity: Number(t.totalQuantity),
                  maxPerUser:
                    t.maxPerUser !== undefined && t.maxPerUser !== null
                      ? Number(t.maxPerUser)
                      : undefined,
                }
              );
              const newId = extractIdFromResponse(res);
              setEditableEvent((prev) =>
                prev
                  ? {
                      ...prev,
                      tickets: (prev.tickets ?? []).map((tk) =>
                        tk.id === (t as any).id
                          ? { ...tk, id: newId, isTemp: false }
                          : tk
                      ),
                    }
                  : prev
              );
            } catch (e) {
              console.error("Failed creating ticket", t, e);
            }
          }
        }

        setSaving(false);
        toast.success("Event created");
        if (onCreated) onCreated(createdId);
        queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
        return;
      }

      // Editing existing event
      if (isEdit && id) {
        if (hasBannerFile) {
          const form = new FormData();
          Object.entries(eventPayload).forEach(([k, v]) => {
            if (v !== undefined && v !== null) form.append(k, String(v));
          });
          form.append("eventBanner", bannerFile as File);
          await api.put(`/organizer/events/${id}`, form);
        } else {
          await api.put(`/organizer/events/${id}`, eventPayload);
        }

        try {
          const prev: number[] = originalCategoryIdsRef.current ?? [];
          const next: number[] = (editableEvent.categories ?? [])
            .map((c: any) => Number(c))
            .filter(Boolean);

          console.debug("[dbg] category sync start", { prev, next });

          const toAdd: number[] = next.filter((cid) => !prev.includes(cid));
          const toRemove: number[] = prev.filter((cid) => !next.includes(cid));

          console.debug(
            "[dbg] categories toAdd:",
            toAdd,
            "toRemove:",
            toRemove
          );

          // add new categories
          for (const cid of toAdd) {
            try {
              console.debug("[dbg] POST add category", {
                eventId: id,
                categoryId: cid,
              });
              const res = await api.post(`/organizer/events/${id}/categories`, {
                categoryId: cid,
              });
              console.debug("[dbg] add category response", {
                cid,
                status: res?.status,
                data: res?.data,
              });
            } catch (e: any) {
              console.error(
                "[dbg] Failed adding category",
                cid,
                e?.response?.data ?? e?.message ?? e
              );
            }
          }

          // remove deleted categories
          for (const cid of toRemove) {
            try {
              console.debug("[dbg] DELETE remove category", {
                eventId: id,
                categoryId: cid,
              });
              const res = await api.delete(
                `/organizer/events/${id}/categories/${cid}`
              );
              console.debug("[dbg] remove category response", {
                cid,
                status: res?.status,
                data: res?.data,
              });
            } catch (e: any) {
              console.error(
                "[dbg] Failed removing category",
                cid,
                e?.response?.data ?? e?.message ?? e
              );
            }
          }

          // update original ref so subsequent saves compare correctly
          originalCategoryIdsRef.current = next;
          console.debug(
            "[dbg] category sync done, originalCategoryIdsRef updated",
            originalCategoryIdsRef.current
          );
        } catch (e) {
          console.error("[dbg] Category sync failed", e);
        }

        for (const s of speakersToProcess) {
          const isTemp = (s as any).isTemp;
          if (isTemp) {
            if ((s as any).photoFile) {
              const form = new FormData();
              form.append("name", s.name);
              if (s.bio) form.append("bio", s.bio);
              form.append("photo", (s as any).photoFile);
              console.debug(
                "[dbg] POST /organizer/events/{id}/speakers with file for tempId",
                (s as any).id
              );
              {
                try {
                  const res = await api.post(
                    `/organizer/events/${id}/speakers`,
                    form
                  );
                  const newId = extractIdFromResponse(res);
                  setEditableEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          speakers: (prev.speakers ?? []).map((sp) =>
                            sp.id === (s as any).id
                              ? { ...sp, id: newId, isTemp: false }
                              : sp
                          ),
                        }
                      : prev
                  );
                } catch (e) {
                  console.error("Failed creating speaker (edit)", s, e);
                }
              }
            } else {
              console.debug(
                "[dbg] POST /organizer/events/{id}/speakers JSON for tempId",
                (s as any).id
              );
              {
                try {
                  const res = await api.post(
                    `/organizer/events/${id}/speakers`,
                    {
                      name: s.name,
                      bio: s.bio,
                      photoUrl: s.photoUrl,
                    }
                  );
                  const newId = extractIdFromResponse(res);
                  setEditableEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          speakers: (prev.speakers ?? []).map((sp) =>
                            sp.id === (s as any).id
                              ? { ...sp, id: newId, isTemp: false }
                              : sp
                          ),
                        }
                      : prev
                  );
                } catch (e) {
                  console.error("Failed creating speaker (edit)", s, e);
                }
              }
            }
            continue;
          }

          const speakerId = Number((s as any).id);
          const hasFile = (s as any).photoFile;
          if (hasFile) {
            const form = new FormData();
            form.append("name", s.name);
            if (s.bio) form.append("bio", s.bio);
            form.append("photo", (s as any).photoFile);
            if (updateSpeaker) {
              await updateSpeaker.mutateAsync({ speakerId, data: form } as any);
            } else {
              await api.put(
                `/organizer/events/${id}/speakers/${speakerId}`,
                form
              );
            }
          } else {
            const payload: any = { name: s.name, bio: s.bio };
            if (updateSpeaker) {
              await updateSpeaker.mutateAsync({ speakerId, data: payload });
            } else {
              await api.put(
                `/organizer/events/${id}/speakers/${speakerId}`,
                payload
              );
            }
          }
        }

        for (const t of editableEvent.tickets ?? []) {
          const isTemp = (t as any).isTemp;
          if (isTemp) {
            await api.post(`/organizer/events/${id}/tickets`, {
              type: t.type,
              price: Number(t.price),
              totalQuantity: Number(t.totalQuantity),
              maxPerUser:
                t.maxPerUser !== undefined && t.maxPerUser !== null
                  ? Number(t.maxPerUser)
                  : undefined,
            });
            continue;
          }

          const ticketId = Number((t as any).id);
          const ticketPayload: any = {
            type: t.type,
            price: Number(t.price),
            totalQuantity: Number(t.totalQuantity),
            maxPerUser:
              t.maxPerUser !== undefined && t.maxPerUser !== null
                ? Number(t.maxPerUser)
                : undefined,
          };

          if (updateTicket) {
            await updateTicket.mutateAsync({ ticketId, data: ticketPayload });
          } else {
            await api.put(
              `/organizer/events/${id}/tickets/${ticketId}`,
              ticketPayload
            );
          }
        }

        // --- ADDED: delete remote tickets that were marked for removal ---
        if (ticketsToDelete.length > 0) {
          for (const tid of ticketsToDelete) {
            try {
              if (deleteTicket && deleteTicket.mutateAsync) {
                await deleteTicket.mutateAsync(tid);
              } else {
                await api.delete(`/organizer/events/${id}/tickets/${tid}`);
              }
            } catch (e) {
              console.error("Failed deleting ticket", tid, e);
            }
          }
          setTicketsToDelete([]); // clear after attempting deletes
        }

        const toDeleteSpeakers = Array.from(
          new Set([...(speakersToDelete ?? []), ...remoteSpeakerIdsToDelete])
        );
        if (toDeleteSpeakers.length > 0) {
          for (const sid of toDeleteSpeakers) {
            try {
              if (deleteSpeaker && deleteSpeaker.mutateAsync) {
                await deleteSpeaker.mutateAsync(sid);
              } else {
                await api.delete(`/organizer/events/${id}/speakers/${sid}`);
              }
            } catch (e) {
              console.error("Failed deleting speaker", sid, e);
            }
          }
          setSpeakersToDelete([]); // clear after attempting deletes
        }

        queryClient.invalidateQueries({ queryKey: ["organizer-event", id] });
        toast.success("Event updated");
      }
    } catch (err) {
      console.error("Save error", err);
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  if (!editableEvent)
    return (
      <div className="p-6">
        {isLoading ? <p>Loading...</p> : <p>Preparing editor...</p>}
      </div>
    );

  return (
    <FormProvider {...methods}>
      <div className="max-w-6xl mx-auto">
        <PulseLoader show={saving} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Event" : "Create Event"}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                methods.handleSubmit(
                  () => handleSave(),
                  (errors) => console.log("validation errors", errors)
                )();
              }}
              disabled={saving}
            >
              {isEdit ? (
                <>
                  <Check />
                  Save Event
                </>
              ) : (
                <>
                  <Plus />
                  Create Event
                </>
              )}
            </Button>
            {isEdit && id && (
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    navigate({
                      pathname: "/organizer/preview",
                      search: `?id=${encodeURIComponent(String(id))}`,
                    });
                  } catch (e) {
                    console.error("Failed to open preview:", e);
                  }
                }}
                disabled={saving}
              >
                Preview Event
              </Button>
            )}
          </div>
        </div>

        {/* Event Info */}
        <Card className="mb-4">
          <CardContent>
            <EventInfo
              editable={true}
              editableEvent={editableEvent}
              onChangeField={handleChangeField}
              form={methods}
              {...eventInfoExtraProps}
            />
          </CardContent>
        </Card>

        {/* Tickets & Speakers */}
        <div className="flex flex-col gap-4 mb-4">
          <Card className="flex-1">
            <CardContent>
              <TicketsList
                tickets={editableEvent.tickets ?? []}
                editable={true}
                newTicket={newTicket}
                setNewTicket={setNewTicket}
                onAddLocal={handleAddTicketLocal}
                onChangeTicket={handleChangeTicket}
                onRemoveLocal={(_type, id) => handleRemoveLocal("ticket", id)}
                onRemoteDelete={(tid: number) => {
                  if (deleteTicket) deleteTicket.mutate(tid);
                }}
                error={ticketError}
              />
            </CardContent>
          </Card>

          {methods.watch?.("hasSpeakers") ??
          (editableEvent.speakers ?? []).length > 0 ? (
            <Card className="flex-1">
              <CardContent>
                <SpeakersList
                  speakers={editableEvent.speakers ?? []}
                  editable={true}
                  newSpeaker={newSpeaker}
                  setNewSpeaker={setNewSpeaker}
                  onAddLocal={handleAddSpeakerLocal}
                  onChangeSpeaker={handleChangeSpeaker}
                  onRemoveLocal={(_type, id) =>
                    handleRemoveLocal("speaker", id)
                  }
                  onRemoteDelete={(sid: number) => {
                    if (deleteSpeaker) deleteSpeaker.mutate(sid);
                  }}
                  onFileChange={(idOrNew, file) => {
                    if (typeof idOrNew === "number") {
                      handleChangeSpeaker(idOrNew, "photoFile", file);
                    } else {
                      setNewSpeaker((prev: any) => {
                        if (!prev) return null;
                        return { ...prev, photoFile: file };
                      });
                    }
                  }}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Categories */}
        <Card>
          <CardContent>
            <div className="mb-2 font-medium">Categories</div>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat: any) => (
                <CategoryBadge
                  key={cat.id}
                  category={cat}
                  selected={(editableEvent?.categories ?? [])
                    .map(Number)
                    .includes(Number(cat.id))}
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
                              (id: number) => Number(id) !== Number(cat.id)
                            ),
                          }
                        : prev
                    )
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
