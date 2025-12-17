import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/feature/executions/types";

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  nodeId,
  context,
  step,
  data,
}) => {
  // TODO: loading state tor http request
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }
  if (!data.variableName) {
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured",
    );
  }
  if (!data.method) {
    throw new NonRetriableError("HTTP Request node: No method configured");
  }
  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint;
    const method = data.method;

    const options: KyOptions = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });

  //  TODO: success state tor http request

  return result;
};
