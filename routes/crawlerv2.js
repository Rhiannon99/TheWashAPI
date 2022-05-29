const express = require("express");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const router = express.Router();
const cheerio = require("cheerio");
const got = require("got");
const url = "https://animekisa.in";
const hasMainPage = true;
router.post("/v2/search-anime", (req, res) => {
  // Join spaces with +
  const search = req.body.search.split(" ").join("+");
  (async () => {
    const response = await got(`${url}/search/?keyword=${search}`);
    const $ = cheerio.load(response.body);
    const result = $(".flw-item").get();
    const regex = new RegExp("-episode-.*\\b|-episode-full", "gm");
    res.json(
      result.map((item) => {
        const $ = cheerio.load(item);
        return {
          title: $("a").text(),
          link: String($("a").attr("href"))
            .replace("watch/", "anime/")
            .replace(regex, ""),
          image: $("img").attr("data-src"),
        };
      })
    );
  })();
});

router.get("/v2/load-anime/:link", (req, res) => {
  (async () => {
    const response = await got(`${url}/anime/${req.params.link}/`);
    const $ = cheerio.load(response.body);
    const result = $("div.tab-content ul li.nav-item").get();
    res.json(
      result.map((item, index) => {
        const $ = cheerio.load(item);
        return {
          label: index + 1,
          link: String($("a").attr("href")),
        };
      })
    );
  })();
});

router.post("/v2/play-anime", (req, res) => {
  (async () => {
    const response = await got(`${url}/watch/${req.body.link}/`);
    const $ = cheerio.load(response.body);
    const result = $(".link-item").get();
    res.json(
      result.map((item, index) => {
        const $ = cheerio.load(item);
        return {
          label: index + 1,
          link: String($("a").attr("data-embed")),
        };
      })
    );
  })();
});

module.exports = router;
