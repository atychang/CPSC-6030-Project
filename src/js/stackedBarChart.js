import * as d3 from "d3";

import worldHappiness from "../public/datasets/world-happiness.json";

const colors = [
  "#98abc5",
  "#8a89a6",
  "#7b6888",
  "#6b486b",
  "#a05d56",
  "#d0743c",
];

const body = document.getElementById("stackedBarChart");
const graphWidth = body.clientWidth - 150,
  graphHeight = body.clientHeight - 150;
const margin = 100;

const svg = d3.select("#stackedBarChart").append("svg");
svg.attr(
  "viewBox",
  `0 0 ${graphWidth + margin * 2} ${graphHeight + margin * 2}`
);

const graph = svg
  .append("g")
  .attr("position", "relative")
  .attr("transform", `translate(${margin}, ${margin})`);

const xScale = d3.scaleLinear().domain([2014, 2021]).range([0, graphWidth]);
const xAxis = d3.axisBottom(xScale).ticks(8);
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`)
  .call(xAxis);

const yScale = d3.scaleLinear().domain([2, 0]).range([0, graphHeight]);
const yAxis = d3.axisLeft(yScale).ticks(20);
const yAxisGroup = graph.append("g").call(yAxis);

export function initStackedBarChart() {
  console.log("hi");
}
