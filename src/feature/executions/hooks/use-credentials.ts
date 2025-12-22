import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useExecutionsParams } from "./use-executions-params";
/**
 * Hook to getch all executions using suspense
 * @returns
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

/**
 * Hook to fetch a single execution
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
