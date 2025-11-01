import OpenAI from "openai";
import { serverLog } from "./Logging.js";

export const GetWeather = async (city: string): Promise<string> => {
  const errorMessage =
    "Une erreur est survenue durant l'obtention des données météo. Veuillez réessayer ultérieurement.";

  try {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
    );
    if (!request.ok) return errorMessage;
    const json = await request.json();
    if (json.cod != "200") return errorMessage;

    let response = `Prévisions météo pour ${json.city.name} :\n`;
    json.list.slice(0, 5).forEach((l: any) => {
      const time = l.dt_txt.split(" ")[1].split(":")[0] + "h";
      const temp = Math.round(l.main.temp * 10) / 10;
      response += `\n${time} : ${temp}°C ${l.weather[0].main}`;
    });
    return response;
  } catch (error) {
    return errorMessage;
  }
};
