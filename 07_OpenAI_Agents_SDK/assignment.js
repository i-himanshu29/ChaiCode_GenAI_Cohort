import { Agent, run, tool } from "@openai/agents";
import "dotenv/config";
import { z } from "zod";
import { chromium } from "playwrite";

const browser = await chromium.launch({
  headless: false,
  chromiumSandbox: true,
  env: {},
  args: ["--disable-extensions", "--disable-file-system"],
});

const page = await browser.newPage();

const takeScreenShot = tool({
  name: "take_screenshot",
//   page.screenShot()
});
const openBrowser = tool({
  name: "open_browser",
});

// page.goto();
const openURL = tool({
  name: "open_url",
});

// page.mouse.click();
const clickOnScreen = tool({
  name: "click_screen",
  description:'click on the screen with specific co-ordinates',
  parameters:z.object({
    x:z.number().describe('x axis on the screen where we need to click'),
    y:z.number().describe('Y axis on the screen where we need to click'),
  }),
  async execute(input){
    input.x
    input.y
    page.mouse.click(input.x,input.y)
  }
});
const sendKeys = tool({
  name: "send_keys",
});
const doubleClick = tool({
  name: "double_click",
});
const Scroll = tool({
  name: "scroll",
});

const websiteAutomationAgent = new Agent({
  name: "Website Automation Agent",
  instructions: `
    You are this and that agent

  Rules:
  - Always call the 'take_screenshot' tool after each step to see what is happening on the screen.
  - After taking screenshot , plan the next action what needs to be done.
  `,
});

// go to ui.chaicode.com and submit the contact form with these details
// 'playwrite' is used to control the browser
// 'selenium'
// puppeteer