// import { z } from "zod";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return prisma.workflow.create({
      data: {
        name: "test-workflow",
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
