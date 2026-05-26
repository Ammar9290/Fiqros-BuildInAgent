"use client";
import { CopilotSidebar ,CopilotChat,CopilotPopup  } from "@copilotkit/react-core/v2"; 
import { useComponent } from "@copilotkit/react-core/v2"; 
import { z } from "zod";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2"
import { useAgent } from "@copilotkit/react-core/v2"; 
import { useAgentContext } from "@copilotkit/react-core/v2"; 
import { useState } from "react";
import { useRenderTool } from "@copilotkit/react-core/v2"; 
import { useFrontendTool } from "@copilotkit/react-core/v2"; 
import { useCopilotKit } from "@copilotkit/react-core/v2";
//import { randomUUID } from "@copilotkit/shared/v2";
import ThreadSidebar from "./ThreadSidebar";
import { useEffect } from "react";


const weatherSchema = z.object({
  city: z.string().describe("City name"),
  temperature: z.number().describe("Temperature in Fahrenheit"),
  condition: z.string().describe("Weather condition"),
});
function WeatherCard({ city, temperature, condition }: z.infer<typeof weatherSchema>) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{city}</h3>
      <p className="text-2xl">{temperature}°F</p>
      <p className="text-sm text-gray-500">{condition}</p>
    </div>
  );
}
const weatherParams = z.object({
  location: z.string().describe("The location to get weather for"),
});


export default function Page() {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  useComponent({
    name: "showWeather",
    description: "Display a weather card for a city.",
    parameters: weatherSchema,
    render: WeatherCard,
  });

  useHumanInTheLoop({
    name: "humanApprovedCommand",
    description: "Ask human for approval to run a command.",
    parameters: z.object({ command: z.string().describe("The command to run") }),
    render: ({ args, respond, status }) => {
      if (status !== "executing") return <></>;
      return (
        <div>
          <pre>{args.command}</pre>
          <button onClick={() => respond?.(`Tell the user the command ran`)}>Approve</button>
          <button onClick={() => respond?.(`Tell the user the command wasn't run`)}>Deny</button>
        </div>
      );
    },
  });
   useRenderTool({
    name: "get_weather",
    parameters: weatherParams,
    render: ({ status, parameters }) => {
      return (
        <p className="text-gray-500 mt-2">
          {status !== "complete" && "Calling weather API..."}
          {status === "complete" && `Called the weather API for ${parameters.location}.`}
        </p>
      );
    },
  });
useFrontendTool({
    name: "sayHello",
    description: "Say hello to the user",
    parameters: z.object({
      name: z.string().describe("The name of the user to say hello to"),
    }),
    handler: async ({ name }) => {
      alert(`Hello, ${name}!`);
      return `Said hello to ${name}!`;
    },
  });

  //useAgentContext
   const [user] = useState({
    name: "Jane Smith",
    role: "Engineering Manager",
    team: "Platform",
  });
  const [projects] = useState([
    { id: 1, name: "Auth Redesign", status: "in-progress" },
    { id: 2, name: "API v2", status: "planning" },
  ]);
  // Share user info with the agent
  useAgentContext({
    description: "The currently logged-in user",
    value: user,
  });
  // Share project data with the agent
  useAgentContext({
    description: "The user's active projects",
    value: projects,
  });


//reading and writing state
  //  const { agent } = useAgent();
  // // Read state set by the agent
  // const tasks = (agent.state.tasks as any[]) ?? [];

  // const handleThemeChange = (theme: string) => {
  //   agent.setState({ 
  //     ...agent.state, 
  //     userPreferences: { theme }, 
  //   }); 
  // };

  //headless
//     const { agent } = useAgent();
//   const { copilotkit } = useCopilotKit();
  
//   const sendMessage = useCallback(async () => {
//     if (!input.trim()) return;
//     agent.addMessage({
//       id: randomUUID(),
//       role: "user",
//       content: input,
//     });
//     setInput("");
//     await copilotkit.runAgent({ agent });
//   }, [input, agent, copilotkit]);

// const stopAgent = useCallback(() => {
//   copilotkit.stopAgent({ agent });
// }, [agent, copilotkit]);


//AGUI
  const { agent } = useAgent();

useEffect(() => {
    const subscription = agent.subscribe({
      // Called on every event
      onEvent({ event, agent }) {
        console.log("Event:", event.type, event);
      },
      // Text message streaming
      onTextMessageContentEvent({ event, textMessageBuffer, agent }) {
        console.log("Streaming text:", textMessageBuffer);
      },
      // Tool calls
      onToolCallEndEvent({ event, toolCallName, toolCallArgs, agent }) {
        console.log("Tool called:", toolCallName, toolCallArgs);
      },
      // State updates
      onStateSnapshotEvent({ event, agent }) {
        console.log("State snapshot:", agent.state);
      },
      // High-level lifecycle
      onMessagesChanged({ agent }) {
        console.log("Messages updated:", agent.messages);
      },
      onStateChanged({ agent }) {
        console.log("State changed:", agent.state);
      },
    });
    return () => subscription.unsubscribe();
  }, [agent]);

  return (
    <main>
      <h1>Your App</h1>
       {/* <h2>Tasks</h2>
      <ul>
        {tasks.map((task, i) => (
          <li key={i}>
            {task.title} — {task.status}
          </li>
        ))}
      </ul>

        <button onClick={() => handleThemeChange("dark")}>Dark Mode</button>
      <button onClick={() => handleThemeChange("light")}>Light Mode</button> */}

{/* 
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agent.messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "ml-auto bg-blue-100 rounded-lg p-3 max-w-md"
                : "bg-gray-100 rounded-lg p-3 max-w-md"
            }
          >
            <p className="text-sm font-medium">{msg.role}</p>
            <p>{msg.content}</p>
          </div>
        ))}
        {agent.isRunning && <div className="text-gray-400">Thinking...</div>}
      </div>

        <form
        className="border-t p-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button type="submit" disabled={agent.isRunning}>
          Send
        </button>
      </form>

       agent.isRunning && (
    <button onClick={stopAgent} className="text-red-500">
      Stop
    </button>
  ); */}
        {/* <ThreadSidebar onSelectThread={setActiveThreadId} /> */}


   <CopilotSidebar 
        defaultOpen={true}
        
        labels={{
          modalHeaderTitle: "Sidebar Assistant",
          welcomeMessageText: "How can I help you today?",
        }}
      />  

       {/* <CopilotChat
      labels={{
        welcomeMessageText: "Hi! How can I assist you today?",
      }}
    /> */}
      
      {/* <CopilotPopup
        labels={{
          modalHeaderTitle: "Popup Assistant",
          welcomeMessageText: "Need any help?",
        }}
      /> */}
       </main>


      
  );
} 