"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";

export type GeminiToken = Realtime.Token<
  typeof geminiExecutionChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiExecutionChannel(),
    topics: ["status"],
  });

  return token;
}
