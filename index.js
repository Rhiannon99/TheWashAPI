const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const logger = require("morgan");
var cors = require('cors')

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
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
app.use('/api', crawlerv2Router);
app.use('/api/anime', crawlerRouter);
app.use("/users", usersRouter);

module.exports = app;
