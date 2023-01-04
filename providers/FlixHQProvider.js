const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://flixhq.to";

// const MixDrop = require("../extractors/MixDrop");
const { extractMixDrop } = require("../extractors/MixDrop");
const { extractVidCloud } = require("../extractors/VidCloud");

const search = async (keyword, type = "movie") => {
  const searchResult = [];

  const { data } = await axios.get(
    `${url}/search/${keyword.replace(/[\W_]+/g, "-")}`
  );
  const $ = cheerio.load(data);

  $(".film_list-wrap > div.flw-item").each((i, el) => {
    const releaseDate = $(el)
      .find("div.film-detail > div.fd-infor > span:nth-child(1)")
      .text();
    searchResult.push({
      id: $(el).find("div.film-poster > a").attr("href")?.slice(1),
      title: $(el).find("div.film-detail > h2 > a").attr("title"),
      url: `${url}${$(el).find("div.film-poster > a").attr("href")}`,
      image: $(el).find("div.film-poster > img").attr("data-src"),
      releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
      seasons: releaseDate.includes("SS")
        ? parseInt(releaseDate.split("SS")[1])
        : undefined,
      type:
        $(el)
          .find("div.film-detail > div.fd-infor > span.float-right")
          .text() === "Movie"
          ? "movie"
          : "series",
    });
  });

  return searchResult.filter((item) => item.type == type);
};
exports.SearchFlick = async (keyword) => {
  return await search(keyword, "movie");
};

exports.loadFlicks = async (id, server = "upcloud") => {
  const serverURL = new URL(`${url}/movie/${id}`);

  return await extractVidCloud(serverURL, false, url);
};

exports.SearchSeries = async (keyword) => {
  return await search(keyword, "series");
};

exports.loadSeriesEpisodes = async (id) => {
  const response = await axios.get(`${url}/tv/${id}`).then((r) => r.data);

  const $ = cheerio.load(response);
  const uid = $(".watch_block").attr("data-id");
  const ajax_request = (id, type, isSeasons = false) =>
    `${url}/ajax/${type === "movie" ? type : `v2/${type}`}/${
      isSeasons ? "seasons" : "episodes"
    }/${id}`;
  
  // return ajax_request(uid, "tv", false);
  const { data } = await axios.get(ajax_request(uid, "tv", true));

  const $$ = cheerio.load(data);

  const seasonsIds = $$(".dropdown-menu > a")
    .map((i, el) => $(el).attr("data-id"))
    .get();

  const episodes = [];
  let season = 1;
  for (let i = 0; i < seasonsIds.length; ++i) {
    const { data } = await axios.get(ajax_request(seasonsIds[i], "season"));
    const $$$ = cheerio.load(data);
    try{
      $$$(".nav > li")
      .map((i, el) => {
        const episode = {
          id: $$$(el).find("a").attr("id").split("-")[1],
          title: $$$(el).find("a").attr("title"),
          number: parseInt(
            $$$(el).find("a").attr("title").split(":")[0].slice(3).trim()
          ),
          season: season,
          url: `${url}/ajax/v2/episode/servers/${
            $$$(el).find("a").attr("id").split("-")[1]
          }`,
        };
        episodes.push(episode);
      })
      .get();

      season++;
    }catch (e){
      throw new Error((e).message);
    }
  }

  return episodes;
};

exports.loadSeriesEpisode = async (id) => {
  const serverURL = new URL(`${url}/tv/${id}`);

  return await extractVidCloud(serverURL, false, url);
};
