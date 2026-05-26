import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2"; 
import { NextRequest } from "next/server";
import {  defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";


import {
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";



const getWeather = defineTool({
  name: "getWeather",
  description: "Get the current weather for a location",
  parameters: z.object({
    location: z.string().describe("The location's name"),
  }),
  execute: async ({ location }) => {
    // Your implementation here
    return { temperature: 72, condition: "sunny", location };
  },
});


// const builtInAgent = new BuiltInAgent({
//   model: "openai:gpt-5.4-mini",
//   temperature: 0.7,        // Creativity (0 = deterministic, 1+ = creative)
//   topP: 0.9,               // Nucleus sampling
//   topK: 40,                // Top-K sampling (provider-dependent)
//   maxOutputTokens: 100,   // Maximum tokens in the response
//   presencePenalty: 0.1,    // Penalize repeated topics
//   frequencyPenalty: 0.1,   // Penalize repeated tokens
//   stopSequences: ["END"],  // Stop generation at these sequences
//   seed: 42,                // Deterministic output (provider-dependent)
//   maxRetries: 3,           // Retry on transient failures
// });

const builtInAgent = new BuiltInAgent({
  model: "openai:gpt-5.4-mini",
  tools: [getWeather],
  maxSteps: 2                   //Important for tool calls
});


// const runtime = new CopilotRuntime({
//   agents: { default: builtInAgent },
//   a2ui: {},
// });
// const builtInAgent = new BuiltInAgent({ 
//   model: "openai:gpt-5.4-mini",
// });

// const runtime = new CopilotRuntime({
//   agents: { default: builtInAgent }, 
// });

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
  a2ui: {},
});


export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
