import { ConfigFile, Message } from "./Types.js";
import { GetLlmAnswer } from "./LlmHandler.js";
import { serverLog } from "./Logging.js";
import { SendMessage } from "./SendMessage.js";
import fs from "fs";
import yaml from "yaml";
import { GetWeather } from "./WeatherHandler.js";
import { GetShortenedUrl } from "./UrlShortenerHandler.js";

export default async function HandleMessage(message: Message) {
  const configFile = fs.readFileSync("./config.yml", "utf8");
  const config: ConfigFile = yaml.parse(configFile).config;

  serverLog(
    `📥 Incoming SMS from ${message.Phone}: [#${
      message.Index
    }] ${message.Content.trim().replace("\n", " ")}`,
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
      case "ask":
        const prompt = message.Content.trim().split(" ").slice(1).join(" ");

        if (prompt != "") {
          const temp = await GetLlmAnswer(prompt, isAdmin);
          response = temp != null ? temp : "";
        } else response = "Usage :\ngpt <your request>";
        break;

      case "ping":
        response = "Pong";
        break;

      case "help":
        response = `Bienvenue sur SMServer !\n`;
        response += `Liste des commandes :\n\n`;
        response += `- time — Date et heure\n\n`;
        response += `- gpt <your request> — Prompt à ChatGPT\n\n`;
        response += `- weather <city> — Prévision météo de la ville\n\n`;
        response += `- ping — Requête de test`;
        if (isAdmin)
          response += `\n\n- forward <number> <message> — Transférer un message à un numéro`;
        break;

      case "weather":
        const city = message.Content.trim().split(" ").slice(1).join(" ");

        response = await GetWeather(city);

        break;

      // case "shorten":
      // case "short":
      // case "url":
      //   console.log("aaa");

      //   const url = message.Content.trim().split(" ").slice(1).join(" ");
      //   console.log(url);

      //   const short = await GetShortenedUrl(url);
      //   console.log(short);
      //   response = short;
      //   break;

      case "forward":
        if (!isAdmin) break;
        const phone = message.Content.trim().split(" ")[1];
        const msg = message.Content.trim().split(" ").slice(2).join(" ");
        SendMessage(msg, phone);
        response = "Message transféré";
        break;

      default:
        response = "Commande inconnue. Tapez HELP pour la liste des commandes.";

        if (
          message.Content.trim().startsWith("http://") ||
          message.Content.trim().startsWith("https://")
        ) {
          response = await GetShortenedUrl(message.Content.trim());
        }
        break;
    }

    if (response) {
      SendMessage(response, message.Phone);
    }
  }
}
