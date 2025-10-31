import { Connection } from "huawei-lte-api";
import { Device } from "huawei-lte-api/dist/api/Device.js";
import { Sms } from "huawei-lte-api/dist/api/Sms.js";
import { serverLog } from "./Logging.js";

export const SendMessage = (text: string, phone: string) => {
  if (!process.env.CONNECTION_URL) return;

  const connection = new Connection(process.env.CONNECTION_URL, 15000);

  connection.ready.then(() => {
    const sms = new Sms(connection);
    sms
      .sendSms([phone], text)
      .then((result) => {
        if (result == "OK") {
          serverLog(`📤 Outgoing SMS to ${phone}: ${text}`);
        } else {
          serverLog(`❌ Error sending SMS to ${phone}: ${text}`);
        }
      })
      .catch((error) => {
        serverLog(`❌ Error sending SMS to ${phone}: ${text} (${error})`);
      });
  });
};
