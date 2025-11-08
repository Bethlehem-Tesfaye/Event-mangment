import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, TicketInput, SpeakerInput } from "../types/createEvent";
import { CategoryBadge } from "../components/CategoryBadge";
import { CongratulationsModal } from "../components/CongratulationsModal";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { MapPin, Upload } from "lucide-react";
import { toast } from "sonner";

type Stage = "event" | "tickets" | "speakers" | "categories";

export default function CreateEventPage() {
  const [active, setActive] = useState<string>("create");

  const [stage, setStage] = useState<Stage>("event");

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
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | undefined>();

  // Tickets
  const [tickets, setTickets] = useState<TicketInput[]>([]);
  const [ticketDraft, setTicketDraft] = useState<TicketInput>({
    type: undefined,
    price: 0,
    totalQuantity: 1,
  });

  // Speakers
  const [speakers, setSpeakers] = useState<SpeakerInput[]>([]);
  const [speakerDraft, setSpeakerDraft] = useState<SpeakerInput>({
    name: "",
    bio: "",
    photoUrl: "",
  });

  // Categories
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Hooks for API
  const createEvent = useCreateEvent();
  const publishEvent = usePublishEvent();
  const createTicket = useCreateTicket(eventId ?? 0);
  const createSpeaker = useCreateSpeaker(eventId ?? 0);
  const deleteTicket = useDeleteTicket(eventId ?? 0);
  const deleteSpeaker = useDeleteSpeaker(eventId ?? 0);
  const assignCategories = useAssignCategoriesToEvent(eventId ?? 0);

  useEffect(() => {
    if (!banner) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(banner);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [banner]);

  const handleEventInfoSubmit = (asDraft = false) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDatetime", startDatetime);
    formData.append("endDatetime", endDatetime);
    formData.append("location", location);
    formData.append("locationType", locationType);
    formData.append("duration", duration?.toString() || "");

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
          setStage("tickets");
        }
      },
      onError: (error) => {
        console.error("Error creating event:", error);
        toast.error("Error creating event. Check console for details.");
      },
    });
  };

  const handleAddTicket = () => {
    if (!eventId) {
      toast.error(
        "Please save event info first (Continue) before adding tickets."
      );
      return;
    }

    createTicket.mutate(ticketDraft, {
      onSuccess: (data) => {
        setTickets((prev) => [...prev, data.data]);
        setTicketDraft({ type: "", price: 0, totalQuantity: 1 });
      },
      onError: (err) => {
        console.error("Error adding ticket:", err);
        toast.error("Error adding ticket");
      },
    });
  };

  const handleRemoveTicket = (idx: number) => {
    const ticket = tickets[idx];
    if (ticket?.id) {
      deleteTicket.mutate(ticket.id, {
        onSuccess: () => setTickets((prev) => prev.filter((_, i) => i !== idx)),
        onError: (err) => {
          console.error(err);
          toast.error("Error deleting ticket");
        },
      });
    } else {
      setTickets((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleAddSpeaker = () => {
    if (!speakerDraft.name) return;
    if (!eventId) {
      toast.error(
        "Please save event info first (Continue) before adding speakers."
      );
      return;
    }
    createSpeaker.mutate(speakerDraft, {
      onSuccess: (data) => {
        setSpeakers((prev) => [...prev, data.data]);
        setSpeakerDraft({ name: "", bio: "", photoUrl: "" });
      },
      onError: (err) => {
        console.error(err);
        toast.error("Error adding speaker");
      },
    });
  };

  const handleRemoveSpeaker = (idx: number) => {
    const speaker = speakers[idx];
    if (speaker?.id) {
      deleteSpeaker.mutate(speaker.id, {
        onSuccess: () =>
          setSpeakers((prev) => prev.filter((_, i) => i !== idx)),
        onError: (err) => {
          console.error(err);
          toast.error("Error deleting speaker");
        },
      });
    } else {
      setSpeakers((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSaveCategories = async () => {
    if (!eventId) {
      toast.error(
        "Please save event info first (Continue) before saving categories."
      );
      return;
    }
    try {
      await Promise.all(
        selectedCategories.map((categoryId) =>
          assignCategories.mutateAsync(categoryId)
        )
      );
      console.log("Categories saved!");
    } catch (err) {
      console.error("Error saving categories:", err);
      toast.error("Error saving categories");
    }
  };

  const proceedNextFromEvent = () => {
    if (!title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    handleEventInfoSubmit(false);
  };

  return (
    <div className="flex w-full dark:bg-black bg-white min-h-screen">
      <Sidebar active={active} onNavigate={(key: string) => setActive(key)} />
      <div className="flex-1">
        <Topbar />

        <main className="p-6 max-w-7xl mx-26">
          <h1 className="text-2xl font-bold mb-8 dark:text-white">
            Create Event
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {/* Left visual: big preview */}
            <div className="md:col-span-1 flex justify-center items-start">
              <Card className="dark:bg-[#251437] border-none shadow-xl rounded-2xl p-0 overflow-hidden cursor-pointer w-full max-w-[400px] h-[500px]">
                <label className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-[#1a1522] cursor-pointer">
                  {bannerPreview ? (
                    // show uploaded image
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-auto max-h-full object-contain"
                    />
                  ) : (
                    // placeholder
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-300">
                      <Upload className="h-16 w-16 mb-4" />
                      <div className="text-sm">Click to upload a banner</div>
                      <div className="text-xs mt-2">
                        Supported formats: PNG, JPG, JPEG
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBanner(file);
                    }}
                    className="hidden"
                  />
                </label>
              </Card>
            </div>

            {/* Right form: spans 2 columns on md */}
            <div className="md:col-span-2 flex justify-start">
              <Card className="dark:bg-[#251437] bg-white border-none shadow-xl rounded-2xl">
                <CardContent className="space-y-4 p-6">
                  {/* Event Form (visible when stage === 'event') */}
                  {stage === "event" && (
                    <div className="space-y-6 ">
                      <input
                        placeholder="Event Name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none"
                      />
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md w-[550px] flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">
                          Description
                        </label>
                        <textarea
                          placeholder="Description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full min-h-[100px] resize-y border-0 bg-transparent text-sm focus:ring-0 focus:outline-none px-0 py-2"
                        />
                      </div>
                      <div className="flex gap-6 items-center">
                        <div className="flex flex-col gap-4 p-5 bg-gray-100 h-40">
                          {/* Start row */}
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 w-25">
                              Start Date
                            </span>
                            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-md w-[200px]">
                              <input
                                type="datetime-local"
                                value={startDatetime}
                                onChange={(e) =>
                                  setStartDatetime(e.target.value)
                                }
                                className="w-full h-8 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* End row */}
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 w-25">
                              End Date
                            </span>
                            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-md w-[200px]">
                              <input
                                type="datetime-local"
                                value={endDatetime}
                                onChange={(e) => setEndDatetime(e.target.value)}
                                className="w-full h-8 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md w-60 h-20 flex flex-col">
                          <label className="text-xs font-medium text-gray-500 mb-1">
                            Duration (minutes)
                          </label>
                          <Input
                            type="number"
                            value={duration ?? ""}
                            onChange={(e) =>
                              setDuration(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            min={1}
                            placeholder="e.g. 60"
                            className="w-full border-0 bg-transparent text-sm focus:ring-0 focus:outline-none px-0 py-2"
                          />
                        </div>
                      </div>

                      <div className="flex gap-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md w-[300px] flex items-center">
                          <div className="flex flex-col flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1">
                              Location Type
                            </label>
                            <div className="relative w-full">
                              <select
                                className="w-full  bg-transparent border-0 px-0 py-2 text-sm focus:outline-none focus:ring-0"
                                value={locationType}
                                onChange={(e) =>
                                  setLocationType(
                                    e.target.value as "online" | "inPerson" | ""
                                  )
                                }
                              >
                                <option value="">Select Location Type</option>
                                <option value="online">Online</option>
                                <option value="inPerson">In Person</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center gap-3 w-[300px]">
                          {/* Icon */}
                          <MapPin />

                          <div className="flex flex-col flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1">
                              Add Event Location
                            </label>
                            <input
                              placeholder="Location"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-0 focus:outline-none px-0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-12 justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEventInfoSubmit(true)}
                          disabled={createEvent.isPending}
                        >
                          Save as Draft
                        </Button>

                        <Button
                          type="button"
                          onClick={proceedNextFromEvent}
                          disabled={createEvent.isPending}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tickets Form */}
                  {stage === "tickets" && (
                    <div className="space-y-4">
                      <div className="font-medium">Tickets</div>

                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl w-full flex flex-wrap gap-4">
                        {/* Ticket Type */}
                        <div className="flex flex-col w-40">
                          <label className="text-xs font-medium text-gray-500 mb-1">
                            Type (e.g. General)
                          </label>
                          <Input
                            value={ticketDraft.type}
                            onChange={(e) =>
                              setTicketDraft({
                                ...ticketDraft,
                                type: e.target.value,
                              })
                            }
                            className="w-full bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Price */}
                        {/* Price */}
                        <div className="flex flex-col w-28">
                          <label className="text-xs font-medium text-gray-500 mb-1">
                            Price
                          </label>
                          <Input
                            type="number"
                            value={ticketDraft.price ?? ""}
                            onChange={(e) =>
                              setTicketDraft({
                                ...ticketDraft,
                                price:
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value,
                              })
                            }
                            min={0}
                            className="w-full bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Total Quantity */}
                        <div className="flex flex-col w-28">
                          <label className="text-xs font-medium text-gray-500 mb-1">
                            Total Qty
                          </label>
                          <Input
                            type="number"
                            value={ticketDraft.totalQuantity ?? ""}
                            onChange={(e) =>
                              setTicketDraft({
                                ...ticketDraft,
                                totalQuantity:
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value,
                              })
                            }
                            min={1}
                            className="w-full bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Max per User */}
                        <div className="flex flex-col w-28">
                          <label className="text-xs font-medium text-gray-500 mb-1">
                            Max/User
                          </label>
                          <Input
                            type="number"
                            value={ticketDraft.maxPerUser ?? ""}
                            onChange={(e) =>
                              setTicketDraft({
                                ...ticketDraft,
                                maxPerUser:
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value,
                              })
                            }
                            min={1}
                            className="w-full bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Add Button */}
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
                        {tickets.length === 0 ? (
                          <div className="text-sm text-muted-foreground items-start">
                            No tickets added yet
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-start max-w-md p-1">
                            {tickets.map((t, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md w-full"
                              >
                                <span className="font-medium text-gray-800 dark:text-gray-200 w-20 text-sm truncate">
                                  {t.type}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 w-14 text-sm">
                                  ${t.price}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 w-16 text-sm">
                                  Qty: {t.totalQuantity}
                                </span>
                                {t.maxPerUser && (
                                  <span className="text-gray-600 dark:text-gray-400 w-16 text-sm truncate">
                                    max {t.maxPerUser}
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="ml-auto px-2 py-1 text-xs"
                                  onClick={() => handleRemoveTicket(idx)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-12 justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStage("event")}
                        >
                          Back
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEventInfoSubmit(true)}
                        >
                          Save as Draft
                        </Button>

                        <Button
                          type="button"
                          onClick={() => setStage("speakers")}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Speakers Form */}
                  {stage === "speakers" && (
                    <div className="space-y-4">
                      <div className="font-medium">Speakers</div>

                      <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md max-w-md">
                        <Input
                          placeholder="Name"
                          value={speakerDraft.name}
                          onChange={(e) =>
                            setSpeakerDraft({
                              ...speakerDraft,
                              name: e.target.value,
                            })
                          }
                          className="w-40 bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                        />
                        <Input
                          placeholder="Bio"
                          value={speakerDraft.bio}
                          onChange={(e) =>
                            setSpeakerDraft({
                              ...speakerDraft,
                              bio: e.target.value,
                            })
                          }
                          className="w-40 bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
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
                          className="w-40 bg-gray-200 dark:bg-gray-700 border-none rounded-md px-3 py-2 text-sm focus:ring-0 focus:outline-none"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddSpeaker}
                          disabled={createSpeaker.isPending}
                          className="px-3 py-1 text-xs"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {speakers.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No speakers added yet
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-start max-w-md">
                            {speakers.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md w-full"
                              >
                                {s.photoUrl && (
                                  <img
                                    src={s.photoUrl}
                                    alt={s.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                    {s.name}
                                  </span>
                                  {s.bio && (
                                    <span className="text-gray-600 dark:text-gray-400 text-sm truncate">
                                      {s.bio}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="ml-auto px-2 py-1 text-xs"
                                  onClick={() => handleRemoveSpeaker(idx)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-12 justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStage("tickets")}
                        >
                          Back
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEventInfoSubmit(true)}
                        >
                          Save as Draft
                        </Button>

                        <Button
                          type="button"
                          onClick={() => setStage("categories")}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Categories Form */}
                  {stage === "categories" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-medium mb-1">
                          Categories
                        </label>

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
                                  setSelectedCategories((prev) => [
                                    ...prev,
                                    cat.id,
                                  ])
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

                      <div className="flex gap-3 mt-12 justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStage("speakers")}
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
                          if (!eventId) return toast.error("Missing event id");
                          publishEvent.mutate(
                            { eventId },
                            {
                              onSuccess: () => {
                                setShowCongrats(false);
                                window.location.href = "/organizer/events";
                              },
                              onError: () => {
                                setShowCongrats(false);
                                toast.error("Error publishing event");
                              },
                            }
                          );
                        }}
                        publishing={publishEvent.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
