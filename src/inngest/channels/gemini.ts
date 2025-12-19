import { channel, topic } from "@inngest/realtime";

export const GEMINI_CHANNEL_NAME = "gemini-execution";

export const geminiExecutionChannel = channel(GEMINI_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
