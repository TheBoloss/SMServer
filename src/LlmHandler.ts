import OpenAI from "openai";
import { serverLog } from "./Logging.js";

export const GetLlmAnswer = async (prompt: string): Promise<string | null> => {
  if (!process.env.OPENROUTER_API_KEY) return "";
  // console.log("a");
  serverLog(`Waiting for OpenAI API response... [${prompt}]`);

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    // defaultHeaders: {
    //   "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    //   "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    // },
  });
  // console.log("b");

  try {
    // console.log("c");
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "system",
          content: `
          You are a helpful and concise assistant.
          Always write answers in the language of the user.
          The user talks with you by SMS, so write short answers, don't use emojis and text formatting at all.
        `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    // console.log("d");

    return completion.choices[0].message.content;
  } catch (error: any) {
    let msg = String(error);
    if (error.response) {
      msg = `${error.response.status} ${JSON.stringify(error.response.data)}`;
    }
    serverLog(`❌ OpenAI API Error: ${msg}`);
    console.error("openai error details", error);
    return msg;
  }
};
