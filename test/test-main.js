//const enrich = require("../main");
const enrich = require("../index");
const expect = require('chai').expect;
const fs = require('fs');
const spec = __dirname + "/../spec";

function conv(res, org) {
  if (org == undefined) org = [];
  if ("場所" in res) {
    res = res["場所"][0];
    if (!org["地理座標"] && "住所" in res) res = res["住所"][0];
  }
  return res;
}

describe('japan-address-search#main', function() {

  describe("spec", function() {
    fs.readdirSync(spec).filter(file => file.match(/json$/)).forEach(file => {
      describe(file, function() {
        const json = JSON.parse(fs.readFileSync(`${spec}/${file}`, "UTF-8"))
        json.forEach(a => {
          it(a.name, function(done) {
            enrich(a.input).then(json => {
              try {
                json = conv(json,a.output);
                if (Array.isArray(json)) {
                  for (let i=0;i<json.length;i++) {
                    json[i] = conv(json[i],a.output);
                  }
                }
                expect(json).deep.equal(a.output);
                done();
              } catch (e) {
                done(e);
              }
            }).catch(e2 => {
              done(e2);
            });
          });
        });
      });
    });
  });

});
