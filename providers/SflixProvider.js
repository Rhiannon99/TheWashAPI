const cheerio = require("cheerio");
const axios = require("axios");
const url = "https://sflix.pro";
const key = `5uLKesbh0nkrpPq9VwMC6+tQBdomjJ4HNl/fWOSiREvAYagT8yIG7zx2D13UZFXc`;
function getVrf(id) {
  // Remove Whitespace
  let reversed = ue(`${String(id).replace(/\s/g, "+")}0000000`, key)
    .slice(0, 6)
    .split("")
    .reverse()
    .join("");

  return `${reversed}${ue(je(reversed, encodeURI(id))).replace(/=+$/, "")}`;
  // return `${encodeURI(String(id).replace(" ", "+"))}`
}

function ue(input) {
  // Translate if (input.any { it.code >= 256 }) throw Exception("illegal characters!") to javascript
  let output = "";
  for (let i = 0; i < String(input).length; i += 3) {
    let a = [-1, -1, -1, -1];
    a[0] = String(input).charCodeAt(i) >> 2;
    a[1] = (3 & input.charCodeAt(i)) << 4;
    if (String(input).length > i + 1) {
      a[1] = a[1] | (input.charCodeAt(i + 1) >> 4);
      a[2] = (15 & input.charCodeAt(i + 1)) << 2;
    }

    if (input.length > i + 2) {
      a[2] |= input.charCodeAt(i + 2) >> 6;
      a[3] = 63 & input.charCodeAt(i + 2);
    }
    for (n in a) {
      if (a[n] == -1) {
        output += "=";
      } else {
        if (a[n] >= 0 && a[n] <= 63) {
          output += key[a[n]];
        }
      }
    }
  }
  return output;
}

function je(inputOne, inputTwo) {
  const length = 256;
  let arr = Array(length)
    .fill(0)
    .map((_, i) => i);
  let output = "";

  let u = 0;
  let r;

  for (let a = 0; a < arr.length; a++) {
    u = (u + arr[a] + inputOne.charCodeAt(a % inputOne.length)) % length;
    r = arr[a];
    arr[a] = arr[u];
    arr[u] = r;
  }
  u = 0;
  let c = 0;

  // Translate for (f in inputTwo.indices) to javascript
  for (let f = 0; f < inputTwo.length; f++) {
    c = (c + f) % length;
    u = (u + arr[c]) % length;
    r = arr[c];
    arr[c] = arr[u];
    arr[u] = r;
    output += String.fromCharCode(
      inputTwo.charCodeAt(f) ^ arr[(arr[c] + arr[u]) % length]
    );
  }

  return output;
}

function getLink(input) {
  const head = String(input).slice(0, 6);
  // get the string from the 6th character to the end
  const tail = String(input).slice(6, String(input).length);
  // return decodeURIComponent(je(head, ze(tail)));
  // return ze(tail);
  return decodeURIComponent(je(head, ze(tail)));
}

function ze(input) {
  let t =
    String(input).replace(/[\t\n\f\r]/, "").length % 4 == 0
      ? String(input).replace(/==?$/, "")
      : input;
  let i = 0;
  let r = "";
  let e = 0;
  let u = 0;
  for (let o = 0; o < t.length; o++) {
    // translate e = e shl 6 to javascript
    e = e << 6;
    // Translate i = key.indexOf(t[o]) to javascript
    i = key.indexOf(t[o]);
    e = e | i;
    u += 6;
    if (24 == u) {
      // Translate r += ((16711680 and e) shr 16).toChar() to javascript
      r += String.fromCharCode((16711680 & e) >> 16);
      // Translate r += ((65280 and e) shr 8).toChar() to javascript
      r += String.fromCharCode((65280 & e) >> 8);
      // Trasnlate r += (255 and e).toChar() to javascript
      r += String.fromCharCode(255 & e);
      e = 0;
      u = 0;
    }
  }
  // Translate return if (12 == u) to javascript
  if (u == 12) {
    e = e >> 4;
    // Translate  r + e.toChar() to javascript
    r + String.fromCharCode(e);
    return r;
  } else if (u == 18) {
    e = e >> 2;
    r += String.fromCharCode((65280 & e) >> 8);
    r += String.fromCharCode(255 & e);
    return r;
  }else{
    return r;
  }

  
}

exports.SearchFlick = async (keyword) => {
  // Remove non alphanumeric characters
  // Encode to utf-8
  const vrf = encodeURIComponent(getVrf(keyword));
  const search = String(keyword).replace(/\s/g, "+");
  const response = await axios
    .get(`${url}/search?keyword=${search}&vrf=${vrf}`)
    .then((r) => r.data);
  const $ = cheerio.load(response);
  const list = $(".filmlist div.item")
    .get()
    .map((item) => {
      const title = $(item).find("h3").text();
      const link = $(item).find("a").attr("href");
      const image = $(item).find("img").attr("src");
      const isMovie = link.includes("/movie/");
      const id = link.split("-").pop();
      const vrf = getVrf(id);
      const flick = {
        title,
        link,
        image,
        id,
        vrf,
        isMovie,
      };
      return flick;
    });

  return list.filter((item) => item.isMovie);
};


exports.loadFlicks = async (link) => {
  // Decode thisconst id = `/movie/${link}`;
  const dataId = link.split("-").pop();
  const movieVRF = getVrf(dataId);

  const movieBody = await axios
    .get(`${url}/ajax/film/servers?id=${dataId}&vrf=${movieVRF}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
    .then((r) => r.data);
  const $ = cheerio.load(movieBody.html);
  const movieLink = $("html body #episodes")
    .get()
    .map((item) => {
      const refs = $(item).find("a").attr("href");
      const data = JSON.parse($(`.episode a`).attr("data-ep"));
      // map properties to index
      return {
        refs,
        data,
      };
    })[0];
  const server = await axios.get(`${url}/ajax/episode/info?id=${movieLink.data['43']}`).then(r => r.data.url);
  // const baseUrl = String(getLink(server)).split("?")[0];
  // const rawID = String(baseUrl).split("/e/")[1]
  // const keys = await axios.get("https://raw.githubusercontent.com/chekaslowakiya/BruhFlow/main/keys.json").then(r => r.data);
  // const encryptedID = ue(je(keys.cipherKey, ue(rawID, key)), key).replace("/", "_").replace("=", "");
  
  return getLink(server);
};
