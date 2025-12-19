"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { openaiExecutionChannel } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";

export type OpenaiToken = Realtime.Token<
  typeof openaiExecutionChannel,
  ["status"]
>;

export async function fetchOpenaiRealtimeToken(): Promise<OpenaiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: openaiExecutionChannel(),
    topics: ["status"],
  });

  return token;
}
