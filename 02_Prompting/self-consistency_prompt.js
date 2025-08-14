import 'dotenv/config';
import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';

// --- Setup OpenAI & Gemini ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Serialize history for Gemini ---
function serializeHistory(messages, max = 14) {
  return messages
    .slice(-max)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');
}

// --- Gemini Judge ---
async function reviewWithGemini(messages) {
  const transcript = serializeHistory(messages);
  const prompt = `
You are an external reviewer for an agent that emits steps: START, THINK, EVALUATE, OUTPUT.
Your job: Read the conversation and strictly return a single JSON object like:
{"step":"EVALUATE","content":"<short critique or 'Looks good'>"}
Keep it under 280 characters. Return ONLY JSON, nothing else.

Conversation transcript:
${transcript}
`;

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    });

    const text = response?.response?.text?.();
    const parsed = JSON.parse(text);

    if (parsed?.step === 'EVALUATE' && typeof parsed?.content === 'string') {
      return parsed;
    }
    throw new Error('Invalid Gemini output');
  } catch (err) {
    console.error('⚠ Gemini judge failed:', err.message);
    return { step: 'EVALUATE', content: 'Review unavailable; continue.' };
  }
}

// --- Self-consistency runner for OUTPUT step ---
async function selfConsistencyOutput(messages, numSamples = 5) {
  const answers = [];

  for (let i = 0; i < numSamples; i++) {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 1.0, // encourage different reasoning
      messages: messages,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(resp.choices[0].message.content);
    if (parsed?.step === 'OUTPUT') {
      answers.push(parsed.content);
    }
  }

  // Count frequency
  const frequency = answers.reduce((acc, ans) => {
    acc[ans] = (acc[ans] || 0) + 1;
    return acc;
  }, {});

  // Pick most common
  const final = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];

  console.log('\n📊 Frequency table:', frequency);
  console.log(`\n✅ Self-consistent OUTPUT: ${final}`);

  return final;
}

// --- Main loop ---
async function main() {
  const SYSTEM_PROMPT = `
You are an AI assistant who works on START, THINK and OUTPUT format.
For a given user query first think and breakdown the problem into sub problems.
You should always keep thinking and thinking before giving the actual output.
Also, before outputting the final result to user you must check once if everything is correct.

Rules:
- Strictly follow the output JSON format
- Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
- After every THINK, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
- Always perform only one step at a time and wait for other step.
- Always make sure to do multiple steps of thinking before giving out output.

Output JSON Format:
{ "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }
`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: 'Write a code in JS to find a prime number as fast as possible' },
  ];

  let turn = 0;
  while (true) {
    turn++;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const parsedContent = JSON.parse(response.choices[0].message.content);
    messages.push({ role: 'assistant', content: JSON.stringify(parsedContent) });

    if (parsedContent.step === 'START') {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === 'THINK') {
      console.log(`\t🧠`, parsedContent.content);

      // Get Gemini review
      const evalMsg = await reviewWithGemini(messages);

      messages.push({
        role: 'developer',
        content: JSON.stringify(evalMsg),
      });
      continue;
    }

    if (parsedContent.step === 'OUTPUT') {
      console.log(`🤖 First OUTPUT received, running self-consistency check...`);
      const finalAnswer = await selfConsistencyOutput(messages, 5);
      console.log(`\n🎯 Final Self-Consistent Answer: ${finalAnswer}`);
      break;
    }

    // Safety stop
    if (turn > 50) {
      console.error('⚠ Stopping to prevent infinite loop');
      break;
    }
  }

  console.log('Done...');
}

main();
