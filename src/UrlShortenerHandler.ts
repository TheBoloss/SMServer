import OpenAI from "openai";
import { serverLog } from "./Logging.js";
import * as cheerio from "cheerio";

export const GetShortenedUrl = async (url: string): Promise<string> => {
  const errorMessage =
    "Une erreur est survenue. Veuillez réessayer ultérieurement.";

  try {
    // const page = await fetch("https://xn--9ca.info").then((r) => r.text());
    // const $page = cheerio.load(page);

    // console.log("a");
    // const token = $page("#form__token").val();
    // console.log(token);
    // if (typeof token !== "string") return errorMessage;
    // console.log("b");
    // const params = new URLSearchParams();
    // params.append("form[url]", "https://babar.com");
    // params.append("form[Shorten]", "");
    // params.append("form[_token]", token);
    // console.log(params.toString());
    // const request = await fetch(`https://xn--9ca.info`, {
    //   credentials: "include",
    //   method: "POST",
    //   // headers: {
    //   //   "Content-Type": "application/x-www-form-urlencoded",
    //   // },
    //   headers: {
    //     "User-Agent":
    //       "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
    //     Accept:
    //       "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    //     "Accept-Language": "en-US,en;q=0.5",
    //     "Content-Type": "application/x-www-form-urlencoded",
    //     "Upgrade-Insecure-Requests": "1",
    //     "Sec-Fetch-Dest": "document",
    //     "Sec-Fetch-Mode": "navigate",
    //     "Sec-Fetch-Site": "same-origin",
    //     "Sec-Fetch-User": "?1",
    //     "Sec-GPC": "1",
    //     Priority: "u=0, i",
    //   },
    //   referrer: "https://xn--9ca.info/",
    //   body: params.toString(),
    //   mode: "cors",
    // });
    // console.log(request.status);
    // console.log(await request.text());
    // if (!request.ok) return errorMessage;

    // const html = await request.text();
    // console.log(html);

    // const $ = cheerio.load(html);
    // console.log("d");
    // const link = $('h2:contains("Link created!")').next("a").attr("href");
    // console.log(link);
    const BASE_URL = "https://xn--9ca.info/";

    try {
      // --- 1️⃣ GET initial : récupère le token ET le cookie ---
      const getResponse = await fetch(BASE_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Node.js Script)",
          Accept: "text/html",
        },
      });

      const html = await getResponse.text();
      const tokenMatch = html.match(/name="form\[_token\]" value="([^"]+)"/);
      if (!tokenMatch) return errorMessage;

      const csrfToken = tokenMatch[1];

      const setCookieHeader = getResponse.headers.get("set-cookie");
      if (!setCookieHeader) return errorMessage;
      const sessionCookie = setCookieHeader.split(";")[0];

      const formData = new URLSearchParams({
        "form[url]": url,
        "form[Shorten]": "",
        "form[_token]": csrfToken,
      });

      const postResponse = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Node.js Script)",
          Accept: "text/html,application/xhtml+xml",
          Referer: BASE_URL,
          Cookie: sessionCookie,
        },
        body: formData.toString(),
      });

      const resultHtml = await postResponse.text();

      const $ = cheerio.load(resultHtml);
      const link = $('h2:contains("Link created!")').next("a").attr("href");
      // const linkMatch = resultHtml.match(/https?:\/\/xn--9ca\.info\/\S+/);
      // const shortenedUrl = linkMatch ? linkMatch[0].toString() : null;
      if (link) {
        return link;
      } else {
        return errorMessage;
      }
    } catch (err) {
      return errorMessage;
    }
  } catch (error) {
    return errorMessage;
  }
};
