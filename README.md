# multi-workers-application-nodejs

# Multi Workers application

Server-side application with a main process and multiple worker threads.

The number of worker threads configured by using a local config file.

#### The main process read a local csv file with the following structure

| Column name | Type   | Description                   |
| ----------- | ------ | ----------------------------- |
| row_id      | Number | Unique row id in the file     |
| vehicle_id  | Number | Unique identity for a vehicle |
| latitude    | float  |
| longitude   | float  |

Note – each vehicle may have a different number of rows.

The main process group the data based on the vehicle_id column.

For each vehicle, the main process activate a worker thread to process the data.

Each worker calculate the distance in meters between 2 consecutive points, keeping the order of the data based on the row_id in ascending order.

Once a worker completes its task, the main process allocate it a new vehicle to process, until all vehicles are processed.

The output of this application is a local csv file with the same input structure with an additional 2 columns for:

- istance_from_prev_point
- worker_id
