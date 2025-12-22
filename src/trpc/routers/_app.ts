// import { z } from "zod";

import { credentialsRouter } from "@/feature/credentials/server/routers";
import { executionsRouter } from "@/feature/executions/server/routers";
import { workflowsRouter } from "@/feature/workflows/server/routers";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
