import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExecutionView } from "@/feature/executions/components/execution";
import {
  ExecutionsErrorView,
  ExecutionsLoadingView,
} from "@/feature/executions/components/executions";
import { prefetchExecution } from "@/feature/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { executionId } = await params;
  prefetchExecution(executionId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <ErrorBoundary fallback={<ExecutionsErrorView />}>
          <Suspense fallback={<ExecutionsLoadingView />}>
            <ExecutionView executionId={executionId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Page;
