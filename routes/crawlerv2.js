const express = require("express");
const router = express.Router();
const { request } = require("urllib");
const {
  SearchAnime,
  loadEpisode,
  loadEpisodes,
} = require("../providers/GogoAnimeProvider2");
// const {SearchFlick, loadFlicks} = require("../providers/Ask4MovieProvider");
const {SearchFlick, loadFlicks, SearchSeries, loadSeriesEpisodes, loadSeriesEpisode} = require("../providers/FlixHQProvider");

router.post("/v2/search-anime", (req, res) => {
  // Join spaces with +
  // const keyword = req.body.search.split(" ").join("+");
  (async () => {
    const result = await SearchAnime(req.body.search);
    res.send(result);
  })();
});

router.get("/v2/load-anime/:link", (req, res) => {
  (async () => {
    const result = await loadEpisodes(req.params.link);
    res.send(result);
  })();
});

router.get("/v2/play-anime/:id", (req, res) => {
  (async () => {
    // res.send(req.params.id);
    const result = await loadEpisode(req.params.id);
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

router.get("/v2/load-episode/:id", (req, res) => {
  (async () => {
    const result = await loadSeriesEpisode(req.params.id);
    res.send(result);
  })();
});

router.get("/v2/load-series/tv-show/:link", (req, res) => {
  (async () => {
    const result = await loadSeriesEpisodes(req.params.link);
    res.send(result);
  })();
});

router.post("/v2/load-flick/movie/:link", (req, res) => {
  (async () => {
    const result = await loadFlicks(req.params.link);
    res.send(result);
  })();
});


module.exports = router;
