"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { slackExecutionChannel } from "@/inngest/channels/slack";
import { inngest } from "@/inngest/client";

export type SlackToken = Realtime.Token<
  typeof slackExecutionChannel,
  ["status"]
>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: slackExecutionChannel(),
    topics: ["status"],
  });

  return token;
}

