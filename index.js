// const enrichment = require("./main");
const enrichment = require("./lib/ca-main");
const hpEnrichment = require("./lib/hp-main");
const reverseGeocoder = require("./lib/rg-main");

const conf = require("./lib/conf");

module.exports = async function(src, opts) {
  let type, num;
  if (opts) {
    type = opts.type;
    num = opts.limit;
  }
  if (num!==undefined && Number.isInteger(num) && num > 0)
    conf.MAX_RESULTS = num;
  if (src["住所"] && src["住所"]["種別"] == "歴史地名データ")
    type = "old";
  db_name = type=="old" ? "hpdb" : "db";
  if (src.lat && src.lng || (
    src["@type"] == "座標型" ||
    src["地理座標"] && src["地理座標"]["@type"] == "座標型")) {
    return await reverseGeocoder(src, db_name);
  } else if (db_name == "hpdb") {
    return await hpEnrichment(src);
  } else {
    return await enrichment(src);
  }
};