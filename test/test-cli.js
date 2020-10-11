const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const fs = require("fs");
const spec = __dirname + "/../spec";

function cli(options, stdin) {
  let res = "";
  const cmd = ["bin/cli.js"].concat(options || []);
  return new Promise(resolve => {
    const child = spawn("node", cmd);
    child.stdout.setEncoding('utf-8');
    child.stdout.on('data', (data) => {
      res += data;
    });
    child.on('close', (code) => {
      resolve(res);
    });
    if (stdin) {
      child.stdin.setEncoding('utf-8');
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

function conv(res, org) {
  if (org == undefined) org = [];
  if ("場所" in res) {
    res = res["場所"][0];
    if (!org["地理座標"] && "住所" in res) res = res["住所"][0];
  }
  return res;
}

const samples = JSON.parse(fs.readFileSync(`${spec}/001-io.json`, "UTF-8"));

describe('japan-address-search#cli', () => {

  const tempfile = `tmp.${(new Date()).getTime()}.json`;

  before((done) => {
    fs.writeFileSync(tempfile, JSON.stringify(samples[1].input), "UTF-8");
    done();
  });

  after(() => {
    fs.unlinkSync(tempfile);
  });

  describe('options', () => {

    it("-h", (done) => {
      cli(["-h"]).then(res => {
        try {
          expect(res).to.have.string("japan-address-search");
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--help", (done) => {
      cli(["--help"]).then(res => {
        try {
          expect(res).to.have.string("japan-address-search");
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("-s", (done) => {
      cli(["-s", samples[0].input]).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--string", (done) => {
      cli(["--string", samples[0].input]).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("-f", (done) => {
      cli(["-f", tempfile]).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[1].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--file", (done) => {
      cli(["--file", tempfile]).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[1].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("filename only", (done) => {
      cli([tempfile]).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[1].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("stdin", (done) => {
      cli(null, JSON.stringify(samples[1].input)).then(res => {
        try {
          res = conv(JSON.parse(res));
          expect(res).deep.equal(samples[1].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("spec", function() {
    fs.readdirSync(spec).filter(file => file.match(/json$/)).forEach(file => {
      describe(file, function() {
        const json = JSON.parse(fs.readFileSync(`${spec}/${file}`, "UTF-8"));
        json.forEach(a => {
          it(a.name, done => {
            const promise = typeof a.input === 'string' ? cli(["-s", a.input]) : cli(null, JSON.stringify(a.input));
            promise.then(res => {
              try {
                res = conv(JSON.parse(res),a.output);
                if (Array.isArray(res)) {
                  for (let i=0;i<res.length;i++) {
                    res[i] = conv(res[i],a.output);
                  }
                }
                expect(res).deep.equal(a.output);
                done();
              } catch (e) {
                done(e);
              }
            });
          });
        });
      });
    });
  });

});
