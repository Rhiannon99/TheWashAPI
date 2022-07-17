const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://gogoanime.lu";
const crypto = require("crypto");
const name = "Gogo";

function decrypt(key, iv, encrypted) {
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  return decrypted + decipher.final("utf8");
}

function encrypt(key, iv, text) {
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

async function extractMedia(linkObject) {
  console.log("Link Object", linkObject);
  const episodeURL = `https:${linkObject.link}`;
  const host = linkObject.host;
  const referrer = `https://${host}`;
  const keys = {
    key: "37911490979715163134003223491201",
    secondKey: "54674138327930866480207815084989",
    iv: "3134003223491201",
  };

  const response = await axios.get(episodeURL).then((r) => {
    return r.data;
  });

  const $ = cheerio.load(response);
  const result = String($('script[data-name="episode"]').attr("data-value"));

  const id = String(decrypt(keys.key, keys.iv, result)).split(/[:&]/)[0];
  const encryptedID = encrypt(keys.key, keys.iv, id);
  const params = String(decrypt(keys.key, keys.iv, result)).substring(
    String(decrypt(keys.key, keys.iv, result)).indexOf("&")
  );

  const instance = axios.create({
    baseURL: `${referrer}/encrypt-ajax.php?id=${encryptedID}${params}&alias=${id}`,
    timeout: 1000,
    headers: { host: host, "X-Requested-With": "XMLHttpRequest" },
  });

  const encryptedLink = await instance
    .get(``, {
      headers: {
        host: host,
        "X-Requested-With": "XMLHttpRequest",
      },
    })
    .then((r) => {
      return r.data;
    });

  const encryptedJSON = decrypt(keys.secondKey, keys.iv, encryptedLink.data);
  const json = JSON.parse(encryptedJSON);
  const media = json.source.map((item) => {
    // check if file is an m3u8 or mp4
    return {
      file: item.file,
      label: item.label,
      type: item.type,
    }
  });

  return media[0];
  // return ;
}

exports.SearchAnime = async (keyword) => {
  // Encode keyword for URL
  const encodedKeyword = keyword;
  console.log(`${url}/search.html?${encodedKeyword}`);
  const response = await axios
    .get(`${url}/search.html?keyword=${encodedKeyword}`)
    .then((r) => {
      return r;
    });
  const $ = cheerio.load(response.data);
  const result = $(".last_episodes > ul > li div.img > a").get();

  return result.map((item) => {
    const $ = cheerio.load(item);
    return {
      title: $("img").attr("alt"),
      link: String($("a").attr("href")).replace("/category/", ""),
    };
  });
};

exports.loadEpisodes = async (animeLink, extra) => {
  const link = `${url}/category/${animeLink}`;

  const response = await axios.get(link).then((r) => {
    return r;
  });
  const $ = cheerio.load(response.data);
  const lastEpisode = $("ul#episode_page > li:last-child > a").attr("ep_end");
  const animeID = $("input#movie_id").attr("value");

  const episodes = await axios
    .get(
      `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=${lastEpisode}&id=${animeID}`
    )
    .then((r) => {
      // console.log("EPISODE LIST", r.data);
      const $ = cheerio.load(r.data);
      const result = $("li").get();
      console.log(
        result.map((item) => {
          const $ = cheerio.load(item);
          return {
            title: $("a").attr("title"),
            link: $("a").attr("href"),
          };
        })
      );
      return result.reverse().map((item, index) => {
        const $ = cheerio.load(item);
        return {
          episode: index + 1,
          link: String($("a").attr("href")).replace(" ", ""),
        };
      });
    });

  return episodes;
};

exports.loadEpisode = async (serverLink, extra) => {
  const link = `${url}${serverLink}`;

  const response = await axios.get(link).then((r) => {
    return r.data;
  });

  const $ = cheerio.load(response);
  const result = $("div.anime_muti_link > ul > li").get();
  const servers = result
    .map((item) => {
      const $ = cheerio.load(item);
      return {
        title: String($("a").text())
          .replace("\n            ", "")
          .replace("Choose this server", ""),
        link: $("a").attr("data-video"),
        host: String($("a").attr("data-video")).replace("//", "").split("/")[0],
      };
    })
    .slice(0, 2);

  const media = await extractMedia(servers[0]);

  return media;
};
