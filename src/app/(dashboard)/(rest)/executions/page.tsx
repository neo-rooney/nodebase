import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { executionsParamsLoader } from "@/feature/executions/server/params-loader";
import { prefetchExecutions } from "@/feature/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await executionsParamsLoader(searchParams);
  prefetchExecutions(params);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <div>TODO</div>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
