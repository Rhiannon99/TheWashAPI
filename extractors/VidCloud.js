const cheerio = require("cheerio");
const axios = require("axios");
const crypto = require("crypto-js");
const host = "https://dokicloud.one";
const host2 = "https://rabbitstream.net";

const getServer = async (mediaID, episodeID, baseURL) => {
  if (!episodeID.startsWith(baseURL + "/ajax") && !mediaID.includes("movie")) {
    episodeID = `${baseURL}/ajax/v2/episode/servers/${episodeID
      .split("-")
      .pop()}`;
  } else {
    episodeID = `${baseURL}/ajax/movie/episodes/${episodeID.split("-").pop()}`;
  }

  const response = await axios.get(episodeID).then((r) => r);
  const $ = cheerio.load(response.data);

  const servers = $(".nav > li")
    .map((i, el) => {
      const server = {
        name: mediaID.includes("movie")
          ? $(el).find("a").attr("title").toLowerCase()
          : $(el).find("a").attr("title").slice(6).trim().toLowerCase(),
        url: `${baseURL}${mediaID}.${
          !mediaID.includes("movie")
            ? $(el).find("a").attr("data-id")
            : $(el).find("a").attr("data-linkid")
        }`.replace(
          !mediaID.includes("movie") ? /\/tv\// : /\/movie\//,
          !mediaID.includes("movie") ? "/watch-tv/" : "/watch-movie/"
        ),
      };
      return server;
    })
    .get();
  return servers[0].url.split(".").pop();
};

exports.extractVidCloud = async (videoURL, isAlternative = false, baseURL) => {
  // LMAO
  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  let result_sources = [];
  const sources_object = {
    sources: [],
    subtitle: [],
  };

  let res = undefined;
  let sources = [];

  const id = videoURL.href.split("/").pop()?.split("?")[0];
  const options = {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Referer: videoURL.href,
      Host: isAlternative ? "rabbitstream.net" : "dokicloud.one",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    },
  };
  const server_id = await getServer(videoURL.pathname, id, baseURL).then(
    (r) => r
  );
  const source_id = await axios
    .get(`${baseURL}/ajax/sources/${server_id}`)
    .then((r) => r.data);
  //   return `${isAlternative ? host2 : host}/ajax/embed-4/getSources?id=${source_id.link?.split("/").pop().split("?")[0]}`;
  res = await axios
    .get(
      `${isAlternative ? host2 : host}/ajax/embed-4/getSources?id=${
        source_id.link?.split("/").pop().split("?")[0]
      }`,
      options
    )
    .then((r) => r);
  if (!isJson(res.data.sources)) {
    const key = await axios
      .get(
        "https://raw.githubusercontent.com/consumet/rapidclown/rabbitstream/key.txt"
      )
      .then((r) => r);
    sources = JSON.parse(
      crypto.AES.decrypt(res.data.sources, key.data).toString(crypto.enc.Utf8)
    );
  }

  result_sources = sources.map((s) => ({
    url: s.file,
    isM3U8: s.file.includes(".m3u8"),
  }));
  sources_object.sources.push(...result_sources);
  sources_object.sources = [];
  result_sources = [];
  for (const source of sources) {
    const data = await axios
      .get(source.file)
      .then((r) => r.data)
      .catch((error) => error);
    const urls = data.split("\n").filter((line) => line.includes(".m3u8"));
    const qualities = data
      .split("\n")
      .filter((line) => line.includes("RESOLUTION="));

    const TdArray = qualities.map((s, i) => {
      const f1 = s.split("x")[1];
      const f2 = urls[i];

      return [f1, f2];
    });

    for (const [f1, f2] of TdArray) {
      result_sources.push({
        url: f2,
        quality: f1,
        isM3U8: f2.includes(".m3u8"),
      });
    }

    sources_object.sources.push(...result_sources);
  }

  sources_object.sources.push({
    url: sources[0].file,
    isM3U8: sources[0].file.includes(".m3u8"),
    quality: "auto",
  });

  sources_object.subtitles = res.data.tracks.map((s) => ({
    url: s.file,
    lang: s.label ? s.label : "Default (maybe)",
  }));

  return sources_object;
};
