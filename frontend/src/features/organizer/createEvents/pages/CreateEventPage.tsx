import { useState } from "react";
import {
  useCategories,
  useCreateEvent,
  useCreateTicket,
  useCreateSpeaker,
  usePublishEvent,
  useDeleteTicket,
  useDeleteSpeaker,
  useAssignCategoriesToEvent,
} from "../hooks/useCreateEvent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Category,
  TicketInput,
  SpeakerInput,
  CreateEventInput,
} from "../types/createEvent";
import { StepIndicator } from "../components/StepIndicator";
import { CategoryBadge } from "../components/CategoryBadge";
import { CongratulationsModal } from "../components/CongratulationsModal";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";

type Step = 1 | 2 | 3 | 4;

export default function CreateEventPage() {
  const [active, setActive] = useState<string>("create");

  const [step, setStep] = useState<Step>(1);
  const [eventId, setEventId] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState<"online" | "inPerson" | "">(
    ""
  );
  const [banner, setBanner] = useState<File | null>(null);
  const [tickets, setTickets] = useState<TicketInput[]>([]);
  const [ticketDraft, setTicketDraft] = useState<TicketInput>({
    type: "",
    price: 0,
    totalQuantity: 1,
  });
  const [speakers, setSpeakers] = useState<SpeakerInput[]>([]);
  const [speakerDraft, setSpeakerDraft] = useState<SpeakerInput>({
    name: "",
    bio: "",
    photoUrl: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [duration, setDuration] = useState<number | undefined>();

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const createEvent = useCreateEvent();
  const publishEvent = usePublishEvent();
  const createTicket = useCreateTicket(eventId ?? 0);
  const createSpeaker = useCreateSpeaker(eventId ?? 0);
  const deleteTicket = useDeleteTicket(eventId ?? 0);
  const deleteSpeaker = useDeleteSpeaker(eventId ?? 0);
  const assignCategories = useAssignCategoriesToEvent(eventId ?? 0);

  const handleEventInfoSubmit = (asDraft = false) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDatetime", startDatetime);
    formData.append("endDatetime", endDatetime);
    formData.append("location", location);
    formData.append("locationType", locationType);
    formData.append("duration", duration?.toString() || "");

    // Append banner file using the exact field name the server expects.
    if (banner instanceof File) {
      formData.append("eventBanner", banner);
    }

    createEvent.mutate(formData, {
      onSuccess: (data) => {
        console.log("Event created successfully:", data);
        setEventId(data.data.id || data.data.event?.id);
        if (asDraft) {
          window.location.href = "/organizer/events";
        } else {
          setStep(2);
        }
      },
      onError: (error) => {
        console.error("Error creating event:", error);
      },
    });
  };

  const handleAddTicket = () => {
    if (
      !ticketDraft.type ||
      ticketDraft.price < 0 ||
      ticketDraft.totalQuantity < 1
    )
      return;
    createTicket.mutate(ticketDraft, {
      onSuccess: (data) => {
        console.log("Ticket added:", data);
        setTickets((prev) => [...prev, data.data]);
        setTicketDraft({ type: "", price: 0, totalQuantity: 1 });
      },
      onError: (error) => {
        console.error("Error adding ticket:", error);
      },
    });
  };

  const handleRemoveTicket = (idx: number) => {
    const ticket = tickets[idx];
    if (ticket?.id) {
      deleteTicket.mutate(ticket.id, {
        onSuccess: () => {
          setTickets((prev) => prev.filter((_, i) => i !== idx));
        },
        onError: (error) => {
          console.error("Error deleting ticket:", error);
        },
      });
    } else {
      setTickets((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleAddSpeaker = () => {
    if (!speakerDraft.name) return;
    createSpeaker.mutate(speakerDraft, {
      onSuccess: (data) => {
        console.log("Speaker added:", data);
        setSpeakers((prev) => [...prev, data.data]);
        setSpeakerDraft({ name: "", bio: "", photoUrl: "" });
      },
      onError: (error) => {
        console.error("Error adding speaker:", error);
      },
    });
  };

  const handleRemoveSpeaker = (idx: number) => {
    const speaker = speakers[idx];
    if (speaker?.id) {
      deleteSpeaker.mutate(speaker.id, {
        onSuccess: () => {
          setSpeakers((prev) => prev.filter((_, i) => i !== idx));
        },
        onError: (error) => {
          console.error("Error deleting speaker:", error);
        },
      });
    } else {
      setSpeakers((prev) => prev.filter((_, i) => i !== idx));
    }
  };
  const handleSaveCategories = async () => {
    if (!eventId) return;
    try {
      await Promise.all(
        selectedCategories.map((categoryId) =>
          assignCategories.mutateAsync(categoryId)
        )
      );
      console.log("Categories saved!");
    } catch (err) {
      console.error("Error saving categories:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar active={active} onNavigate={(key) => setActive(key)} />

      <div className="flex-1 min-h-screen bg-gray-50 dark:bg-black">
        <Topbar />

        <main className="p-6 max-w-3xl mx-auto py-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Event</h1>
            <div className="flex gap-2 mb-8">
              <StepIndicator step={step} label="Event Info" activeStep={1} />
              <StepIndicator step={step} label="Tickets" activeStep={2} />
              <StepIndicator step={step} label="Speakers" activeStep={3} />
              <StepIndicator step={step} label="Categories" activeStep={4} />
            </div>

            {step === 1 && (
              <Card className="p-6 space-y-4 dark:bg-[#202127]">
                <div>
                  <label className="block font-medium mb-1">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium mb-1">
                      Start Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={startDatetime}
                      onChange={(e) => setStartDatetime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-medium mb-1">
                      End Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={endDatetime}
                      onChange={(e) => setEndDatetime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium mb-1">Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-medium mb-1">
                      Location Type
                    </label>
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={locationType}
                      onChange={(e) =>
                        setLocationType(
                          e.target.value as "online" | "inPerson" | ""
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="online">Online</option>
                      <option value="inPerson">In Person</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Banner Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBanner(file);
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={duration ?? ""}
                    onChange={(e) =>
                      setDuration(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min={1}
                    placeholder="e.g. 60"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleEventInfoSubmit(true)}
                    disabled={createEvent.isPending}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    className="bg-[#202127]"
                    type="button"
                    onClick={() => handleEventInfoSubmit(false)}
                    disabled={createEvent.isPending}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && eventId && (
              <Card className="p-6 space-y-4  dark:bg-[#202127]">
                <div className="font-medium mb-2">Tickets</div>
                <div className="flex gap-2 mb-2">
                  <div className="flex flex-col w-32">
                    <label className="text-xs mb-1">Type (e.g. General)</label>
                    <Input
                      value={ticketDraft.type}
                      onChange={(e) =>
                        setTicketDraft({ ...ticketDraft, type: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col w-24">
                    <label className="text-xs mb-1">Price</label>
                    <Input
                      type="number"
                      value={ticketDraft.price ?? ""}
                      onChange={(e) =>
                        setTicketDraft({
                          ...ticketDraft,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col w-24">
                    <label className="text-xs mb-1">Total Qty</label>
                    <Input
                      type="number"
                      value={ticketDraft.totalQuantity}
                      onChange={(e) =>
                        setTicketDraft({
                          ...ticketDraft,
                          totalQuantity: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min={1}
                    />
                  </div>

                  <div className="flex flex-col w-24">
                    <label className="text-xs mb-1">Max/User</label>
                    <Input
                      type="number"
                      value={ticketDraft.maxPerUser ?? ""}
                      onChange={(e) =>
                        setTicketDraft({
                          ...ticketDraft,
                          maxPerUser: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min={1}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddTicket}
                      disabled={createTicket.isPending}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {tickets.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="font-medium">{t.type}</span>
                      <span className="text-xs text-muted-foreground">
                        ${t.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Qty: {t.totalQuantity}
                      </span>
                      {t.maxPerUser && (
                        <span className="text-xs text-muted-foreground">
                          Max/User: {t.maxPerUser}
                        </span>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveTicket(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => (window.location.href = "/organizer/events")}
                  >
                    Save as Draft
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && eventId && (
              <Card className="p-6 space-y-4  dark:bg-[#202127]">
                <div className="font-medium mb-2">Speakers</div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    value={speakerDraft.name}
                    onChange={(e) =>
                      setSpeakerDraft({ ...speakerDraft, name: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    placeholder="Bio"
                    value={speakerDraft.bio}
                    onChange={(e) =>
                      setSpeakerDraft({ ...speakerDraft, bio: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    placeholder="Photo URL"
                    value={speakerDraft.photoUrl}
                    onChange={(e) =>
                      setSpeakerDraft({
                        ...speakerDraft,
                        photoUrl: e.target.value,
                      })
                    }
                    className="w-40"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSpeaker}
                    disabled={createSpeaker.isPending}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {speakers.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="font-medium">{s.name}</span>
                      {s.bio && (
                        <span className="text-xs text-muted-foreground">
                          {s.bio}
                        </span>
                      )}
                      {s.photoUrl && (
                        <img
                          src={s.photoUrl}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveSpeaker(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => (window.location.href = "/organizer/events")}
                  >
                    Save as Draft
                  </Button>
                  <Button type="button" onClick={() => setStep(4)}>
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {step === 4 && eventId && (
              <Card className="p-6 space-y-4 dark:bg-[#202127]">
                <div>
                  <label className="block font-medium mb-1">Categories</label>

                  {loadingCategories ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories?.map((cat: Category) => (
                        <CategoryBadge
                          key={cat.id}
                          category={cat}
                          selected={selectedCategories.includes(cat.id)}
                          onSelect={() =>
                            setSelectedCategories((prev) => [...prev, cat.id])
                          }
                          onRemove={() =>
                            setSelectedCategories((prev) =>
                              prev.filter((id) => id !== cat.id)
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      await handleSaveCategories();
                      window.location.href = "/organizer/events";
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      await handleSaveCategories();
                      setShowCongrats(true);
                    }}
                    disabled={selectedCategories.length === 0}
                  >
                    Save Categories
                  </Button>
                </div>
                <CongratulationsModal
                  open={showCongrats}
                  onKeepDraft={() => {
                    setShowCongrats(false);
                    window.location.href = "/organizer/events";
                  }}
                  onPublish={() => {
                    publishEvent.mutate(
                      { eventId },
                      {
                        onSuccess: () => {
                          setShowCongrats(false);
                          window.location.href = "/organizer/events";
                        },
                        onError: () => {
                          setShowCongrats(false);
                          alert("Error publishing event");
                        },
                      }
                    );
                  }}
                  publishing={publishEvent.isPending}
                />
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
