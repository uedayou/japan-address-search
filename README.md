# imi-enrichment-address-plus

imi-enrichment-address-plus は、経済産業省が公開する[imi-enrichment-address(住所変換コンポーネント)](https://github.com/IMI-Tool-Project/imi-enrichment-address)の派生版です。

imi-enrichment-address-plus は以下の機能を利用できます。

- 住所表記の正規化(imi-enrichment-addressと同じ機能)
- 逆ジオコーディング機能
- [歴史地名データ](https://www.nihu.jp/ja/publication/source_map)の検索

## 機能概要

### 住所表記の正規化

あいまいな住所表記を正規化します。
町・丁目レベルには緯度経度情報もあります。

```霞が関2
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "表記": "霞が関2",
    "都道府県": "東京都",
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
    "市区町村": "千代田区",
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
    "町名": "霞が関",
    "丁目": "2"
  },
  "地理座標": {
    "@type": "座標型",
    "緯度": "35.675551",
    "経度": "139.750413"
  }
}
```

### 逆ジオコーディング機能

任意の緯度経度の値を与えることにより、特定の範囲内(デフォルトは3km)にある最も近い最大5件の住所データを返します。

```
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "場所": [
    {
      "@type": "場所型",
      "住所": {
        "@type": "住所型",
        "表記": "東京都千代田区霞が関二丁目",
        "都道府県": "東京都",
        "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
        "市区町村": "千代田区",
        "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
        "町名": "霞が関",
        "丁目": "2"
      },
      "地理座標": {
        "@type": "座標型",
        "緯度": "35.675551",
        "経度": "139.750413"
      }
    },
    ...
  ]
}
```

### 歴史地名データの検索

imi-enrichment-addressは、現在の住所データ([国土地理院 位置参照情報](https://nlftp.mlit.go.jp/cgi-bin/isj/dls/_choose_method.cgi))が検索対象ですが、本モジュールは、現在の住所に加え、過去の地名の検索にも対応しました。
過去の地名は、[大学共同利用機関法人 人間文化研究機構](https://www.nihu.jp/ja)が公開する[歴史地名データ](https://www.nihu.jp/ja/publication/source_map)を利用しています。

文字列による検索(部分一致で検索された最大10件)のほか、緯度経度による逆ジオコーディング検索(3km範囲内の最も近い過去の地名5件)にも対応しています。

あらかじめ逆ジオコーディング機能により、過去の地名の最も近くにある現在の住所を付与しています。
検索結果の`住所`プロパティ内の2つの住所型のオブジェクトのうち`種別`が`歴史地名データ`であるほうが歴史地名データ、`位置参照情報`が現在の住所になります。

```
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "場所": [
    {
      "@type": "場所型",
      "住所": [
        {
          "@type": "住所型",
          "種別": "歴史地名データ",
          "ID": "10025110",
          "町名": "神保町",
          "説明": "「大日本地名辞書」6巻 352頁",
          "都道府県": "武蔵",
          "都道府県コード": "594",
          "市区町村": "神田区",
          "市区町村コード": "917"
        },
        {
          "@type": "住所型",
          "表記": "東京都千代田区神田神保町二丁目",
          "都道府県": "東京都",
          "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
          "市区町村": "千代田区",
          "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
          "町名": "神田神保町",
          "丁目": "2",
          "種別": "位置参照情報"
        }
      ],
      "地理座標": [
        {
          "@type": "座標型",
          "緯度": "35.695555",
          "経度": "139.757500"
        }
      ]
    },
    ...
  ]
}
```

## インストール

```
$ npm install https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.1.2/imi-enrichment-address-plus-1.1.2.tgz
```

コマンドラインインタフェースの場合は、`-g`をつけてグローバル環境にインストールしてください。

```
$ npm install -g https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.1.2/imi-enrichment-address-plus-1.1.2.tgz
```

## 利用方法

本モジュールは、以下の3つの方法で利用できます。

- コマンドラインインタフェース
- Web API
- API (Node.js)

上記すべての共通の入力値として`JSON-LD`を利用します。

### 入力JSON

#### 住所表記の正規化

`住所.表記` に正規化したい文字列を入力してください

```input.json
{
  "@type": "場所型",
  "住所" : {
    "@type": "住所型",
    "表記" : "霞が関2"
  }
}
```

#### 逆ジオコーディング

検索したい緯度経度の値を以下のJSON-LDに当てはめて作成してください。

```input.json
{
  "@type": "座標型",
  "緯度": "[緯度の値]",
  "経度": "[経度の値]"
}
```

#### 過去の地名(歴史地名データ)の検索

##### 文字列による検索

住所表記の正規化と同じですが、`住所.種別` に `歴史地名データ` を追加してください。

```input.json
{
  "@type": "場所型",
  "住所" : {
    "@type": "住所型",
    "種別": "歴史地名データ",
    "表記" : "神保町"
  }
}
```

###### 逆ジオコーディング

上記と同じく、`住所.種別`に`歴史地名データ`を追加して、緯度経度は、`地理座標`オブジェクトに追加してください。

```input.json
{
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "種別": "歴史地名データ"
  },
  "地理座標": {
    "@type": "座標型",
    "緯度": "[緯度の値]",
    "経度": "[経度の値]"
  }
}
```

### コマンドラインインタフェース

コマンドラインインタフェースは以下のように利用できます。

```
# ヘルプの表示
$ imi-enrichment-address-plus -h

# JSON ファイルの変換
$ imi-enrichment-address-plus input.json > output.json

# 標準入力からの変換
$ cat input.json | imi-enrichment-address-plus > output.json

# 緯度経度を利用して検索(逆ジオコーディング)
$ imi-enrichment-address-plus --lat 35.675551 --lng 139.750413 > output.json

# 文字列で歴史地名データを検索
$ imi-enrichment-address-plus -s 神保町 --old > output.json

# 緯度経度を利用して歴史地名データを検索(逆ジオコーディング)
$ imi-enrichment-address-plus --lat 35.675551 --lng 139.750413 --old > output.json
```

### Web API

まず、以下のようにサーバを起動してください。

```
$ node node_modules/imi-enrichment-address-plus/bin/server.js
Usage: node server.js [port number]

$ node node_modules/imi-enrichment-address-plus/bin/server.js 8080
imi-enrichment-address-server is running on port 8080
```

そして、以下のように入力 JSON を POST してください。

```
$ curl -X POST -H 'Content-Type: application/json' -d '{"@type":"場所型","住所":{"@type":"住所型","表記":"霞が関2"}}' localhost:8080
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "表記": "霞が関2",
    "都道府県": "東京都",
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
    "市区町村": "千代田区",
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
    "町名": "霞が関",
    "丁目": "2"
  },
  "地理座標": {
    "@type": "座標型",
    "緯度": "35.675551",
    "経度": "139.750413"
  }
}
```

### API (Node.js)

imi-enrichment-address-plus は nodeモジュールとしてコード上からも利用可能です。

- 入力 (input) : 変換対象となる JSON、住所文字列、緯度経度
- 出力 : 変換結果の JSON-LD オブジェクトを返却する Promise ※ 変換は非同期で行うために Promise が返されます

#### 住所表記の正規化

```
const convert = require('imi-enrichment-address');
convert("霞が関2").then(json=>{
  console.log(json);
});
```

#### 逆ジオコーディング

```
const convert = require('imi-enrichment-address-plus');
const point = {
  lat: 35.675551,
  lng: 139.750413
}
convert(point).then(json=>{
  console.log(json);
});
```

#### 歴史地名データの検索(文字列)

```
convert("神保町", "old").then(json=>{
  console.log(json);
});
```

#### 歴史地名データの検索(逆ジオコーディング)

```
const point = {
  lat: 35.675551,
  lng: 139.750413
}
convert(point, "old").then(json=>{
  console.log(json);
});
```

## 開発者向け情報

imi-enrichment-address とほぼ同じです。
[imi-enrichment-addressのREADME.md](https://github.com/IMI-Tool-Project/imi-enrichment-address/blob/master/README.md)
を参照してください。

環境構築のビルドのみ一部異なります。

```
$ git clone https://github.com/uedayou/imi-enrichment-address-plus.git
$ cd imi-enrichment-address-plus
$ npm install
$ npm run download
$ npm run tree
$ npm run format
$ npm run hp-list
$ npm run hp-format
```
