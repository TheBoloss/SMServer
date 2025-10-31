import { ConfigFile, Message } from "./Types.js";
import { GetLlmAnswer } from "./LlmHandler.js";
import { serverLog } from "./Logging.js";
import { SendMessage } from "./SendMessage.js";
import fs from "fs";
import yaml from "yaml";

export default async function HandleMessage(message: Message) {
  const configFile = fs.readFileSync("./config.yml", "utf8");
  const config: ConfigFile = yaml.parse(configFile).config;

  serverLog(
    `📥 Incoming SMS from ${message.Phone}: [#${
      message.Index
    }] ${message.Content.trim().replace("\n", " ")}`
  );

  if (config.enable_whitelist && !config.whitelist.includes(message.Phone)) {
    serverLog(`Number ${message.Phone} is not whitelisted.`);
    return;
  }

  const isAdmin = config.admin_list.includes(message.Phone);

  if (
    message.Content.trim() !== "" &&
    message.Content.trim().split(" ").length
  ) {
    const command = message.Content.trim().split(" ")[0].toLowerCase();

    let response: string = "";

    switch (command) {
      case "time":
        response = new Date().toISOString();
        break;

      case "chatgpt":
      case "gpt":
      case "llm":
      case "ai":
      case "ia":
        const prompt = message.Content.trim().split(" ").slice(1).join(" ");
        const temp = await GetLlmAnswer(prompt);

        response = temp != null ? temp : "";
        break;
      case "test":
        response = "test";
        break;
      case "help":
        if (!isAdmin) break;
        response = `Welcome to SMServer!\nList of commands:\n\n- time — Display date and time\n\n- gpt <your_request> — Prompt for ChatGPT\n\n- test — Test request\n\n- forward <number> <message> — Forward a message to a specified number`;
        break;
    }

    if (response) {
      SendMessage(response, message.Phone);
    }
  }
}
