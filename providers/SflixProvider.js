const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://sflix.to";
const crypto = require("crypto");
const name = "Sflix";

const pollingData = {
  sid: "",
  upgrades: [],
  pingInterval: 0,
  pingTimeout: 0,
};

function generateTimeStamp(){
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  let code = "";
  let timestamp = Date.now();

  while(timestamp > 0){
    code += chars[timestamp % chars.length];
    timestamp = Math.floor(timestamp / chars.length);

  }
  // Reverse the code
  return code.split("").reverse().join("");
}

async function getNewSID(baseURL){
  for(let i = 0; i < 5; ++i){
      await axios.get(`${baseURL}&t=${generateTimeStamp()}`).then((r) => {
        const json = JSON.parse(String(r.data).slice(1));
        pollingData.sid = json.sid;
        pollingData.pingInterval = json.pingInterval;
        pollingData.pingTimeout = json.pingTimeout;
        pollingData.upgrades = json.upgrades;
      });
  }
}

async function InitPolling(baseURL, refferer){
  
}

async function getCaptchaToken(localURL, key, referrer = null) {
  const uri = `${url}:443`;
  //   Convert uri to base64
  const base64 = Buffer.from(uri)
    .toString("base64")
    .replace("\n", "")
    .replace("=", ".");
  const vToken = await axios
    .get(`https://www.google.com/recaptcha/api.js?render=${key}`, {
      headers: {
        referrer: referrer,
        host: "www.google.com",
      },
    })
    .then((r) => String(r.data).split("releases/")[1].split("/")[0]);
  //   Find releases/ in string
  const recapToken = await axios
    .get(
      `https://www.google.com/recaptcha/api2/anchor?ar=1&hl=en&size=invisible&cb=cs3&k=${key}&co=${base64}&v=${vToken}`,
      {
        headers: {
          referrer: referrer,
          host: "www.google.com",
        },
      }
    )
    .then((r) => {
      const $ = cheerio.load(r.data);
      return $("#recaptcha-token").attr("value");
    });

  const response = await axios
    .post(
      `https://www.google.com/recaptcha/api2/reload?k=${key}`,
      {
        v: vToken,
        k: key,
        c: recapToken,
        co: url,
        sa: "",
        reason: "q",
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((r) => {
      return r.data;
    });
  return String(response)
    .slice(String(response).indexOf('rresp","') + 8)
    .split('"')[0];
}

async function extractRabbitStream(
  iframeLink,
  iframeKey,
  movieLink,
  subtitleCallback = null,
  useSidAuthentication = false
) {
  const mainURL = `https://rapid-cloud.ru/${String(iframeLink).split("/")[3]}`;
  const mainID = `${String(iframeLink).split("?")[0].split("/").pop()}`;

  const response = await axios(iframeLink, {
    headers: { referrer: mainURL },
  }).then((r) => r);
  const $ = cheerio.load(response.data);
  const extractorData = "https://ws11.rabbitstream.net/socket.io/?EIO=4&transport=polling";
  await getNewSID(extractorData);
  return pollingData;
}

exports.SearchFlick = async (keyword) => {
  const search = String(keyword).toLowerCase().replace(/\s/g, "-");
  const response = await axios
    .get(`${url}/search/${search}`, {
      headers: { host: "sflix.to" },
    })
    .then((r) => r);
  const $ = cheerio.load(response.data);
  const item = $("div.flw-item").get();
  const result = item.map((item) => {
    const $ = cheerio.load(item);
    const meta = $("div.fd-infor > span.fdi-item");
    return {
      // Remove white space at the end of string
      title: $("h2.film-name").text().replace("\n", "").trim(),
      link: $("a").attr("href"),
      isMovie: $("a").attr("href").includes("/movie/"),
      // Remove words that are not HD or SD
      quality:
        meta.eq(1).text().replace("\n", "").trim() === "HD" ? "HD" : "SD",
    };
  });
  return result;
};

exports.loadFlicks = async (link) => {
  const isMovie = link.includes("/movie/");
  const id = String(link).split("-").pop();

  const episodeURL = isMovie
    ? `${url}/ajax/movie/episodes/${id}`
    : `${url}/ajax/v2/tv/seasons/${id}`;

  let response = await axios
    .get(`${episodeURL}`, {
      headers: { host: "sflix.to" },
    })
    .then((r) => r);
  let $ = cheerio.load(response.data);
  const result = $("a").get();
  const episodes = result.map((item) => {
    const $ = cheerio.load(item);
    let sourceID = $("a").attr("data-id");
    if (!sourceID) {
      sourceID = $("a").attr("data-linkid");
    }
    return {
      sourceID: sourceID,
    };
  });

  if (episodes.length === 0) {
    return [];
  }
  const movieLink = `${url}${String(link).replace(
    "/movie/",
    "/watch-movie/"
  )}.${episodes[1].sourceID}`;

  response = await axios
    .get(`${url}/ajax/get_link/${episodes[1].sourceID}`, {
      headers: { host: "sflix.to" },
    })
    .then((r) => r);

  const keyResponse = await axios
    .get(`${movieLink}`, {
      headers: { host: "sflix.to" },
    })
    .then((r) => r);
  $ = cheerio.load(keyResponse.data);
  // Get text inside quotes
  const key = String($("script:not([src])")[0].children[0].data).match(
    /\'(.*?)\'/
  )[1];
  const media = await extractRabbitStream(response.data.link, key, movieLink);
  return media;
};
