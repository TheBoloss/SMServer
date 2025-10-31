import { Connection } from "huawei-lte-api";
import { Device } from "huawei-lte-api/dist/api/Device.js";
import { Sms } from "huawei-lte-api/dist/api/Sms.js";
import { serverLog } from "./Logging.js";
import HandleMessage from "./HandleMessage.js";
import { exit } from "process";
import { Message } from "./Types.js";

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

if (!process.env.CONNECTION_URL) exit();

const connection = new Connection(process.env.CONNECTION_URL, 15000);

console.log(
  `\n \x1b[32m╔═══════════════════════╗
 ║  \x1b[0m\x1b[1mWelcome to SMServer  \x1b[32m║
 ╚═══════════════════════╝\n\x1b[0m`
);
console.log("Server is starting, please wait.\n");
serverLog("Connecting to modem...\n");

connection.ready.then(async () => {
  serverLog("Connected!");

  const device = new Device(connection);
  const sms = new Sms(connection);

  try {
    const info = await device.information();
    serverLog(`Modem state: ${info.workmode}`);
  } catch (error) {
    console.error("Failed to get modem info:", error);
  }

  let knownMessageIds: Set<number> = new Set();

  let lastKnownIndex = 0;
  const pollInterval = 1000;
  serverLog("Starting SMS watcher...");

  async function fetchMessages(): Promise<Message[]> {
    try {
      const smsList: any = await sms.getSmsList();
      if (!smsList?.Messages?.Message) return [];

      const messages: Message[] = Array.isArray(smsList.Messages.Message)
        ? smsList.Messages.Message
        : [smsList.Messages.Message];
      if (!messages) return [];

      return messages.reverse();
    } catch (err) {
      console.error("Error while fetching SMS:", err);
      return [];
    }
  }

  const initialMessages = await fetchMessages();
  if (initialMessages.length > 0) {
    lastKnownIndex = Number(initialMessages[initialMessages.length - 1].Index);
    serverLog(`Initial last SMS index: ${lastKnownIndex}`);
  } else {
    serverLog("No SMS found at startup.");
  }

  // Boucle de surveillance
  async function pollForNewSMS() {
    const messages = await fetchMessages();
    const newMessages = messages.filter(
      (msg) => Number(msg.Index) > lastKnownIndex
    );

    if (newMessages.length > 0) {
      for (const msg of newMessages) {
        HandleMessage(msg);
      }
      // Met à jour le dernier index connu
      lastKnownIndex = Number(newMessages[newMessages.length - 1].Index);
    }
  }

  setInterval(pollForNewSMS, pollInterval);

  // Initialisation — on mémorise les messages existants
  // await fetchMessages();

  // Boucle de polling continue
  // setInterval(fetchMessages, pollInterval);

  // // Can be accessed without authorization
  // device
  //   .signal()
  //   .then((result) => {
  //     // console.log(result);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  // // Needs valid authorization, will throw exception if invalid credentials are passed in URL
  // device
  //   .information()
  //   .then((result) => {
  //     // console.log(result);
  //     serverLog("Modem state: " + result.workmode);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
});
