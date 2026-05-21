"use client";
import { CopilotSidebar ,CopilotChat,CopilotPopup  } from "@copilotkit/react-core/v2"; 
import { useComponent } from "@copilotkit/react-core/v2"; 
import { z } from "zod";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2"
import { useAgent } from "@copilotkit/react-core/v2"; 
import { useAgentContext } from "@copilotkit/react-core/v2"; 
import { useState } from "react";
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


export default function Page() {
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
      </ul> */}

        {/* <button onClick={() => handleThemeChange("dark")}>Dark Mode</button>
      <button onClick={() => handleThemeChange("light")}>Light Mode</button> */}
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