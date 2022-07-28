const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://solarmovie.pe";
const crypto = require("crypto");
const name = "SolarMovie";

async function getCaptchaToken(localURL, key, referrer = null) {
  const uri = `${localURL}:443`;
  //   Convert uri to base64
  const base64 = Buffer.from(uri)
    .toString("base64")
    .replace("\n", "")
    .replace("=", ".");
  const vToken = await axios
    .get(`https://www.google.com/recaptcha/api.js?render=${key}`, {
      headers: {
        // referrer: referrer,
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
  // return response;
}

async function extractM3u8(iframeLink, iframeKey) {
  const mainID = `${String(iframeLink).split("?")[0].split("/").pop()}`;
  const captchaToken = await getCaptchaToken(url, iframeKey);
  const sources = await axios
    .get(
      `https://mzzcloud.life/ajax/${
        String(iframeLink).split("/")[3]
      }/getSources?id=${mainID}&_token=${captchaToken}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )
    .then((r) => {
      return r.data;
    });
  return sources;
}

exports.SearchFlick = async (keyword) => {
  const search = String(keyword).toLowerCase().replace(/\s/g, "-");
  const response = await axios
    .get(`${url}/search/${search}`, {
      headers: { host: "solarmovie.pe" },
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
  const id = String(link).split("-").pop();

  const episodeURL = `${url}/ajax/movie/episodes/${id}`;

  let response = await axios
    .get(`${episodeURL}`, {
      headers: { host: "solarmovie.pe" },
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
  const movieLink = `${url}/watch-movie/${link}.${episodes[0].sourceID}`;

  response = await axios
    .get(`${url}/ajax/get_link/${episodes[0].sourceID}`, {
      headers: { host: "solarmovie.pe" },
    })
    .then((r) => r);

  const keyResponse = await axios
    .get(`${movieLink}`, {
      headers: { host: "solarmovie.pe" },
    })
    .then((r) => r);
  $ = cheerio.load(keyResponse.data);
  //   Get text inside quotes

  const key = String($("script:not([src])")[0].children[0].data).match(
    /\'(.*?)\'/
  )[1];
  const media = await extractM3u8(response.data.link, key, movieLink);
  return {
      url: media.sources[0].file,
      subs: media.tracks.filter(item => item.default || item.label === "English").map(item => {
          return {
            label: item.label,
            url: item.file,
            selected: true,
            kind: item.kind,
            mode: 'showing'
          }
      }),
  };
};
