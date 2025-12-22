"use client";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { fetchDiscordRealtimeToken } from "@/feature/executions/components/discord/actions";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { DiscordDialog, type DiscordFormValues } from "./dialog";

type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const nodeData = props.data;
  const { setNodes } = useReactFlow();
  const description = nodeData?.content
    ? `Send : ${nodeData.content.slice(0, 50)}...`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: DiscordFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/discord.svg"
        name="Discord"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
    </>
  );
});

DiscordNode.displayName = "DiscordNode";
