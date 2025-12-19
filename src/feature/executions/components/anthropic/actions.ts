"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { anthropicExecutionChannel } from "@/inngest/channels/anthropic";
import { inngest } from "@/inngest/client";

export type AnthropicToken = Realtime.Token<
  typeof anthropicExecutionChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: anthropicExecutionChannel(),
    topics: ["status"],
  });

  return token;
}
