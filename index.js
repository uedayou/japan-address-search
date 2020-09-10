const enrichment = require("./main");
const reverseGeocoder = require("./lib/reverse-geocoder");

module.exports = function(src) {
  if (src.lat && src.lng || src["@type"] == "座標型") {
    return reverseGeocoder(src);
  } else {
    return enrichment(src);
  }
};