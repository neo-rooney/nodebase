import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/feature/executions/types";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
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
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
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

  try {
    //TODO: 키값 유저입력으로 추후 변경
    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    console.log("credentialValue", credentialValue);

    const google = createGoogleGenerativeAI({
      apiKey: credentialValue,
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
