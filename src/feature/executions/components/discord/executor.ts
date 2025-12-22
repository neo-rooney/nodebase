import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/feature/executions/types";
import { discordExecutionChannel } from "@/inngest/channels/discord";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type DiscordData = {
  variableName: string;
  content: string;
  webhookUrl: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  await publish(
    discordExecutionChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No variable name configured");
  }

  if (!data.webhookUrl) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No webhook URL configured");
  }

  if (!data.content) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No content configured");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      return {
        ...context,
        [data.variableName]: {
          discordMessageSent: true,
        },
      };
    });

    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
