import { Button } from "@/components/ui/button";

interface CongratulationsModalProps {
  open: boolean;
  onKeepDraft: () => void;
  onPublish: () => void;
  publishing: boolean;
}

export function CongratulationsModal({ open, onKeepDraft, onPublish, publishing }: CongratulationsModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
        <p className="mb-6">You have successfully created your event.</p>
        <div className="flex gap-2 justify-center">
          <Button variant="secondary" onClick={onKeepDraft}>
            Keep as Draft
          </Button>
          <Button onClick={onPublish} disabled={publishing}>
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}