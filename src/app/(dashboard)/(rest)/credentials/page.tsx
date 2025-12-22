import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { credentialsParamsLoader } from "@/feature/credentials/server/params-loader";
import { prefetchCredentials } from "@/feature/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await credentialsParamsLoader(searchParams);
  prefetchCredentials(params);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <div>Credentials</div>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
