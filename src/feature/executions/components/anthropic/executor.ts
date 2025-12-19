import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/feature/executions/types";
import { anthropicExecutionChannel } from "@/inngest/channels/anthropic";
import type { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type AnthropicData = {
  variableName: string;
  model: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  await publish(
    anthropicExecutionChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      anthropicExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: No variable name configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  if (!data.userPrompt) {
    await publish(
      anthropicExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: No user prompt configured");
  }

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  try {
    //TODO: 키값 유저입력으로 추후 변경
    const credentialValue = process.env.ANTHROPIC_API_KEY;

    const anthropic = createAnthropic({
      apiKey: credentialValue,
    });

    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || ""),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicExecutionChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      anthropicExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
