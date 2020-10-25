const fs = require("fs");

const util = require("./util");

const levelup = require('levelup');
const leveldown = require('leveldown');

const list = require("./hp-list.json");

const conf = require("./config");

// const MAX_RESULTS = 10;

// 住所から緯度経度付き場所型を返す
module.exports = async function(src) {

  const dst = typeof src === 'string' ? {
    "@context": "https://imi.go.jp/ns/core/context.jsonld",
    "@type": "場所型",
    "住所": {
      "@type": "住所型",
      "表記": src
    }
  } : JSON.parse(JSON.stringify(src));

  const targets = [];

  const dig = function(focus, parent) {
    if (Array.isArray(focus)) {
      focus.forEach(a => dig(a));
    } else if (typeof focus === 'object') {
      if (focus["@type"] === "住所型" && focus["表記"]) {
        targets.push(parent && parent["@type"] === "場所型" ? parent : focus);
      }
      Object.keys(focus).forEach(key => {
        dig(focus[key], focus);
      });
    }
  };

  dig(dst, null);

  if (targets.length === 0) {
    return Promise.resolve(dst);
  }

  const db = levelup(leveldown(__dirname + "/../hpdb"));
  const promises = targets.map(async target => {
    const address = target["住所"] || target;
    const responses = hpFind(address["表記"]);

    if (responses.length==0) {
      util.put(target, "メタデータ", {
        "@type": "文書型",
        "説明": "該当する地名が見つかりません"
      });
      return Promise.resolve(target);
    }

    const json = [];
    for (const response of responses) {
      try {
        const data = await db.get(response.code, {asBuffer: false});
        json.push(JSON.parse(data));
        if (json.length >= conf.MAX_RESULTS) break;
      } catch (e) {}
    }
    util.put(target, "場所", json);
    delete target["住所"];
    delete target["@type"];
    return Promise.resolve(target);
  });
  return Promise.all(promises).then(async () => await db.close()).then(() => dst);


};

function hpFind(search) {
  const find = Object.keys(list).filter((item)=>RegExp(search).test(item));
  find.sort((a, b)=>a.length-b.length);
  const responses = [];
  for (const f of find) {
    for (const id of list[f]) {
      responses.push({
        code: id
      });
      if (responses.length>=conf.MAX_RESULTS) break;
    }
    if (responses.length>=conf.MAX_RESULTS) break;
  }
  return responses;
}