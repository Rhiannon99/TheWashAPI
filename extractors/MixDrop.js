const cheerio = require("cheerio");
const axios = require("axios");

function format(p, a, c, k, e, d) {
  k = k.split("|");
  e = (c) => {
    return c.toString(36);
  };
  if (!"".replace(/^/, String)) {
    while (c--) {
      d[c.toString(a)] = k[c] || c.toString(a);
    }
    k = [
      (e) => {
        return d[e];
      },
    ];
    e = () => {
      return "\\w+";
    };
    c = 1;
  }
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
    }
  }
  return p;
}

exports.extractMixDrop = async (videoURL) => {
  const sources = [];

  const { data } = await axios.get(videoURL);

  const match = cheerio
    .load(data)
    .html()
    .match(/p}(.+?)wurl.+?}/g);

  if (!match) {
    return [];
  }

  const [p, a, c, k, e, d] = match[0]
    .split(",")
    .map((x) => x.split(".sp")[0]);

  const formated = format(p, a, c, k, e, JSON.parse(d));

  const [poster, source] = formated
    .match(/poster'="([^"]+)"|wurl="([^"]+)"/g)
    .map((x) => x.split(`="`)[1].replace(/"/g, ""))
    .map((x) => (x.startsWith("http") ? x : `https:${x}`));

  sources.push({
    url: source,
    isM3U8: source.includes(".m3u8"),
  });

  return sources;
};
