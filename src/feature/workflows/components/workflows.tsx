"use client";

import { useSuspenseWorkflows } from "../hooks/use-workflows";

export const WorkflowsList = () => {
  const { data: workflows } = useSuspenseWorkflows();
  return <pre>{JSON.stringify(workflows, null, 2)}</pre>;
};
