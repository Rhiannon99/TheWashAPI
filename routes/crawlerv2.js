const express = require("express");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const router = express.Router();
const cheerio = require("cheerio");
const got = require("got");
const url = "https://animekisa.in";
const hasMainPage = true;
const {SearchAnime, loadEpisodes, loadEpisode} = require("../providers/GogoAnimeProvider");
const {SearchFlick, loadFlicks} = require("../providers/SflixProvider");


router.post("/v2/search-anime", (req, res) => {
  // Join spaces with +
  const keyword = req.body.search.split(" ").join("+");
  (async () => {
    const result = await SearchAnime(keyword);
    res.send(result);
  })();
});

router.get("/v2/load-anime/:link", (req, res) => {
  (async () => {
    const result = await loadEpisodes(req.params.link);
    res.send(result);
  })();
});

router.post("/v2/play-anime", (req, res) => {
  (async () => {
    const result = await loadEpisode(req.body.link);
    res.send(result);
  })();
});

router.post("/v2/search-flick", (req, res) => {
  (async () => {
    const result = await SearchFlick(req.body.search);
    res.send(result);
  })();
});

router.post("/v2/load-flick", (req, res) => {
  (async () => {
    const result = await loadFlicks(req.body.link);
    res.send(result);
  })();
});

module.exports = router;
