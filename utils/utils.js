function groupJson(jsonArray, groupBy) {
  const map = new Map();

  for (const item of jsonArray) {
    if (map.has(item[groupBy])) {
      const temp = map.get(item[groupBy]);
      temp.push(item);
      map.set(item[groupBy], temp);
    } else {
      map.set(item[groupBy], [item]);
    }
  }

  return map;
}

module.exports.groupJson = groupJson;
