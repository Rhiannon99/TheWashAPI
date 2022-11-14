const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://ask4movie.mx";
const crypto = require("crypto");
const name = "Ask4Movie";

function parseCineGrabber(data) {
  return (async () => {
    const link = `https://cinegrabber.com/api/source/${
      String(data).split("/")[4]
    }`;
    const response = await axios
      .post(
        link,
        { d: "cinegrabber.com", r: "" },
      )
      .then((r) => r.data);
    return response;
  })();
}

exports.SearchFlick = async (keyword) => {
  const query = `${url}/?s=${String(keyword).replace(/\s/g, "+")}`;

  const response = await axios.get(query).then((r) => r.data);
  const $ = cheerio.load(response);

  // get the div.item
  const item = $("div.item").get();

  console.log(item);
  const result = item.map((item) => {
    const $ = cheerio.load(item);
    return {
      // get the href text
      title: $("a").text(),
      link: `/movie/${$("a").attr("href").split("/")[3]}`,
    };
  });

  return result;
};

exports.loadFlicks = async (link) => {
  const query = `${url}/${link}/?r`;

  const response = await axios.get(query).then((r) => r.data);
  const $ = cheerio.load(response);
  const item = $(".cactus-row > script:nth-child(3)").html();

  const regex = /(?<=\[)(.*?)(?=\])/g;
  const result = item.match(regex);

  const encodedLink = result
    .find((item) => item.includes("dir"))
    .split(",")[27];
  const decodedLink = Buffer.from(encodedLink, "base64").toString("ascii");
  const finalLink = cheerio.load(decodedLink);
  // get the src attribute
  const linkSrc = finalLink("iframe").attr("src");
  const data = parseCineGrabber(linkSrc);
  return data;
};
