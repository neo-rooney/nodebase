import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  WorkflowsContainer,
  WorkflowsList,
} from "@/feature/workflows/components/workflows";
import { prefetchWorkflows } from "@/feature/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
  await requireAuth();

  prefetchWorkflows();

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
