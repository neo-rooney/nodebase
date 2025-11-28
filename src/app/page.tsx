"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

// import { requireAuth } from "@/lib/auth-utils";

const Page = () => {
  // await requireAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...trpc.getWorkflows.queryOptions(),
  });

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      },
    }),
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-6">
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create Workflow
      </Button>
    </div>
  );
};

export default Page;
