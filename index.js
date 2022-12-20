const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const logger = require("morgan");
var cors = require('cors')

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const torrentRouter = require("./routes/torrent");
const crawlerRouter = require("./routes/crawler");
const crawlerv2Router = require("./routes/crawlerv2");

const app = express();

app.use(logger("dev"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())

const rewrite = (path) => {
    // remove the first and last slash
    return path.replace(path, '');
};

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/api", torrentRouter);
app.use('/api', crawlerv2Router);
app.use('/api/anime', crawlerRouter);
app.use("/users", usersRouter);
app.get('/proxy/:url', function(req, res) {
    createProxyMiddleware({
    target: decodeURIComponent(req.params.url),
    changeOrigin: true,
    onProxyReq: function (proxyRes, req, res) {
        // The flix for now
        proxyRes.setHeader('Referer', 'https://theflix.to/');
    },
    // handle dynamic requests
    pathRewrite: rewrite
 })(req, res);
});

app.get('/proxy-movie/:url', function(req, res) {
    createProxyMiddleware({
    target: decodeURIComponent(req.params.url),
    changeOrigin: true,
    onProxyReq: function (proxyRes, req, res) {
        // The flix for now
        // proxyRes.setHeader('Referer', 'https://cinegrabber.com/');
        proxyRes.setHeader('Accept', 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5');
        // Keep Alive
        proxyRes.setHeader('Connection', 'keep-alive');
        proxyRes.setHeader('Host', 'fvs.io');
    },
    // handle dynamic requests
    pathRewrite: rewrite
 })(req, res);
});

module.exports = app;
