const { parseAsync } = require("json2csv");
const { promises: fs } = require("fs");

async function saveJsonToCsv(dataForCsv, opts, outputFile) {
  try {
    //convert json to csv format
    const csv = await parseAsync(dataForCsv, opts);
    //save csv to file
    await fs.writeFile(outputFile, csv);
    return null;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports.saveJsonToCsv = saveJsonToCsv;
