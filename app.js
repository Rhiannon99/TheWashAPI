const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const logger = require("morgan");
var cors = require('cors')

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const torrentRouter = require("./routes/torrent");
const crawlerRouter = require("./routes/crawler");

const app = express();

app.use(logger("dev"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", torrentRouter);
app.use('/api/anime', crawlerRouter);
app.use("/users", usersRouter);

module.exports = app;
