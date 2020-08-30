const DEFAULT_RADIUS = 1000;

function geoSearch(geo, point, radius) {
  if (!radius) radius = DEFAULT_RADIUS;
  return new Promise((resolve, reject) => {
    let data = [];
    const stream = geo.search(point, radius);
    stream.on("data", result => data.push(result));
    stream.on("end", () => {
      data.sort((a,b)=>a.distance-b.distance);
      resolve(data);
    });
    stream.on("error", error => reject(error));
  });
}

module.exports = geoSearch;