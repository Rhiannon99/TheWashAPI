const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://www.gogoanime.dk";
const crypto = require("crypto");
const { extractGogoCDN } = require("../extractors/GogoCDN");

exports.SearchAnime = async (keyword, page = 1) => {
  // Encode keyword for URL

  const res = await axios.get(
    `${url}/search.html?keyword=${encodeURIComponent(keyword)}&page=${page}`
  );

  const $ = cheerio.load(res.data);
  const searchResult = [];
  $("div.last_episodes > ul > li").each((i, el) => {
    searchResult.push({
      id: `anime/${$(el).find("p.name > a").attr("href")?.split("/")[2]}`,
      title: $(el).find("p.name > a").attr("title"),
      url: `${url}${$(el).find("p.name > a").attr("href")}`,
      image: $(el).find("div > a > img").attr("src"),
      releaseDate: $(el).find("p.released").text().trim(),
      subOrDub: $(el).find("p.name > a").text().toLowerCase().includes("dub")
        ? "dub"
        : "sub",
    });
  });

  return searchResult;
};

exports.loadEpisodes = async (id) => {
  const ajax_url = "https://ajax.gogo-load.com/ajax";
  if (!id.includes("gogoanime")) {
    id = `/category/${id}`;
  }
  const res = await axios.get(`${url}${id}`);
  const $ = cheerio.load(res.data);
  const ep_start = $("#episode_page > li").first().find("a").attr("ep_start");
  const ep_end = $("#episode_page > li").last().find("a").attr("ep_end");
  const movie_id = $("#movie_id").attr("value");
  const alias = $("#alias_anime").attr("value");

  const html = await axios.get(
    `${ajax_url}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
  );
  const $$ = cheerio.load(html.data);

  episodes = [];

  $$("#episode_related > li").each((i, el) => {
    episodes.push({
      id: $(el).find("a").attr("href")?.split("/")[1],
      number: parseFloat($(el).find(`div.name`).text().replace("EP ", "")),
      url: `${url}${$(el).find(`a`).attr("href")?.trim()}`,
    });
  });
  episodes = episodes.reverse();

  return episodes;
};

exports.loadEpisode = async (id) => {
    // const serverURL = new URL(`${url}/${id}`);
    const vidstream_server = await axios.get(`${url}/${id}`);

    const $ = cheerio.load(vidstream_server.data);

    const serverURL = new URL(`https:${$('div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a').attr('data-video')}`);
    return await extractGogoCDN(serverURL, false, url);
};
