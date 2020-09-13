//const enrich = require("../main");
const enrich = require("../index");
const expect = require('chai').expect;
const fs = require('fs');
const spec = __dirname + "/../spec";


describe('imi-enrichment-address#main', function() {

  describe("spec", function() {
    fs.readdirSync(spec).filter(file => file.match(/json$/)).forEach(file => {
      describe(file, function() {
        const json = JSON.parse(fs.readFileSync(`${spec}/${file}`, "UTF-8"))
        json.forEach(a => {
          it(a.name, function(done) {
            enrich(a.input).then(json => {
              try {
                if ("場所" in json) json = json["場所"][0];
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
