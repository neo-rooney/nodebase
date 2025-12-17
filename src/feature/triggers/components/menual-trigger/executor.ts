import type { NodeExecutor } from "@/feature/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO: loading state tor menual trigger

  const result = await step.run("manual-trigger", async () => context);

  //  TODO: success state tor menual trigger

  return result;
};
