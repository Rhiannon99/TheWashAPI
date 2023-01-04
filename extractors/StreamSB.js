const cheerio = require("cheerio");
const axios = require("axios");
const crypto = require("crypto-js");
const host = "https://sbplay2.com/sources48";
const host2 = "https://watchsb.com/sources48";

exports.extractStreamSB = async (videoURL, isAlternative = false, baseURL) => {
  const PAYLOAD = (hex) => {
    return `566d337678566f743674494a7c7c${hex}7c7c346b6767586d6934774855537c7c73747265616d7362/6565417268755339773461447c7c346133383438333436313335376136323337373433383634376337633465366534393338373136643732373736343735373237613763376334363733353737303533366236333463353333363534366137633763373337343732363536313664373336327c7c6b586c3163614468645a47617c7c73747265616d7362`;
  };

  const headers = {
    watchsb: "sbstream",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    Referer: videoURL.href,
  };
  let id = videoURL.href.split('/e/').pop();
  if (id?.includes('html')) {
    id = id.split('.html')[0];
  }
  const bytes = new TextEncoder().encode(id);

  return id;
};
