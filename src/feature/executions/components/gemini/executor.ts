import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/feature/executions/types";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import prisma from "@/lib/db";
import type { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type GeminiData = {
  variableName: string;
  model: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt: string;
  credentialId: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
  userId,
}) => {
  await publish(
    geminiExecutionChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: No variable name configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  if (!data.userPrompt) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: No user prompt configured");
  }

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  if (!data.credentialId) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: No credential ID configured");
  }

  try {
    const credential = await step.run("get-credential", async () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId,
        },
      });
    });

    if (!credential) {
      throw new NonRetriableError("Gemini node: Credential not found");
    }

    const google = createGoogleGenerativeAI({
      apiKey: credential.value,
    });

    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || ""),
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
      geminiExecutionChannel().status({
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
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
