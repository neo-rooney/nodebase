"use client";

import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateGoogleFormScript } from "@/feature/triggers/components/google-form-trigger/utils";

interface GoogleFormTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({
  open,
  onOpenChange,
}: GoogleFormTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy webhook URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Form Configuration</DialogTitle>
          <DialogDescription>
            Use thie webhook URL in your Google Form's Apps Script to trigger
            this workflow when a form is submitted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                size="icon"
                variant="outline"
                type="button"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">Setup instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open your Google Form</li>
              <li>Click the three dots menu → Script editor</li>
              <li>Copy and paste the script below</li>
              <li>Replace Webhook URL with the one above</li>
              <li>Save and click "Triggers" → Add Trigger</li>
              <li>Choose: Form from → On form submit → Save</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="text-sm font-medium">Google App Script:</h4>
            <Button
              variant="outline"
              type="button"
              onClick={async () => {
                const script = generateGoogleFormScript(webhookUrl);
                try {
                  await navigator.clipboard.writeText(script);
                  toast.success("Google App Script copied to clipboard");
                } catch {
                  toast.error("Failed to copy Google App Script");
                }
              }}
            >
              <CopyIcon className="size-4 mr-2" />
              Copy Google App Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook URL and handles form submissions
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">Available variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.respondentEmail}}"}
                </code>
                - Respondent's email
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.responses['Question Name']}}"}
                </code>
                - Specific answer
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{json googleForm.responses}}"}
                </code>
                - All answers as a JSON object
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
