const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const request = require("request");
const util = require("../utils/decryptor");

router.get("/grab", (req, res, next) => {
  const html = request(
    "https://ww.kiss-anime.ws/Anime-lupin-the-third",
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

        const json = 
        {
            token: token,
            hash: hash,
            key: key,
            or: or
        }

        const decrypted = decryptToken(token, hash, key, or);
        res.send(result + decrypted + JSON.stringify(json));
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

module.exports = router;
