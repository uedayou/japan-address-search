const fs = require("fs");
// const find = require("./find");
const find = require("./ca-find");
const bangou = require("./bangou");

const util = require("./util");

const levelup = require('levelup');
const leveldown = require('leveldown');

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

  const db = levelup(leveldown(__dirname + "/../db"));
  const promises = targets.map(async target => {
    const address = target["住所"] || target;
    const responses = find(address["表記"]);
    if (!responses || responses.length==0) {
      util.put(target, "メタデータ", {
        "@type": "文書型",
        "説明": "該当する地名が見つかりません"
      });
      return Promise.resolve(target);
    }
    if (responses.length==1) {
      if (responses[0].multipleChoice) {
        util.put(target, "メタデータ", {
          "@type": "文書型",
          "説明": "該当する地名が複数あります"
        });
        return Promise.resolve(target);
      }
    }

    const jsons = [];
    for (const response of responses) {
      let code = response.code;
      if (response.expectedChome !== undefined) {
        let t = "" + response.expectedChome;
        while (t.length < 3) t = "0" + t;
        code = code + t;
      }
      try {
        const data = await db.get(code, { asBuffer: false });
        const json = JSON.parse(data);
        if (responses.length==1 && code.length === 5) {
          const match = json["@graph"].filter(x => {
            if (address["表記"].indexOf(x["表記"]) === 0) {
              return true;
            } else if (x["区"] !== undefined) {
              if (address["表記"].indexOf(x["都道府県"] + x["市区町村"] + x["区"]) === 0) return true;
              if (address["表記"].indexOf(x["市区町村"] + x["区"]) === 0) return true;
              if (address["表記"].indexOf(x["区"]) === 0) return true;
            } else {
              if (address["表記"].indexOf(x["都道府県"] + x["市区町村"]) === 0) return true;
              if (address["表記"].indexOf(x["市区町村"]) === 0) return true;
            }
            return false;
          });

          const hit = match.length > 0;

          const latest = hit ? match.pop() : json["@graph"].pop();
          delete latest["表記"];
          let dates = latest["メタデータ"]["日付"];
          if (!Array.isArray(dates)) dates = [dates];

          if (latest["メタデータ"] && latest["メタデータ"]["参照"] === undefined && dates.length < 2) {
            delete latest["メタデータ"];
          }

          if (response.tail.trim().length > 0) {
            Object.keys(latest).forEach(key => {
              address[key] = latest[key];
            });
            if (code.match(/000$/)) {
              util.put(target, "メタデータ", {
                "@type": "文書型",
                "説明": "該当する市区町村名が見つかりません"
              });
            } else {
              util.put(target, "メタデータ", {
                "@type": "文書型",
                "説明": "該当する町名が見つかりません"
              });
            }
          } else {
            latest["表記"] = address["表記"];
            latest["種別"] = "位置参照情報";
            const obj = {
              "@type": "場所型",
              "住所": [latest]
            };
            util.put(target, "場所", [obj]);
            delete target["住所"];
            delete target["@type"];
          }
          return true;
        }
        let obj;
        if ("@graph" in json) {
          const temp = json["@graph"].pop();
          delete temp["メタデータ"];
          temp["種別"] = "位置参照情報";
          temp["表記"] = address["表記"];
          obj = {
            "@type": "場所型",
            // 歴史地名データを構造をあわせる
            "住所": [temp]
          };
        } else {
          obj = json;
          obj["住所"]["種別"] = "位置参照情報";
          obj["住所"]["表記"] = address["表記"];
          // 歴史地名データを構造をあわせる
          obj["住所"] = [obj["住所"]];
        }
        delete obj["@id"];
        delete obj["@context"];
        if (response.expectedChome !== undefined) {
          delete obj["地理座標"];
          delete obj["住所"][0]["丁目"];
          if (response.actualChome !== null) {
            if (responses.length==1) {
              util.put(target, "メタデータ", {
                "@type": "文書型",
                "説明": "該当する丁目が見つかりません"
              });
              return true;
            }
          }
        }
        const tail = bangou(response.tail);
        Object.keys(tail).forEach(key => {
          obj["住所"][0][key] = tail[key];
        });
        jsons.push(obj);
      } catch(e) {
        console.log(e);
      }
      if (jsons.length>=conf.MAX_RESULTS) break;
    }
    util.put(target, "場所", jsons);
    delete target["住所"];
    delete target["@type"];
    delete target["表記"];
    return Promise.resolve(target);
  });
  return Promise.all(promises).then(async () => await db.close()).then(() => dst);
};
