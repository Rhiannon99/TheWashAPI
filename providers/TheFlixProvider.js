const cheerio = require("cheerio");
const axios = require("axios");
const { request } = require("urllib");
const url = "https://theflix.to";

async function getCookies() {
  const cookies = await request(
    `${url}:5679/authorization/session/continue?contentUsageType=Viewing`,
    {
      method: "POST",
      headers: {
        Host: "theflix.to:5679",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        // "Accept-Language": "en-US,en;q=0.5",
        // "Content-Type": "application/json;charset=utf-8",
        // "Content-Length": "35",
        Origin: url,
        // DNT: "1",
        // Connection: "keep-alive",
        Referer: `${url}/`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
      },
    }
  ).then((r) => {
    return r.headers["set-cookie"];
  });
  return cookies.slice(0, 2).join("; ");
}

exports.SearchFlick = async (keyword) => {
  //    Remove all spaces
  query = keyword.replace(/\s/g, "+");

  const response = await axios
    .get(`${url}/movies/trending?search=${query}`)
    .then((r) => r.data);
  const $ = cheerio.load(response);
  const json = JSON.parse($("script[type=application/json]").first().html());
  const result = json.props.pageProps.mainList.docs
    .map((item) => {
      return {
        id: item.id,
        available: item.available,
        title: item.name,
        link: `/movie/${item.id}-${String(item.name)
          .toLowerCase()
          .replace(/\W/g, "-")
          .replace(/-$/g, "")
          .replace(/--+/g, "-")}`,
      };
    })
    .filter((item) => item.available);
  return result;
};

exports.SearchSeries = async (keyword) => {
  //    Remove all spaces
  query = keyword.replace(/\s/g, "+");

  const response = await axios
    .get(`${url}/tv-shows/trending?search=${query}`)
    .then((r) => r.data);
  const $ = cheerio.load(response);
  const json = JSON.parse($("script[type=application/json]").first().html());
  const result = json.props.pageProps.mainList.docs
    .map((item) => {
      return {
        id: item.id,
        available: item.available,
        title: item.name,
        link: `/tv-show/${item.id}-${String(item.name)
          .toLowerCase()
          .replace(/\W/g, "-")
          .replace(/-$/g, "")
          .replace(/--+/g, "-")}`,
      };
    })
    .filter((item) => item.available);
  return result;
};

exports.loadSeriesEpisodes = async (link) => {
  const cookie = await getCookies();
  const response = await axios
    .get(`${url}/tv-show/${link}/season-1/episode-1`, {
      headers: {
        Cookie: cookie,
      },
    })
    .then((r) => r.data);
  const $ = cheerio.load(response);
  const json = JSON.parse($("script[type=application/json]").first().html());
  const props = json.props.pageProps.selectedTv.seasons;
  const links = props.map((season, index) => {
    return {
      id: index,
      name: season.name,
      episodes: season.episodes.map((episode) => {
        return {
          id: episode.id,
          name: episode.name,
          videos: episode.videos[0],
        };
      }),
    };
  });

  return links;
};

exports.loadSeriesEpisode = async (id) => {
  const cookie = await getCookies();
  const media = await axios
    .get(
      `${url}:5679/tv/videos/${id}/request-access?contentUsageType=Viewing`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    )
    .then((r) => r.data);
  return media;
};

exports.loadFlicks = async (link) => {
  const cookie = await getCookies();
  const response = await axios
    .get(`${url}/movie/${link}`, {
      headers: {
        Cookie: cookie,
      },
    })
    .then((r) => r.data);
  const $ = cheerio.load(response);
  const json = JSON.parse($("script[type=application/json]").first().html());
  const serviceURL = json.runtimeConfig?.Services?.Server?.Url;
  const id = json.props?.pageProps?.movie?.videos[0];
  const media = await axios
    .get(
      `${serviceURL}/movies/videos/${id}/request-access?contentUsageType=Viewing`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    )
    .then((r) => r.data);

  return media;
};
