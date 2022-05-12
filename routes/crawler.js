const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const request = require("request");
const util = require("../utils/decryptor");

router.get("/grab/:link", (req, res, next) => {
  request(
    `https://ww.kiss-anime.ws/${req.params.link}`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        // regex all strings with quotes
        const result = $(".video-wrapper").html();
        const regex = /"(.*?)"/g;
        const matches = [];
        let match;
        while ((match = regex.exec(result))) {
          // skip "" and "\64"
          if (match[1] === "" || match[1] === "\\x64") {
            continue;
          }

          matches.push(match[1]);
        }
        // get the first string with quotes
        const token = matches[0];
        // get the second string with quotes
        const hash = matches[1];
        // get the third string with quotes
        const key = matches[2];
        // get the fourth string with quotes
        const or = matches[3];

        const json = {
          token: token,
          hash: hash,
          key: key,
          or: or,
        };

        const decrypted = decryptToken(token, hash, key, or);
        grabCache(decrypted, res)
      }
    }
  );
});

router.post("/search", (req, res, next) => {
  // const { search } = req.body.params;
  // const searchQuery = String(search).split(" ").join("+");
  request(
    `https://ww.kiss-anime.ws/Anime/${req.body.search}`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        // regex all strings with quotes
        const result = $('.eplist').html()
        const regex = /"(.*?)"/g;
        const matches = [];
        const response = [];
        let match;

        while ((match = regex.exec(result))) {
          matches.push(match[1]); 
        }

        // Reverse the matches array
        matches.reverse();

        for (let i = 0; i < matches.length; i++) {
          response.push({
            episode: i + 1,
            link: matches[i],
          })

        }

        res.json(response)
      }
    }
  );
});

function decryptToken(token, hash, key, or) {
  const vez = util.re(token, util.t);
  const cvez = util.re(hash, util.t);
  let _0x3633 = ["", "\x64"];
  let oz = util.vsd[_0x3633[1]](_0x3633[0] + vez + _0x3633[0]);
  let sez = util.re(_0x3633[0] + oz + _0x3633[0], util.e);
  let ks = _0x3633[0] + sez + _0x3633[0];

  let id = key;
  let veza = util.re(or, util.t);
  var oza = util.vsd.d("" + veza + "");
  var seza = util.re("" + oza + "", util.e);
  return `https://animesource.me/player/embed.php?id=${seza}&key=${ks}&ts=${id}`;
}

function grabCache(link, res) {
  request(
    link,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const result = $("#player").html();
        const regex = /"(.*?)"/g;
        const matches = [];
        let match;
        while ((match = regex.exec(result))) {
          matches.push(match[1]);
        }
        res.json({
          video_link: `https://animesource.me${matches[1]}`,
        });
      }
    }
  );
}


module.exports = router;
