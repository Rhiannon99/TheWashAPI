const express = require("express");
const router = express.Router();
const {SearchAnime, loadEpisodes, loadEpisode} = require("../providers/GogoAnimeProvider");
const {SearchFlick, loadFlicks} = require("../providers/SolarMovieProvider");
const {SearchSeries, loadSeriesEpisodes, loadSeriesEpisode} = require('../providers/TheFlixProvider');


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

router.post("/v2/search-series", (req, res) => {
  (async () => {
    const result = await SearchSeries(req.body.search);
    res.send(result);
  })();
});

router.post("/v2/load-episode", (req, res) => {
  (async () => {
    const result = await loadSeriesEpisode(req.body.id);
    res.send(result);
  })();
});

router.get("/v2/load-series/tv-show/:link", (req, res) => {
  (async () => {
    const result = await loadSeriesEpisodes(req.params.link);
    res.send(result);
  })();
});

router.get("/v2/load-flick/movie/:link", (req, res) => {
  (async () => {
    const result = await loadFlicks(req.params.link);
    res.send(result);
  })();
});

module.exports = router;
