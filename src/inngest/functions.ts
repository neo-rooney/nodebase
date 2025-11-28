import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Fetching the video
    await step.sleep("wait-a-moment", "5s");
    // Generating the transcript
    await step.sleep("transcript-generation", "5s");
    // Generating the summary
    await step.sleep("summary-generation", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "test-workflow-from-inngest",
        },
      });
    });
  },
);
