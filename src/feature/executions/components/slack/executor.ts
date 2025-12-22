import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/feature/executions/types";
import { slackExecutionChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type SlackData = {
  variableName: string;
  content: string;
  webhookUrl: string;
  username?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  await publish(
    slackExecutionChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      slackExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No variable name configured");
  }

  if (!data.webhookUrl) {
    await publish(
      slackExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No webhook URL configured");
  }

  if (!data.content) {
    await publish(
      slackExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No content configured");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl, {
        json: {
          text: content,
          username,
        },
      });

      return {
        ...context,
        [data.variableName]: {
          slackMessageSent: true,
        },
      };
    });

    await publish(
      slackExecutionChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      slackExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

