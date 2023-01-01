const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://flixhq.to";

// const MixDrop = require("../extractors/MixDrop");
const {extractMixDrop} = require('../extractors/MixDrop');
const {extractVidCloud} = require("../extractors/VidCloud");

exports.SearchFlick = async (keyword) => {
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
      type:
        $(el)
          .find("div.film-detail > div.fd-infor > span.float-right")
          .text() === "Movie"
          ? "movie"
          : "series",
    });
  });

  return searchResult.filter((item) => item.type == "movie");
};

exports.loadFlicks = async (id, server = "upcloud") => {
  if(id.startsWith("http")){
    const serverURL = new URL(id);
    
    return extractVidCloud(serverURL, false, url);
  }

  return "OTEN";
};
