const enrichment = require("./main");
const hpEnrichment = require("./lib/hp-main");
const reverseGeocoder = require("./lib/reverse-geocoder");

module.exports = function(src, db_name) {
	if (!db_name) db_name = "db";
  if (src.lat && src.lng || src["@type"] == "座標型") {
    return reverseGeocoder(src, db_name);
  } else if (db_name == "hpdb") {
    return hpEnrichment(src);
  } else {
    return enrichment(src);
  }
};