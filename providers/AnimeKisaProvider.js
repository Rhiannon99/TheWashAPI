const cheerio = require("cheerio");
const got = require("got");
const url = "https://animekisa.in";

exports.SearchAnime = async (keyword) => {
  const response = await got(`${url}/search/?keyword=${keyword}`);
  const $ = cheerio.load(response.body);
  const result = $(".flw-item").get();
  const regex = new RegExp("-episode-.*\\b|-episode-full", "gm");

  return result.map((item) => {
    const $ = cheerio.load(item);
    return {
      title: $("a").text(),
      link: String($("a").attr("href"))
        .replace("watch/", "anime/")
        .replace(regex, ""),
      image: $("img").attr("data-src"),
    };
  });
};
