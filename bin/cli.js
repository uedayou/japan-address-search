#!/usr/bin/env node

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
//const enrichment = require("../main");
const enrichment = require("../index");

const optionDefinitions = [{
  name: 'help',
  alias: 'h',
  type: Boolean,
  description: 'このヘルプを表示します'
}, {
  name: 'file',
  alias: 'f',
  type: String,
  defaultOption: true,
  typeLabel: '{underline file}',
  description: '変換対象とする JSON ファイル'
}, {
  name: 'string',
  alias: 's',
  type: String,
  typeLabel: '{underline string}',
  description: '変換対象とする住所文字列',
}, {
  name: 'lat',
  type: String,
  typeLabel: '{underline latitude}',
  description: '変換対象とする緯度',
}, {
  name: 'lng',
  type: String,
  typeLabel: '{underline longitude}',
  description: '変換対象とする経度',
}, {
  name: 'old',
  type: Boolean,
  typeLabel: '{underline old}',
  defaultValue: false,
  description: '歴史地名を検索対象にしたい場合は --old オプションをつけてください'
}, {
  name: 'indent',
  alias: 'i',
  type: Number,
  typeLabel: '{underline number}',
  description: '出力する JSON のインデント (default 2)',
  defaultValue: 2
}];

const options = commandLineArgs(optionDefinitions);

let db_name = "db";
if (options.old) db_name = "hpdb";

if (options.help) {
  const usage = commandLineUsage([{
    header: 'imi-enrichment-address',
    content: '住所文字列をもとに住所型・場所型の情報を補完します'
  }, {
    header: 'オプション',
    optionList: optionDefinitions
  }, {
    header: '実行例',
    content: [{
        desc: 'ヘルプの表示',
        example: '$ imi-enrichment-address -h'
      },
      {
        desc: '文字列の処理',
        example: '$ imi-enrichment-address -s 霞が関2'
      },
      {
        desc: 'ファイルの処理',
        example: '$ imi-enrichment-address input.json'
      },
      {
        desc: '標準入力の処理',
        example: '$ cat input.json | imi-enrichment-address'
      }
    ]
  }]);
  console.log(usage)
} else if (options.string) {
  enrichment(options.string, db_name).then(json => {
    console.log(JSON.stringify(json, null, options.indent));
  });
} else if (options.file) {
  const input = JSON.parse(fs.readFileSync(options.file, "UTF-8"));
  enrichment(input, db_name).then(json => {
    console.log(JSON.stringify(json, null, options.indent));
  });
} else if (options.lat && options.lng) {
  const point = {
    lat: options.lat,
    lng: options.lng
  };
  enrichment(point, db_name).then(json => {
    console.log(JSON.stringify(json, null, options.indent));
  });
} else {
  let buffer = "";
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => {
    buffer += chunk;
  }).on('end', () => {
    const input = JSON.parse(buffer);
    enrichment(input, db_name).then(json => {
      console.log(JSON.stringify(json, null, options.indent));
    });
  });
}
