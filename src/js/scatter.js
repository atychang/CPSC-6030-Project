import * as d3 from "d3";

import worldHappiness from "../public/datasets/world-happiness.json";
const defaultData = [];
for (const [_, info] of Object.entries(worldHappiness["2015"])) {
  defaultData.push(info);
}

const body = document.getElementById("scatterplot");
let graphWidth = body.clientWidth - 150,
  graphHeight = body.clientHeight - 150;
const margin = 100;

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
  "Select all region",
];
const svg = d3.select("#scatterplot").append("svg");

const graph = svg
  .append("g")
  .attr("position", "relative")
  .attr("transform", `translate(${margin}, ${margin})`);

const xScale = d3.scaleLinear().domain([0, 2]).range([0, graphWidth]);
const xAxis = d3.axisBottom(xScale).ticks(20);
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`)
  .call(xAxis);

const yScale = d3.scaleLinear().domain([2, 0]).range([0, graphHeight]);
const yAxis = d3.axisLeft(yScale).ticks(20);
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
  .attr("fill", "white")
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
  .attr("fill", "white")
  .text("Happiness Score");

graph
  .append("g")
  .selectAll("circle")
  .data(defaultData)
  .enter()
  .append("circle")
  .attr(
    "class",
    (d) =>
      `country-${d["Country"]} region-${d["Region"]
        .split(" ")
        .join("-")} country-circle`
  )
  .attr("cx", (d) => xScale(d["Economy (GDP per Capita)"]))
  .attr("cy", (d) => yScale(d["Happiness Score"]))
  .attr("fill", (d) => {
    const idx = regions.indexOf(d["Region"]);
    return color[idx];
  })
  .attr("r", "5");

const legend = graph
  .selectAll(".legend")
  .data(regions)
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("position", "absolute")
  .attr("transform", `translate(${graphWidth - margin}, ${0})`);

legend
  .append("rect")
  .attr("x", 0)
  .attr("y", function (d, i) {
    return 20 * i;
  })
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", function (d) {
    const idx = regions.indexOf(d);
    return color[idx];
  })
  .text(function (d) {
    return d;
  });

legend
  .append("text")
  .attr("x", 25)
  .attr("text-anchor", "start")
  .attr("y", function (d, i) {
    return 20 * i;
  })
  .attr("dy", "1.15em")
  .text(function (d) {
    return d;
  })
  .attr("font-size", "12px")
  .style("fill", "white");

export default function initScatter(index, year) {
  graphWidth = body.clientWidth - 150;
  graphHeight = body.clientHeight - 150;
  svg.attr(
    "viewBox",
    `0 0 ${graphWidth + margin * 2} ${graphHeight + margin * 2}`
  );

  xLabel
    .attr("y", graphHeight + 50)
    .attr("x", graphWidth / 2)
    .text(index);
  yLabel.attr("x", -(graphHeight / 2));

  legend.attr("transform", `translate(${graphWidth - margin}, ${0})`);

  const data = [];
  for (const [_, info] of Object.entries(worldHappiness[year])) {
    data.push(info);
  }

  const xMax = Math.ceil(d3.max(data, (d) => d[index]));
  xScale.domain([0, xMax]).range([0, graphWidth]);
  xAxisGroup
    .attr("transform", `translate(0, ${graphHeight})`)
    .transition()
    .call(xAxis);

  const yMax = Math.ceil(d3.max(data, (d) => d["Happiness Score"]));
  yScale.domain([yMax, 0]).range([0, graphHeight]);
  yAxisGroup.transition().call(yAxis);

  graph
    .selectAll(".country-circle")
    .data(data)
    .transition()
    .duration(750)
    .attr("cx", (d) => xScale(d[index]))
    .attr("cy", (d) => yScale(d["Happiness Score"]));
}
