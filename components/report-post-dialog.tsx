import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const REPORT_REASONS = [
  { id: "spam", label: "Spam or misleading" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "hate_speech", label: "Hate speech or violence" },
  { id: "misinformation", label: "Misinformation or false information" },
  { id: "intellectual_property", label: "Intellectual property violation" },
  { id: "other", label: "Other" },
];

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSubmit?: (reason: string, details: string) => void;
}

export function ReportPostDialog({
  open,
  onOpenChange,
  postId,
  onSubmit,
}: ReportPostDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(selectedReason, details);
      }

      console.log("[v0] Report submitted:", {
        postId,
        reason: selectedReason,
        details,
      });

      // Reset and close dialog
      setSelectedReason("");
      setDetails("");
      onOpenChange(false);
    } catch (error) {
      console.error("[v0] Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setSelectedReason("");
        setDetails("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us understand why you're reporting this post. Your feedback helps keep our community safe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Reason Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Reason for reporting</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional context that would help us understand the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="resize-none min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
