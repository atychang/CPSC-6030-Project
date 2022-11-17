import * as d3 from "d3";

import worldHappiness from "../public/datasets/world-happiness.json";
const rawdata = worldHappiness["2015"];
let index = "Economy (GDP per Capita)";

const color = d3.schemeTableau10;
const regions = [
  "Western Europe",
  "North America",
  "Australia and New Zealand",
  "Middle East and Northern Africa",
  "Latin America and Caribbean",
  "Southeastern Asia",
  "Central and Eastern Europe",
  "Eastern Asia",
  "Sub-Saharan Africa",
  "Southern Asia",
  "All",
];

export default function initScatter() {
  const data = [];
  for (const [_, info] of Object.entries(rawdata)) {
    data.push(info);
  }

  const body = document.getElementById("scatterplot");
  const graphWidth = body.clientWidth - 150,
    graphHeight = body.clientHeight - 150,
    margin = 100;

  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${graphWidth + margin * 2} ${graphHeight + margin * 2}`
    );

  const graph = svg
    .append("g")
    .attr("position", "relative")
    .attr("transform", `translate(${margin}, ${margin})`);

  const xMax = Math.ceil(d3.max(data, (d) => d[index]));
  const x = d3.scaleLinear().domain([0, xMax]).range([0, graphWidth]);

  const xAxis = d3.axisBottom(x).ticks(20);

  const xAxisGroup = graph
    .append("g")
    .attr("transform", `translate(0, ${graphHeight})`)
    .call(xAxis)
    .attr("class", "x-axis");

  const yMax = Math.ceil(d3.max(data, (d) => d["Happiness Score"]));
  const y = d3.scaleLinear().domain([yMax, 0]).range([0, graphHeight]);

  const yAxis = d3.axisLeft(y).ticks(20);

  const yAxisGroup = graph.append("g").call(yAxis);

  const xLabel = graph
    .append("g")
    .append("text")
    .attr("class", "x-axis-label")
    .attr("y", graphHeight + 50)
    .attr("x", graphWidth / 2)
    .attr("font-size", "18px")
    .attr("font-weight", "600")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

  const yLabel = graph
    .append("g")
    .append("text")
    .attr("class", "yAxisGroup")
    .attr("transform", "rotate(-90)")
    .attr("x", -(graphHeight / 2))
    .attr("y", -50)
    .attr("font-size", "18px")
    .attr("font-weight", "600")
    .attr("text-anchor", "middle")
    .text("Happiness Index (%)");

  const circles = graph
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[index]))
    .attr("cy", (d) => y(d["Happiness Score"]))
    .attr("fill", (d) => {
      const idx = regions.indexOf(d["Region"]);
      return color[idx];
    })
    .attr("r", "5");
}
