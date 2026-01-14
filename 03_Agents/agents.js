import 'dotenv/config';
import { OpenAI } from 'openai';
import axios from 'axios';
import { exec } from 'child_process';

// getWeatherDetailsByCity - to get current weather details of the city using wttr.in api
async function getWeatherDetailsByCity(cityname = '') {
  const url = `https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: 'text' });
  return `The current weather of ${cityname} is ${data}`;
}

// exec - to run linux / unix commands and return the output
// It takes command as string and returns the output of the command
async function executeCommand(cmd = '') {
  return new Promise((res, rej) => {
    exec(cmd, (error, data) => {
      if (error) {
        return res(`Error running command ${error}`);
      } else {
        res(data);
      }
    });
  });
}

// getGithubUserInfoByUsername - to get public info about github user using github api
async function getGithubUserInfoByUsername(username = '') {
  const url = `https://api.github.com/users/${username.toLowerCase()}`;
  const { data } = await axios.get(url);
  return JSON.stringify({
    login: data.login,
    id: data.id,
    name: data.name,
    location: data.location,
    twitter_username: data.twitter_username,
    public_repos: data.public_repos,
    public_gists: data.public_gists,
    user_view_type: data.user_view_type,
    followers: data.followers,
    following: data.following,
  });
}

// Map of available tools
const TOOL_MAP = {
  getWeatherDetailsByCity: getWeatherDetailsByCity,
  getGithubUserInfoByUsername: getGithubUserInfoByUsername,
  executeCommand: executeCommand,
};

const client = new OpenAI();

// Main function to run the agent loop
async function main() {
  // These api calls are stateless (Chain Of Thought)
  // So we need to maintain the state of the conversation
  const SYSTEM_PROMPT = `
    You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.
    
    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools that you can call based on user query.
    
    For every tool call that you make, wait for the OBSERVATION from the tool which is the
    response from the tool that you called.

    Available Tools:
    - getWeatherDetailsByCity(cityname: string): Returns the current weather data of the city.
    - getGithubUserInfoByUsername(username: string): Retuns the public info about the github user using github api
    - executeCommand(command: string): Takes a linux / unix command as arg and executes the command on user's machine and returns the output

    Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool

    Output JSON Format:
    { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }

    Example:
    User: Hey, can you tell me weather of Patiala?
    ASSISTANT: { "step": "START", "content": "The user is intertested in the current weather details about Patiala" } 
    ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
    ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCity which returns current weather data" } 
    ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCity for city patiala to get weather details" }
    ASSISTANT: { "step": "TOOL", "input": "patiala", "tool_name": "getWeatherDetailsByCity" }
    DEVELOPER: { "step": "OBSERVE", "content": "The weather of patiala is cloudy with 27 Cel" }
    ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Patiala" }
    ASSISTANT: { "step": "OUTPUT", "content": "The weather in Patiala is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️" }
  `;

  // Initial messages
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content:
        // 'In the current directly, read the changes via git and push the changes to github with good commit message',
        'Hey , create a folder todo_app and create a simple todo application using html , css and js ',
    },
  ];

  // Agent loop
  while (true) {
    // Call the OpenAI chat completion API
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: messages,
    });
    // Parse the response
    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);
    // Add the assistant response to messages
    messages.push({
      role: 'assistant',
      content: JSON.stringify(parsedContent),
    });
    // Handle the response based on the step
    if (parsedContent.step === 'START') {
      console.log(`🔥`, parsedContent.content);
      continue;
    }
    // Handle THINK step
    if (parsedContent.step === 'THINK') {
      console.log(`\t🧠`, parsedContent.content);
      continue;
    }
    // Handle TOOL step
    if (parsedContent.step === 'TOOL') {
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: 'developer',
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🛠️: ${toolToCall}(${parsedContent.input}) = `,
        responseFromTool
      );
      messages.push({
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }),
      });
      continue;
    }
    // Handle OUTPUT step
    if (parsedContent.step === 'OUTPUT') {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log('Done...');
}

main();