import * as d3 from "d3";

const body = document.getElementById("stackedBarChart");
const graphWidth = body.clientWidth - 150,
  graphHeight = body.clientHeight - 150;
const margin = 100;

const svg = d3.select("#scatterplot").append("svg");
svg.attr(
  "viewBox",
  `0 0 ${graphWidth + margin * 2} ${graphHeight + margin * 2}`
);

export function initStackedBarChart() {
  console.log("hi");
}
