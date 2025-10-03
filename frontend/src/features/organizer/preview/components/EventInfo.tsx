import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EventInfo({
  bannerSrc,
  editable,
  editableEvent,
  onChangeField,
}: {
  bannerSrc?: string;
  editable: boolean;
  editableEvent: any;
  onChangeField: (k: string, v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Info</CardTitle>
      </CardHeader>
      <CardContent>
        {bannerSrc ? (
          <div className="mb-4">
            <img src={bannerSrc} alt="Event banner" className="w-full h-48 object-cover rounded-md" />
          </div>
        ) : (
          <div className="mb-4 h-48 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No banner</div>
        )}

        {!editable ? (
          <div className="space-y-2">
            <p className="font-semibold">{editableEvent.title}</p>
            <p className="text-sm text-muted-foreground">{editableEvent.description}</p>
            <p className="text-sm">Location: {editableEvent.location}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input value={editableEvent.title ?? ""} onChange={(e) => onChangeField("title", e.target.value)} />
            <Textarea value={editableEvent.description ?? ""} onChange={(e) => onChangeField("description", e.target.value)} />
            <div className="flex gap-2">
              <Input value={editableEvent.location ?? ""} onChange={(e) => onChangeField("location", e.target.value)} />
              <Input value={editableEvent.startDatetime ?? ""} onChange={(e) => onChangeField("startDatetime", e.target.value)} />
              <Input value={editableEvent.endDatetime ?? ""} onChange={(e) => onChangeField("endDatetime", e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">Banner is read-only in this environment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}