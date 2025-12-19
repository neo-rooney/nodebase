import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/feature/executions/components/anthropic/node";
import { GeminiNode } from "@/feature/executions/components/gemini/node";
import { HttpRequestNode } from "@/feature/executions/components/http-request/node";
import { OpenaiNode } from "@/feature/executions/components/opanai/node";
import { GoogleFormTriggerNode } from "@/feature/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/feature/triggers/components/menual-trigger/node";
import { StripeTriggerNode } from "@/feature/triggers/components/stripe-trigger/node";
import { NodeType } from "@/generated/prisma/enums";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MAMUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.OPENAI]: OpenaiNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
