const hpUtil = require('../lib/hp-util');

async function main() {
  const lower = await hpUtil.getPlaceNames(process.argv[2]);
  const list = createAddressList(lower);
  console.log(JSON.stringify(list, null, 1));
}

function createAddressList(data) {
  const list = {}; 
  for (const id of Object.keys(data)) {
    if (!(data[id].name in list))
      list[data[id].name] = [];
    list[data[id].name].push(id);
  }
  return list;
}

main();