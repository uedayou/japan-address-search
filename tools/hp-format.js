const hpUtil = require('../lib/hp-util');
const geoSearch = require("../lib/geo-search");

const levelup = require('levelup');
const leveldown = require('leveldown');
const hpdb = levelup(leveldown(__dirname + "/../hpdb"));
const hpgeo = require('level-geospatial')(hpdb);

async function main() {
  const lower = await hpUtil.getPlaceNames(process.argv[2]);
  const relation = await hpUtil.getRelation(process.argv[3]);
  const addresses = {};
  for (const id of Object.keys(lower)) {
    if (!Array.isArray(relation[id])) continue;
    addresses[id] = hpUtil.createAddressObject(lower[id], relation[id]);
  }
  console.log(Object.keys(lower).length);

  const db = require('level')(__dirname + "/../db");
  const geo = require('level-geospatial')(db);
  for (const id of Object.keys(addresses)) {
    const address = addresses[id];

    if (address["地理座標"]) {
      const lat = +address["地理座標"][0]["緯度"];
      const lon = +address["地理座標"][0]["経度"];
      if (!lat || lat<-90 || lat>90 || !lon || lon<-180 || lon>180)
        continue;
      const point = {lat, lon};
      try {
        const data = await getAddressByLocation(geo, point);
        if (data.length>0) {
          const json = JSON.parse(data[0].value);
          json["住所"]["種別"] = "位置参照情報";
          address["住所"].push(json["住所"]);
        }
      } catch(e) {
        console.error(e);
      }
      await hpgeo.put({lat, lon}, id, JSON.stringify(address));
    }
    
    await hpdb.put(id, JSON.stringify(address))
  }
}

async function getAddressByLocation(geo, point) {
  for (let radius=1000;radius<=10000;radius+=1000) {
    const data = await geoSearch(geo, point, radius);
    if (data.length>0) return data;
  }
  return [];
}

main();