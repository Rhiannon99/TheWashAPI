const cheerio = require("cheerio");
const request = require("request");
const url = "https://animekisa.in";
const hasMainPage = true;

// SCRAPPED FOR NOW

const getAnime = async () => {
    let responseHTML = null;
    const html = await request(
    `${url}/ajax/list/views?type=month`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        responseHTML = $.html();
      }
    }
  );
  console.log(responseHTML);
  return responseHTML;
};

module.exports = {
  getAnime,
};
