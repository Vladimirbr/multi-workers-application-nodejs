const path = require("path");

const groupJson = require("./utils/utils").groupJson;
const loadCsvToJson = require("./utils/loadCsv").loadCsv;
const poolSize = require("./config").poolSize;
const WorkerPool = require("./workers/workerPool");
const saveJsonToCsv = require("./utils/saveJsonToCsv").saveJsonToCsv;

const csvFilePath = require("./config").csvFilePath;
const outputFile = require("./config").outputFile;

async function run() {
  try {
    //load csv from file and convert to json
    const jsonArray = await loadCsvToJson(csvFilePath);

    //group json by vehicle_id
    const groupedMap = groupJson(jsonArray, "vehicle_id");

    //create new worker pool
    const pool = new WorkerPool(path.join(__dirname, "workers", "worker.js"), poolSize);

    let dataForCsv = [];

    for ([mapKey, mapValue] of groupedMap) {
      if (mapValue && mapValue.length < 2) {
        mapValue[0].distance_from_prev_point = 0;
        mapValue[0].worker_id = -1;

        groupedMap.set(mapKey, mapValue);
      } else {
        mapValue.sort((a, b) => {
          return a.row_id - b.row_id;
        });

        mapValue[0].distance_from_prev_point = 0;
        mapValue[0].worker_id = -1;

        groupedMap.set(mapKey, mapValue);

        const dataForWork = [];

        for (let i = 1; i < mapValue.length; i++) {
          //make data for worker
          dataForWork.push([mapValue[i - 1], mapValue[i]]);

          //send data to workers
          await Promise.all(
            dataForWork.map(async (value, i) => {
              const workerResult = await pool.run(() => value);
              //update map json data by recieved data from worker
              mapValue[i + 1] = workerResult;
              groupedMap.set(mapKey, mapValue);
            })
          );
        }
      }

      //concat data for csv
      dataForCsv = dataForCsv.concat(...groupedMap.get(mapKey));
    }

    //csv convert options
    const fieldsForJsonToCsv = ["row_id", "vehicle_id", "latitude", "longitude", "distance_from_prev_point", "worker_id"];
    const csvOpts = { fieldsForJsonToCsv };

    //convert csv to json and save to file
    await saveJsonToCsv(dataForCsv, csvOpts, outputFile);

    console.log("Process Done!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
}

run();
