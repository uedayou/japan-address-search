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

const samples = JSON.parse(fs.readFileSync(`${spec}/001-02-io-reverse-geocoding.json`, "UTF-8"));

describe('imi-enrichment-addressn#cli-reverse-geocoding', () => {

  const tempfile = `tmp.${(new Date()).getTime()}.json`;

  before((done) => {
    fs.writeFileSync(tempfile, JSON.stringify(samples[0].input), "UTF-8");
    done();
  });

  after(() => {
    fs.unlinkSync(tempfile);
  });

  describe('options', () => {

    it("--lat --lng", (done) => {
      cli(["--lat", samples[0].input["緯度"], "--lng", samples[0].input["経度"]]).then(res => {
        try {
          expect(JSON.parse(res)["場所"][0]).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("-f", (done) => {
      cli(["-f", tempfile]).then(res => {
        try {
          expect(JSON.parse(res)["場所"][0]).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--file", (done) => {
      cli(["--file", tempfile]).then(res => {
        try {
          expect(JSON.parse(res)["場所"][0]).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("stdin", (done) => {
      cli(null, JSON.stringify(samples[0].input)).then(res => {
        try {
          expect(JSON.parse(res)["場所"][0]).deep.equal(samples[0].output);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });

});
