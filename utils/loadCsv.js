const csv = require("csvtojson");

const loadCsv = async (csvFilePath) => {
  //load csv from file to json format
  const jsonArray = await csv().fromFile(csvFilePath);
  return jsonArray;
};

module.exports.loadCsv = loadCsv;
