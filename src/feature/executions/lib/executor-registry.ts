import { googleFormTriggerExecutor } from "@/feature/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/feature/triggers/components/menual-trigger/executor";
import { stripeTriggerExecutor } from "@/feature/triggers/components/stripe-trigger/executor";
import { NodeType } from "@/generated/prisma/enums";
import { geminiExecutor } from "../components/gemini/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { openaiExecutor } from "../components/opanai/executor";
import type { NodeExecutor } from "../types";
export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MAMUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor as NodeExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor as NodeExecutor,
  [NodeType.ANTHROPIC]: geminiExecutor as NodeExecutor,
  [NodeType.OPENAI]: openaiExecutor as NodeExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor => {
  const executor = executorRegistry[nodeType];
  if (!executor) {
    throw new Error(`Executor for node type ${nodeType} not found`);
  }
  return executor;
};
