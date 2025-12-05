// import { z } from "zod";

import { google } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async () => {
    // throw new TRPCError({
    //   code: "BAD_REQUEST",
    //   message: "Something went wrong",
    // });
    await inngest.send({
      name: "execute/ai",
    });
    return {
      success: true,
      message: "Job queued",
    };
  }),
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "test@example.com",
      },
    });
    return {
      success: true,
      message: "Job queued",
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
