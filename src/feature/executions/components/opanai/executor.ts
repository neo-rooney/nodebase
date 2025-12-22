import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/feature/executions/types";
import { openaiExecutionChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";
import type { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenaiData = {
  variableName: string;
  model: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt: string;
  credentialId: string;
};

export const openaiExecutor: NodeExecutor<OpenaiData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  await publish(
    openaiExecutionChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      openaiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("OpenAI node: No variable name configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  if (!data.userPrompt) {
    await publish(
      openaiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("OpenAI node: No user prompt configured");
  }

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  if (!data.credentialId) {
    await publish(
      openaiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("OpenAI node: No credential ID configured");
  }

  try {
    const credential = await step.run("get-credential", async () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
        },
      });
    });

    if (!credential) {
      throw new NonRetriableError("OpenAI node: Credential not found");
    }

    const openai = createOpenAI({
      apiKey: credential.value,
    });

    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || ""),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openaiExecutionChannel().status({
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
      openaiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
