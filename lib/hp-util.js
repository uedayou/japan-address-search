const fs = require('fs');
const readline = require('readline');
const simplify = require('./util').simplify;

exports.getPlaceNames = async (file) => {
  let data = {};
  const stream = fs.createReadStream(file);
  const lines = readline.createInterface({ input: stream });
  for await (const val of lines) {
    const col = simplify(val).trim().replace(/"/g, "").split(",");
    if (col.length !== 11) continue;
    const id = col[0];
    if (!id.match(/^[0-9]+$/)) continue;
    const name = col[1],
          attribute_id = col[2],
          shape = col[3],
          lat = col[4],
          lng = col[5],
          lat2 = col[6],
          lng2 = col[7],
          reference = col[8],
          detail = col[9],
          notes = col[10];
    data[id] = {
      id,
      name,
      attribute_id,
      shape,
      lat,
      lng,
      lat2,
      lng2,
      reference,
      detail,
      notes
    };
  }
  return data;
}

exports.getRelation = async (file) => {
  let data = {};
  const stream = fs.createReadStream(file);
  const lines = readline.createInterface({ input: stream });
  for await (const val of lines) {
    const col = simplify(val).trim().replace(/"/g, "").split(",");
    if (col.length !== 7) continue;
    const id = col[0];
    if (!id.match(/^[0-9]+$/)) continue;
    const lower_id = col[1],
          lower_name = col[2],
          upper_id = col[3],
          upper_name = col[4],
          upper_type = col[5];
    if (!(lower_id in data)) data[lower_id] = [];
    data[lower_id].push({
      id,
      lower_id,
      lower_name,
      upper_id,
      upper_name,
      upper_type
    });
  }
  return data;
}

exports.getAttributes = async (file) => {
  let data = {};
  const stream = fs.createReadStream(file);
  const lines = readline.createInterface({ input: stream });
  for await (const val of lines) {
    const col = simplify(val).trim().replace(/"/g, "").split(",");
    if (col.length !== 4) continue;
    const id = col[0];
    if (!id.match(/^[0-9]+$/)) continue;
    const type = col[1],
          name = col[2],
          upper_id = col[3];
    if (!(id in data)) data[id] = [];
    data[id].push({
      id,
      type,
      name,
      upper_id
    });
  }
  return data;
}

exports.createAddressObject = (data, relation) => {
  const address = 
  {
    "@type": "住所型",
    "種別": "歴史地名データ",
    "ID": data.id,
    "町名": data.name,
    "説明": "「"+data.reference+"」"+data.detail+(data.notes.length>0?"〔"+data.notes+"〕":"")
  };
  const location = [];
  if (data.lat && data.lng) {
    location.push({
      "@type": "座標型",
      "緯度": data.lat,
      "経度": data.lng
    });
  }
  if (data.lat2 && data.lng2) {
    location.push({
      "@type": "座標型",
      "緯度": data.lat2,
      "経度": data.lng2
    });
  }
  for (const up of relation) {
    if (up.upper_type=="国" || 
      up.upper_type=="旧国名" ||
      (up.upper_type=="都道府県名" && !address["都道府県"])) {
      address["都道府県"] = up.upper_name;
      address["都道府県コード"] = up.upper_id;
    } else if (up.upper_type=="郡") {
      address["市区町村"] = up.upper_name;
      address["市区町村コード"] = up.upper_id;
    }
  }
  const json = {
    "@type": "場所型",
    "住所": [address]
  }
  if (location.length>0) {
    json["地理座標"] = location;
  }
  return json;
}