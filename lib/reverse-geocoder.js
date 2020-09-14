const fs = require("fs");
const util = require("./util");
const geoSearch = require("./geo-search");

const DEFAULT_RADIUS = 3000;

const MAX_RESULTS = 5;

// 緯度経度から最も近い住所データを返す
module.exports = function(src, db_name) {
  const dst = (src.lat && src.lng) ? {
    "@context": "https://imi.go.jp/ns/core/context.jsonld",
    "@type": "座標型",
    "緯度": src.lat,
    "経度": src.lng
  } : JSON.parse(JSON.stringify(src));

  const targets = [];

  const dig = function(focus, parent) {
    if (Array.isArray(focus)) {
      focus.forEach(a => dig(a));
    } else if (typeof focus === 'object') {
      if (focus["@type"] === "座標型" && focus["緯度"] && focus["経度"]) {
        targets.push(focus);
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

  const db = require('level')(__dirname + "/../"+ db_name);
  const geo = require('level-geospatial')(db);
  const promises = targets.map(target => {
    const lat = +target["緯度"],
          lon = +target["経度"];
    delete target["緯度"];
    delete target["経度"];
    delete target["@type"];
    if (!lat || lat<-90 || lat>90 || !lon || lon<-180 || lon>180) {
      util.put(target, "メタデータ", {
        "@type": "文書型",
        "説明": "不正な経緯度です"
      });
      return true;
    }
    const point = {lat, lon};
    const radius = DEFAULT_RADIUS;

    return geoSearch(geo, point, radius)
    .then(data => {
      if (data.length==0) {
        util.put(target, "メタデータ", {
          "@type": "文書型",
          "説明": "範囲内に住所が見つかりませんでした"
        });
      } else {
        const json = [];
        for (const d of data) {
          const v = JSON.parse(d.value);
          delete v["@id"];
          delete v["@context"];
          json.push(v);
          if (json.length >= MAX_RESULTS) break;
        }
        util.put(target, "場所", json);
      }
      return true;
    }).catch(e => {
      util.put(target, "メタデータ", {
        "@type": "文書型",
        "説明": "検索中にエラーが発生しました"
      });
      return true;
    });
  });
  return Promise.all(promises).then(() => db.close()).then(() => dst);

};