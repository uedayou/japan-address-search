const expect = require('chai').expect;

const geoSearch = require("../lib/geo-search");

describe('imi-enrichment-address#format-reverse-geocoder', function() {

  let db, geo;

  before(() => {
    db = require('level')(__dirname + "/../db");
    geo = require('level-geospatial')(db);
  });

  after(() => {
    db.close().then(() => {
      console.error("data base closed.");
    });
  });

  it("東京駅", (done) => {
    const point = {
      lat: 35.68099,
      lon: 139.768
    };
    geoSearch(geo, point, 1000).then(res => {
      try {
        res.sort((a,b)=>a.distance-b.distance);
        const json = JSON.parse(res[0].value);
        delete json["@id"];
        expect(json).deep.equal({
          "@context": "https://imi.go.jp/ns/core/context.jsonld",
          "@type": "場所型",
          "住所": {
            "@type": "住所型",
            "丁目": "1",
            "市区町村": "千代田区",
            "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
            "町名": "丸の内",
            "表記": "東京都千代田区丸の内一丁目",
            "都道府県": "東京都",
            "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000"
          },
          "地理座標": {
            "@type": "座標型",
            "経度": "139.767201",
            "緯度": "35.68156"
          }
        });
        done();
      } catch (e) {
        done(e);
      }
    }).catch(e => {
      done(e);
    });
  });

  it("新大阪駅", (done) => {
    const point = {
      lat: 34.7331,
      lon: 135.5002
    };
    geoSearch(geo, point, 1000).then(res => {
      try {
        res.sort((a,b)=>a.distance-b.distance);
        const json = JSON.parse(res[0].value);
        delete json["@id"];
        expect(json).deep.equal({
          "@context": "https://imi.go.jp/ns/core/context.jsonld",
          "@type": "場所型",
          "住所": {
            "@type": "住所型",
            "表記": "大阪府大阪市淀川区西中島五丁目",
            "都道府県": "大阪府",
            "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C27000",
            "市区町村": "大阪市",
            "区": "淀川区",
            "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C27123",
            "町名": "西中島",
            "丁目": "5"
          },
          "地理座標": {
            "@type": "座標型",
            "緯度": "34.731317",
            "経度": "135.500128"
          }
        });
        done();
      } catch (e) {
        done(e);
      }
    }).catch(e => {
      done(e);
    });
  });

  it("名古屋駅", (done) => {
    const point = {
      lat: 35.170915,
      lon: 136.881537
    };
    geoSearch(geo, point, 1000).then(res => {
      try {
        res.sort((a,b)=>a.distance-b.distance);
        const json = JSON.parse(res[0].value);
        delete json["@id"];
        expect(json).deep.equal({
          "@context": "https://imi.go.jp/ns/core/context.jsonld",
          "@type": "場所型",
          "住所": {
            "@type": "住所型",
            "表記": "愛知県名古屋市中村区名駅一丁目",
            "都道府県": "愛知県",
            "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C23000",
            "市区町村": "名古屋市",
            "区": "中村区",
            "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C23105",
            "町名": "名駅",
            "丁目": "1"
          },
          "地理座標": {
            "@type": "座標型",
            "緯度": "35.170778",
            "経度": "136.882494"
          }
        });
        done();
      } catch (e) {
        done(e);
      }
    }).catch(e => {
      done(e);
    });
  });

});
