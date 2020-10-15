# japan-address-search

日本の住所を文字列と緯度経度で検索できるNode.jsモジュールです。
現在の住所データ以外に古い地名(明治時代以前の地名)の検索にも対応しています。

このモジュールでは以下のことができます。

- 現在の住所データ
  - 表記の正規化
  - 部分一致検索
  - 逆ジオコーディング検索(緯度経度による検索)
- 古い地名データ
  - 部分一致検索
  - 逆ジオコーディング検索(緯度経度による検索)

## インストール

コード内で使用する場合は以下のようにインストールしてください。
```
$ npm install japan-address-search
```

コマンドラインインタフェースで使用する場合は、`-g`をつけてグローバル環境にインストールしてください。
```
$ npm install -g japan-address-search
```

## 使い方

node.js モジュールとしてインストールすると以下のようにコード上から実行できます。

現在の住所データの正規化・部分一致検索(デフォルト10件)
```
const convert = require('japan-address-search');
convert("霞が関2").then(json=>{
  console.log(json);
});
```

現在の住所データの逆ジオコーディング検索(デフォルト10件)
```
const convert = require('japan-address-search');
const point = {
  lat: 35.675551,
  lng: 139.750413
}
convert(point).then(json=>{
  console.log(json);
});
```

古い地名データの部分一致検索(デフォルト10件)
```
const convert = require('japan-address-search');
convert("神保町", {type: "old"}).then(json=>{
  console.log(json);
});
```

古い地名データの逆ジオコーディング検索(デフォルト10件)
```
const convert = require('japan-address-search');
const point = {
  lat: 35.675551,
  lng: 139.750413
}
convert(point, {type: "old"}).then(json=>{
  console.log(json);
});
```

検索件数の上限を変更したい場合は、以下のように指定してください。
```
// 検索件数を5件に変更
convert(point, {type: "old", limit: 5}).then(json=>{
  console.log(json);
});
```


コマンドラインインターフェースでは以下のように利用できます。
```
# 現在の住所データの正規化・部分一致検索
$ japan-address-search -s 神保町 > output.json

# 現在の住所データの逆ジオコーディング検索
$ japan-address-search --lat 35.675551 --lng 139.750413 > output.json

# 古い地名データの部分一致検索
$ japan-address-search -s 神保町 --old > output.json

# 古い地名データの逆ジオコーディング検索
$ japan-address-search --lat 35.675551 --lng 139.750413 --old > output.json

# 検索件数の上限を変更
$ japan-address-search -s 神保町 --limit 5 > output.json
```

## 出力例

検索結果は以下のようなJSONデータとして出力されます。

検索された住所が現在の住所データか古い地名データかは住所オブジェクト内の`種別`の値で判別できます。

種類 | 種別の値
--- | ---
現在の住所 | 位置参照情報
古い地名 | 歴史地名データ

現在の住所データの検索結果
```
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "場所": [
    {
      "@type": "場所型",
      "住所": [
        {
          "@type": "住所型",
          "表記": "霞が関2",
          "都道府県": "東京都",
          "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
          "市区町村": "千代田区",
          "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
          "町名": "霞が関",
          "丁目": "2",
          "種別": "位置参照情報"
        }
      ],
      "地理座標": {
        "@type": "座標型",
        "緯度": "35.675551",
        "経度": "139.750413"
      }
    }
  ]
}
```

古い地名データの検索結果
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

## 使用しているデータについて

`japan-address-search`で使用してる現在の住所データと古い地名データとして、以下で公開されているオープンデータを使用しています。

データ | データソース | バージョン | ライセンス
--- | --- | --- | ---
現在の住所データ | [国土地理院 位置参照情報](https://nlftp.mlit.go.jp/cgi-bin/isj/dls/_choose_method.cgi) | 令和元年度版 | [利用規約](https://nlftp.mlit.go.jp/ksj/other/agreement.html)
現在の住所データ | [統計LOD](http://data.e-stat.go.jp/lodw/) | 2020/10/06取得 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)
古い地名データ | [歴史地名データ](https://www.nihu.jp/ja/publication/source_map) | 2020/09/07取得 | [利用規約](https://www.nihu.jp/ja/publication/source_map/about)

## 謝辞

`japan-address-search` は経済産業省が公開する[imi-enrichment-address(住所変換コンポーネント)](https://github.com/IMI-Tool-Project/imi-enrichment-address)を元に作成しました。
経済産業省、並びに、上記データを公開されている国土地理院、総務省統計局、人間文化研究機構、H-GIS研究会には深く感謝いたします。
