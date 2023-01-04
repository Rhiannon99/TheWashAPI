const cheerio = require("cheerio");
const axios = require("axios");
const crypto = require("crypto-js");

const keys = {
  key: crypto.enc.Utf8.parse("37911490979715163134003223491201"),
  secondKey: crypto.enc.Utf8.parse("54674138327930866480207815084989"),
  iv: crypto.enc.Utf8.parse("3134003223491201"),
};

const generateEncryptedAjaxParams = async ($, id) => {
  const encryptedKey = crypto.AES.encrypt(id, keys.key, {
    iv: keys.iv,
  });

  const scriptValue = String($("script[data-name='episode']").data().value);

  const decryptedToken = crypto.AES.decrypt(scriptValue, keys.key, {
    iv: keys.iv,
  }).toString(crypto.enc.Utf8);

  return `id=${encryptedKey}&alias=${id}&${decryptedToken}`;
};

const decryptAjax = async (encryptedData) => {
  const decryptedData = crypto.enc.Utf8.stringify(
    crypto.AES.decrypt(encryptedData, keys.secondKey, {
      iv: keys.iv,
    })
  );

  return JSON.parse(decryptedData);
};

exports.extractGogoCDN = async (videoURL, isAlternative = false, baseURL) => {
  const referrer = videoURL.href;
  const sources = [];
  const res = await axios.get(videoURL.href);
  const $ = cheerio.load(res.data);

  const encyptedParams = await generateEncryptedAjaxParams(
    $,
    videoURL.searchParams.get("id") ?? ""
  );

  const encryptedData = await axios.get(
    `${videoURL.protocol}//${videoURL.hostname}/encrypt-ajax.php?${encyptedParams}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  const decryptedData = await decryptAjax(encryptedData.data.data);

  if (!decryptedData.source)
    throw new Error("No source found. Try a different server.");

  if (decryptedData.source[0].file.includes(".m3u8")) {
    const resResult = await axios.get(decryptedData.source[0].file.toString());
    const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
    resolutions.forEach((res) => {
      const index = decryptedData.source[0].file.lastIndexOf("/");
      const quality = res.split("\n")[0].split("x")[1].split(",")[0];
      const url = decryptedData.source[0].file.slice(0, index);
      sources.push({
        url: url + "/" + res.split("\n")[1],
        isM3U8: (url + res.split("\n")[1]).includes(".m3u8"),
        quality: quality + "p",
      });
    });

    decryptedData.source.forEach((source) => {
      sources.push({
        url: source.file,
        isM3U8: source.file.includes(".m3u8"),
        quality: "default",
      });
    });
  } else {
    decryptedData.source.forEach((source) => {
      sources.push({
        url: source.file,
        isM3U8: source.file.includes(".m3u8"),
        quality: source.label.split(" ")[0] + "p",
      });
    });
  }
  decryptedData.source_bk.forEach((source) => {
    sources.push({
      url: source.file,
      isM3U8: source.file.includes(".m3u8"),
      quality: "backup",
    });
  });

  return sources;
};
