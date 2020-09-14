const enrichment = require("./main");
const hpEnrichment = require("./lib/hp-main");
const reverseGeocoder = require("./lib/reverse-geocoder");

module.exports = function(src, type) {
  if (src["住所"] && src["住所"]["種別"] == "歴史地名データ")
    type = "old";
  db_name = type=="old" ? "hpdb" : "db";
  if (src.lat && src.lng || (
    src["@type"] == "座標型" ||
    src["地理座標"] && src["地理座標"]["@type"] == "座標型")) {
    return reverseGeocoder(src, db_name);
  } else if (db_name == "hpdb") {
    return hpEnrichment(src);
  } else {
    return enrichment(src);
  }
};