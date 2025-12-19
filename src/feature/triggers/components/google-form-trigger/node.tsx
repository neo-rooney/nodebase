import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/feature/executions/hooks/use-node-status";
import { BaseTriggerNode } from "@/feature/triggers/base-trigger-node";
import { GoogleFormTriggerDialog } from "@/feature/triggers/components/google-form-trigger/dialog";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <BaseTriggerNode
        {...props}
        id={props.id}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="When a Google Form is submitted"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
});
