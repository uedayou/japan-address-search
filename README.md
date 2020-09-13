# imi-enrichment-address-plus

imi-enrichment-address-plus は、経済産業省作成の[imi-enrichment-address(住所変換コンポーネント)](https://github.com/IMI-Tool-Project/imi-enrichment-address)の派生版です。

imi-enrichment-address の機能の他、以下の機能を利用できます。

- 逆ジオコーディング機能
- [歴史地名データ](https://www.nihu.jp/ja/publication/source_map)の検索

imi-enrichment-address で使用できる機能もすべて利用できます。
imi-enrichment-address の機能については、[imi-enrichment-addressのREADME.md](https://github.com/IMI-Tool-Project/imi-enrichment-address/blob/master/README.md)を参照してください。

ここでは、上記2つの拡張機能の利用方法について主に説明します。

## 拡張機能概要

### 逆ジオコーディング機能

任意の緯度経度の値を与えることにより、特定の範囲内(デフォルトは3km)にある最も近い最大5件の住所データを返します。

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
          "ID": "10033625",
          "町名": "永田町",
          "説明": "「大日本地名辞書」6巻 274頁",
          "都道府県": "武蔵",
          "都道府県コード": "594",
          "市区町村": "麹町区",
          "市区町村コード": "797"
        },
        {
          "@type": "住所型",
          "表記": "東京都千代田区永田町一丁目",
          "都道府県": "東京都",
          "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
          "市区町村": "千代田区",
          "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
          "町名": "永田町",
          "丁目": "1",
          "種別": "位置参照情報"
        }
      ],
      "地理座標": [
        {
          "@type": "座標型",
          "緯度": "35.676388",
          "経度": "139.746388"
        }
      ]
    },
    ...
  ]
}
```

## 利用方法

imi-enrichment-address と同じくコマンドラインインターフェイスとWeb APIの両方で逆ジオコーディング機能を利用できます。

現在、歴史地名データの検索はコマンドラインインタフェースのみ対応しています。コマンドラインインタフェースで歴史地名データの検索を行うには`--old`オプションを付与してください。

### 入力JSON

逆ジオコーディング機能を使うには、入力値としてJSONーLDを利用します。
検索したい緯度経度の値を以下のJSON-LDに当てはめて作成してください。

```input.json
{
  "@type": "座標型",
  "緯度": "[緯度の値]",
  "経度": "[経度の値]"
}
```

例えば、以下のような値を入力すると
```input.json
{
  "@type": "座標型",
  "緯度": "35.675551",
  "経度": "139.750413"
}
```

以下の結果が得られます。
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

緯度経度の値が不正な場合や範囲内に住所データがなかった場合は、以下のようなエラーが表示されます。

- 不正な経緯度です
- 範囲内に住所が見つかりませんでした

### インストール

本リポジトリは開発者向けのコードのため、一般利用の場合は、
以下のようにパッケージ済みモジュールをインストールしてください。

```
$ npm install https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.1.1/imi-enrichment-address-plus-1.1.1.tgz
```

### コマンドラインインターフェイス

`imi-enrichment-address-plus-1.1.1.tgz` には`imi-enrichment-address`と同じくコマンドラインインターフェイスが利用できます。

```
$ npm install -g https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.1.1/imi-enrichment-address-plus-1.1.1.tgz

# ヘルプの表示
$ imi-enrichment-address-plus -h

# JSON ファイルの変換
$ imi-enrichment-address-plus input.json > output.json

# 標準入力からの変換
$ cat input.json | imi-enrichment-address-plus > output.json

# 緯度経度を利用して検索(逆ジオコーディング)
$ imi-enrichment-address-plus --lat 35.675551 --lng 139.750413 > output.json

# 文字列で歴史地名データを検索
$ imi-enrichment-address-plus -s 永田町 --old > output.json

# 緯度経度を利用して歴史地名データを検索(逆ジオコーディング)
$ imi-enrichment-address-plus --lat 35.675551 --lng 139.750413 --old > output.json
```

## Web API

Web APIも imi-enrichment-address 同様利用できます。

### サーバの起動方法

```
$ npm install https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.1.1/imi-enrichment-address-plus-1.1.1.tgz
$ node node_modules/imi-enrichment-address-plus/bin/server.js
Usage: node server.js [port number]

$ node node_modules/imi-enrichment-address-plus/bin/server.js 8080
imi-enrichment-address-server is running on port 8080
```

### 利用方法

WebAPI は POST された JSON または テキストを入力として JSON を返します。

```
$ curl -X POST -H 'Content-Type: application/json' -d '{"@type": "座標型","緯度": "35.675551","経度": "139.750413"}' localhost:8080
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
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
}
```

## API (Node.js)

Node.js では以下のように逆ジオコーディングを利用できます。

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

歴史地名データを検索したい場合は`convert`の第2引数に`old`を与えてください。
```
convert(point, "old").then(json=>{
  console.log(json);
});
```

文字列も検索できます。
```
convert("永田町", "old").then(json=>{
  console.log(json);
});
```

## 開発者向け情報

imi-enrichment-address-plusのビルド等は imi-enrichment-address と同じです。
[imi-enrichment-addressのREADME.md](https://github.com/IMI-Tool-Project/imi-enrichment-address/blob/master/README.md)
を参照してください。
