# imi-enrichment-address-plus

imi-enrichment-address-plus は、経済産業省作成の[imi-enrichment-address(住所変換コンポーネント)](https://github.com/IMI-Tool-Project/imi-enrichment-address)に、逆ジオコーディング機能を追加した派生版です。

任意の緯度経度の値を与えることにより、特定の範囲内(デフォルトは1km)の最も近い住所データを返します。

imi-enrichment-address で使用できる機能もすべて利用できます。
imi-enrichment-address の機能については、[imi-enrichment-addressのREADME.md](https://github.com/IMI-Tool-Project/imi-enrichment-address/blob/master/README.md)を参照してください。

ここでは、逆ジオコーディング機能の利用方法について主に説明します。

## 利用方法

imi-enrichment-address と同じくコマンドラインインターフェイスとWeb APIの両方で逆ジオコーディング機能を利用できます。

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

緯度経度の値が不正な場合や範囲内に住所データがなかった場合は、以下のようなエラーが表示されます。

- 不正な経緯度です
- 範囲内に住所が見つかりませんでした

### インストール

本リポジトリは開発者向けのコードのため、一般利用の場合は、
以下のようにパッケージ済みモジュールをインストールしてください。

```
$ npm install https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.0.0/imi-enrichment-address-plus-1.0.0.tgz
```

### コマンドラインインターフェイス

`imi-enrichment-address-plus-1.0.0.tgz` には`imi-enrichment-address`と同じくコマンドラインインターフェイスが利用できます。

```
$ npm install -g https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.0.0/imi-enrichment-address-plus-1.0.0.tgz

# ヘルプの表示
$ imi-enrichment-address-plus -h

# JSON ファイルの変換
$ imi-enrichment-address-plus input.json > output.json

# 標準入力からの変換
$ cat input.json | imi-enrichment-address-plus > output.json

# 緯度経度から直接変換
$ imi-enrichment-address-plus --lat 35.675551 --lng 139.750413 > output.json

```

## Web API

Web APIも imi-enrichment-address 同様利用できます。

### サーバの起動方法

```
$ npm install https://github.com/uedayou/imi-enrichment-address-plus/releases/download/v1.0.0/imi-enrichment-address-plus-1.0.0.tgz
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

## 開発者向け情報

imi-enrichment-address-plusのビルド等は imi-enrichment-address と同じです。
[imi-enrichment-addressのREADME.md](https://github.com/IMI-Tool-Project/imi-enrichment-address/blob/master/README.md)
を参照してください。
