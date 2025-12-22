import { NonRetriableError } from "inngest";
import { getExecutor } from "@/feature/executions/lib/executor-registry";
import { anthropicExecutionChannel } from "@/inngest/channels/anthropic";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { manualTriggerChannel } from "@/inngest/channels/menual-trigger";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import prisma from "@/lib/db";
import { openaiExecutionChannel } from "./channels/openai";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // TODO: Remove this after testing
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiExecutionChannel(),
      anthropicExecutionChannel(),
      openaiExecutionChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("get-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
        userId,
      });
    }

    return { workflowId, result: context };
  },
);
