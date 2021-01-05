const { isMainThread, parentPort, threadId } = require("worker_threads");
const geolib = require("geolib");

if (isMainThread) {
  throw new Error("Its not a worker");
}

const doCalcs = (data) => {
  //calculate distance between 2 points
  const distance = geolib.getDistance(
    { latitude: data[0].latitude, longitude: data[0].longitude },
    { latitude: data[1].latitude, longitude: data[1].longitude }
  );

  //prepare data for return
  data[1].distance_from_prev_point = distance;
  data[1].worker_id = threadId;

  return data[1];
};

parentPort.on("message", (data) => {
  const result = doCalcs(data);
  parentPort.postMessage(result);
});
