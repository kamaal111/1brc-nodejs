import readline from "node:readline";
import fs from "node:fs";

const fileName = process.argv[2];
const lineStream = readline.createInterface({
  input: fs.createReadStream(fileName),
});

const aggregations = new Map();

lineStream.on("line", (line) => {
  const [stationName, temperatureStr] = line.split(";");

  // use integers for computation to avoid loosing precision
  const temperature = Math.floor(parseFloat(temperatureStr) * 10);

  const existing = aggregations.get(stationName);

  if (existing) {
    existing.sum += temperature;
    existing.count += 1;
    existing.min = Math.min(existing.min, temperature);
    existing.max = Math.max(existing.max, temperature);
  } else {
    aggregations.set(stationName, {
      sum: temperature,
      min: temperature,
      max: temperature,
      count: 1,
    });
  }
});

lineStream.on("close", () => {
  printCompiledResults(aggregations);
});

/**
 * @param {Map} aggregations
 *
 * @returns {void}
 */
function printCompiledResults(aggregations) {
  const calculatedAggregations = Array.from(aggregations.keys())
    .sort()
    .map((station) => {
      const data = aggregations.get(station);
      const roundedMin = round(data.min / 10);
      const roundedSum = round(data.sum / 10 / data.count);
      const roundedMax = round(data.max / 10);
      return `${station}=${roundedMin}/${roundedSum}/${roundedMax}`;
    })
    .join(", ");

  console.log(`{${calculatedAggregations}}`);
}

/**
 * @example
 * round(1.2345) // "1.2"
 * round(1.55) // "1.6"
 * round(1) // "1.0"
 *
 * @param {number} num
 *
 * @returns {string}
 */
function round(num) {
  const fixed = Math.round(10 * num) / 10;

  return fixed.toFixed(1);
}
