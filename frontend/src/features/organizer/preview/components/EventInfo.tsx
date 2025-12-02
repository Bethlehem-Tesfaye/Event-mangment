import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Clock, Edit3, Info } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form";

function toDatetimeLocal(value: string | Date | undefined | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatDisplayDatetime(value: string | Date | undefined | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

type Labels = {
  title?: string;
  description?: string;
  locationType?: string;
  location?: string;
  startDatetime?: string;
  endDatetime?: string;
  duration?: string;
};

type FieldTypes = {
  title?: string;
  description?: string;
  location?: string;
  startDatetime?: string;
  endDatetime?: string;
  duration?: string;
};

export default function EventInfo({
  bannerSrc,
  editable,
  editableEvent,
  onChangeField,
  labels,
  fieldTypes,
  form,
}: {
  bannerSrc?: string;
  editable: boolean;
  editableEvent: any;
  onChangeField: (k: string, v: any) => void;
  labels?: Labels;
  fieldTypes?: FieldTypes;
  form?: UseFormReturn<any>;
}) {
  const ACCENT = "oklch(0.645 0.246 16.439)";

  let ctxMethods: UseFormReturn<any> | null = null;
  try {
    ctxMethods = useFormContext();
  } catch (e) {
    ctxMethods = null;
  }
  const methods = form ?? ctxMethods;
  const control = methods?.control;
  const watch = methods ? methods.watch : undefined;
  const setValue = methods ? methods.setValue : undefined;

  const getInputValue = (field: string, type?: string) => {
    const val = editableEvent?.[field];
    if (val === undefined || val === null) return "";
    if (type === "datetime-local") return toDatetimeLocal(val);
    if (type === "date" && typeof val === "string")
      return String(val).slice(0, 10);
    return String(val);
  };

  const bannerPreview = methods
    ? watch?.("eventBannerPreview") ??
      watch?.("eventBannerUrl") ??
      bannerSrc ??
      editableEvent.eventBannerUrl ??
      ""
    : editableEvent.eventBannerPreview ??
      bannerSrc ??
      editableEvent.eventBannerUrl ??
      "";

  const getError = (name: string) =>
    methods?.formState?.errors && (methods.formState.errors as any)[name]
      ? String((methods.formState.errors as any)[name]?.message ?? "")
      : "";

  function DropzoneWrapper() {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (f: File | null) => {
      if (methods) {
        setValue?.("eventBannerFile", f ?? null, { shouldDirty: true });
        const url = f ? URL.createObjectURL(f) : null;
        setValue?.("eventBannerPreview", url ?? null, { shouldDirty: true });
        setValue?.("eventBannerUrl", undefined as any, { shouldDirty: true });
        methods.clearErrors?.("eventBannerUrl");
      } else {
        if (f) {
          const url = URL.createObjectURL(f);
          onChangeField("eventBannerFile", f);
          onChangeField("eventBannerPreview", url);
          onChangeField("eventBannerUrl", null);
        } else {
          onChangeField("eventBannerFile", null);
          onChangeField("eventBannerPreview", null);
          onChangeField("eventBannerUrl", null);
        }
      }
    };

    return (
      <div className="w-full h-48 sm:h-56 flex items-center justify-center">
        <div
          className="relative w-full h-full rounded-lg border-2 border-dashed border-red-300 dark:border-red-600 bg-white/60 dark:bg-neutral-900/30 flex items-center justify-center group"
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer?.files?.[0] ?? null;
            handleFile(f);
          }}
        >
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Event banner preview"
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
          ) : null}

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              handleFile(f);
            }}
          />

          <div
            className={
              "relative z-10 flex flex-col items-center gap-2 text-center pointer-events-none transition-opacity duration-200 " +
              (bannerPreview || isDragging
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100 group-hover:opacity-100")
            }
          >
            <svg
              className="w-7 h-7 text-neutral-500 dark:text-neutral-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="14" rx="2" />
              <path d="M8 21l4-4 4 4" />
            </svg>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              Drag &amp; drop or
            </div>
            <div className="mt-1">
              <span className="inline-block bg-white dark:bg-neutral-800 border border-red-300 text-red-600 dark:text-red-400 px-3 py-1 rounded-md text-sm shadow-sm">
                Browse Files
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Max file size: 5MB
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="dark:bg-neutral-900 bg-white shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800"
            style={{ color: ACCENT }}
          >
            <Info size={18} />
          </div>
          <CardTitle className="text-lg font-semibold dark:text-white">
            {labels?.title ? "Event Information" : "Event Info"}
          </CardTitle>
        </div>

        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-2">
            <Edit3 size={14} />
            {editable ? "Editing" : "View"}
          </span>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-6 pb-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-800 border dark:border-neutral-700">
            {editable ? (
              <DropzoneWrapper />
            ) : bannerSrc || editableEvent.eventBannerUrl ? (
              <img
                src={bannerSrc ?? editableEvent.eventBannerUrl}
                alt="Event banner"
                className="w-full h-48 sm:h-56 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 sm:h-56 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                No banner
              </div>
            )}
          </div>

          {!editable && (
            <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{editableEvent.location ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>
                  {formatDisplayDatetime(editableEvent.startDatetime)} –{" "}
                  {formatDisplayDatetime(editableEvent.endDatetime)}
                </span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="lg:col-span-3 bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm">
          {!editable ? (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold dark:text-white">
                {editableEvent.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {editableEvent.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mt-3 text-sm dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{editableEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Calendar size={16} />
                  <span>
                    {formatDisplayDatetime(editableEvent.startDatetime)} –{" "}
                    {formatDisplayDatetime(editableEvent.endDatetime)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-neutral-200">
                    <Info size={14} />
                    {labels?.title ?? "Title"}
                  </label>

                  {methods ? (
                    <Controller
                      control={control!}
                      name="title"
                      defaultValue={editableEvent.title ?? ""}
                      render={({ field }) => {
                        const titleError = getError("title");
                        return (
                          <>
                            <Input
                              type="text"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={`h-11 text-base ${
                                titleError ? "border-red-500" : ""
                              }`}
                              placeholder="Event title"
                              aria-invalid={!!titleError}
                            />
                            {titleError ? (
                              <p className="mt-1 text-sm text-red-600">
                                {titleError}
                              </p>
                            ) : null}
                          </>
                        );
                      }}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={getInputValue("title", "text")}
                      onChange={(e) => onChangeField("title", e.target.value)}
                      className="h-11 text-base"
                      placeholder="Event title"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-neutral-200">
                    {labels?.duration ?? "Duration (minutes)"}
                  </label>

                  {methods ? (
                    <Controller
                      control={control!}
                      name="duration"
                      defaultValue={editableEvent.duration ?? ""}
                      render={({ field }) => {
                        const durationError = getError("duration");
                        return (
                          <>
                            <Input
                              type="number"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={`h-11 w-full ${
                                durationError ? "border-red-500" : ""
                              }`}
                              placeholder="60"
                              aria-invalid={!!durationError}
                            />
                            {durationError ? (
                              <p className="mt-1 text-sm text-red-600">
                                {durationError}
                              </p>
                            ) : null}
                          </>
                        );
                      }}
                    />
                  ) : (
                    <Input
                      type="number"
                      value={String(editableEvent.duration ?? "")}
                      onChange={(e) =>
                        onChangeField("duration", e.target.value)
                      }
                      className="h-11 w-full"
                      placeholder="60"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-neutral-200">
                  {labels?.description ?? "Description"}
                </label>

                {methods ? (
                  <Controller
                    control={control!}
                    name="description"
                    defaultValue={editableEvent.description ?? ""}
                    render={({ field }) => {
                      const descError = getError("description");
                      return (
                        <>
                          <Textarea
                            className={`min-h-[140px] resize-y rounded-lg p-3 ${
                              descError ? "border-red-500" : ""
                            }`}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="Describe the event..."
                            aria-invalid={!!descError}
                          />
                          {descError ? (
                            <p className="mt-1 text-sm text-red-600">
                              {descError}
                            </p>
                          ) : null}
                        </>
                      );
                    }}
                  />
                ) : (
                  <Textarea
                    className="min-h-[140px] resize-y rounded-lg p-3"
                    value={editableEvent.description ?? ""}
                    onChange={(e) =>
                      onChangeField("description", e.target.value)
                    }
                    placeholder="Describe the event..."
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-neutral-200">
                    {labels?.locationType ?? "Location Type"}
                  </label>

                  {methods ? (
                    <Controller
                      control={control!}
                      name="locationType"
                      defaultValue={editableEvent.locationType ?? ""}
                      render={({ field }) => {
                        const locTypeError = getError("locationType");
                        return (
                          <>
                            <select
                              className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-white ${
                                locTypeError ? "border-red-500" : ""
                              }`}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              aria-invalid={!!locTypeError}
                            >
                              <option value="">Select</option>
                              <option value="online">Online</option>
                              <option value="in-person">In-person</option>
                            </select>
                            {locTypeError ? (
                              <p className="mt-1 text-sm text-red-600">
                                {locTypeError}
                              </p>
                            ) : null}
                          </>
                        );
                      }}
                    />
                  ) : (
                    <>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        value={editableEvent.locationType ?? ""}
                        onChange={(e) =>
                          onChangeField("locationType", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="online">Online</option>
                        <option value="in-person">In-person</option>
                      </select>
                    </>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 dark:text-neutral-200">
                    {labels?.location ?? "Location"}
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />

                    {methods ? (
                      <Controller
                        control={control!}
                        name="location"
                        defaultValue={editableEvent.location ?? ""}
                        render={({ field }) => {
                          const locError = getError("location");
                          return (
                            <>
                              <Input
                                type="text"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={`pl-11 h-11 ${
                                  locError ? "border-red-500" : ""
                                }`}
                                placeholder="Location"
                                aria-invalid={!!locError}
                              />
                              {locError ? (
                                <p className="mt-1 text-sm text-red-600">
                                  {locError}
                                </p>
                              ) : null}
                            </>
                          );
                        }}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={getInputValue("location", "text")}
                        onChange={(e) =>
                          onChangeField("location", e.target.value)
                        }
                        className="pl-11 h-11"
                        placeholder="Location"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-neutral-200">
                    {labels?.startDatetime ?? "Start"}
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />

                    {methods ? (
                      <Controller
                        control={control!}
                        name="startDatetime"
                        defaultValue={editableEvent.startDatetime ?? ""}
                        render={({ field }) => {
                          const inputType =
                            fieldTypes?.startDatetime === "date"
                              ? "date"
                              : "datetime-local";
                          const display = toDatetimeLocal(field.value);
                          const startError = getError("startDatetime");
                          return (
                            <>
                              <Input
                                type={inputType}
                                value={display}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // convert to ISO for storage (compatible with original)
                                  field.onChange(
                                    v ? new Date(v).toISOString() : ""
                                  );
                                }}
                                className={`pl-11 h-11 ${
                                  startError ? "border-red-500" : ""
                                }`}
                                aria-invalid={!!startError}
                              />
                              {startError ? (
                                <p className="mt-1 text-sm text-red-600">
                                  {startError}
                                </p>
                              ) : null}
                            </>
                          );
                        }}
                      />
                    ) : (
                      <>
                        <Input
                          type={
                            fieldTypes?.startDatetime === "date"
                              ? "date"
                              : "datetime-local"
                          }
                          value={getInputValue(
                            "startDatetime",
                            fieldTypes?.startDatetime === "date"
                              ? "date"
                              : "datetime-local"
                          )}
                          onChange={(e) => {
                            const v = e.target.value;
                            onChangeField(
                              "startDatetime",
                              v ? new Date(v).toISOString() : ""
                            );
                          }}
                          className="pl-11 h-11"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font medium mb-2 dark:text-neutral-200">
                    {labels?.endDatetime ?? "End"}
                  </label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />

                    {methods ? (
                      <Controller
                        control={control!}
                        name="endDatetime"
                        defaultValue={editableEvent.endDatetime ?? ""}
                        render={({ field }) => {
                          const inputType =
                            fieldTypes?.endDatetime === "date"
                              ? "date"
                              : "datetime-local";
                          const display = toDatetimeLocal(field.value);
                          const endError = getError("endDatetime");
                          return (
                            <>
                              <Input
                                type={inputType}
                                value={display}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  field.onChange(
                                    v ? new Date(v).toISOString() : ""
                                  );
                                }}
                                className={`pl-11 h-11 ${
                                  endError ? "border-red-500" : ""
                                }`}
                                aria-invalid={!!endError}
                              />
                              {endError ? (
                                <p className="mt-1 text-sm text-red-600">
                                  {endError}
                                </p>
                              ) : null}
                            </>
                          );
                        }}
                      />
                    ) : (
                      <Input
                        type={
                          fieldTypes?.endDatetime === "date"
                            ? "date"
                            : "datetime-local"
                        }
                        value={getInputValue(
                          "endDatetime",
                          fieldTypes?.endDatetime === "date"
                            ? "date"
                            : "datetime-local"
                        )}
                        onChange={(e) => {
                          const v = e.target.value;
                          onChangeField(
                            "endDatetime",
                            v ? new Date(v).toISOString() : ""
                          );
                        }}
                        className="pl-11 h-11"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
