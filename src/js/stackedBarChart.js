import * as d3 from "d3";
import { color } from "d3";

import worldHappiness from "../public/datasets/world-happiness.json";

const fields = [
  "Economy (GDP per Capita)",
  "Family (Social Support)",
  "Health (Life Expectancy)",
  "Freedom",
  "Trust (Government Corruption)",
  "Generosity",
];

const colors = [
  "#98abc5",
  "#8a89a6",
  "#7b6888",
  "#6b486b",
  "#e7f52a",
  "#d0743c",
];

const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021];

const colorScale = d3.scaleOrdinal().domain(fields).range(colors);

const body = document.getElementById("stackedBarChart");
const containerWidth = body.clientWidth,
  containerHeight = body.clientHeight,
  margin = {
    top: 75,
    right: 210,
    bottom: 75,
    left: 75,
  },
  width = containerWidth - margin.left - margin.right,
  height = containerHeight - margin.top - margin.bottom;

const svg = d3.select("#stackedBarChart").append("svg");
svg
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

const graph = svg
  .append("g")
  .attr("position", "relative")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.append("g").attr("class", "stackedbar");
svg.append("g").attr("class", "line");
svg.append("g").attr("class", "dot");

const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.5);
const xAxis = d3.axisBottom(xScale).ticks(8);
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

const yScale = d3.scaleLinear().domain([0, 8]).range([height, 0]);
const yAxis = d3.axisLeft(yScale).ticks(20);
const yAxisGroup = graph.append("g").call(yAxis);

// legends
const legend = graph
  .selectAll(".legend")
  .data(fields)
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("position", "absolute")
  .attr("transform", `translate(${width}, ${0})`);

legend
  .append("rect")
  .attr("x", 0)
  .attr("y", function (d, i) {
    return 20 * i;
  })
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", colorScale)
  .text((d) => d);

legend
  .append("text")
  .attr("x", 25)
  .attr("text-anchor", "start")
  .attr("y", function (d, i) {
    return 20 * i;
  })
  .attr("dy", "1.15em")
  .text((d) => d)
  .attr("font-size", "12px")
  .style("fill", "white");

const line = d3
  .line()
  .x((d) => xScale(+d.year) + margin.left + 20)
  .y((d) => yScale(d["Happiness Score"]) + margin.top);

let selectedCountry = null;

export function initStackedBarChart(country) {
  resetStackedBar();
  if (country === null || selectedCountry === country) {
    selectedCountry = null;
    return;
  }
  selectedCountry = country;

  const dataset = getData(country);
  const stackedData = d3.stack().keys(fields)(dataset);

  svg
    .select(".stackedbar")
    .selectAll("g")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", (d) => colorScale(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(+d.data.year) + margin.left)
    .attr("y", (d) => yScale(d[1]) + margin.top)
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("width", (d) => xScale.bandwidth());

  svg
    .select(".line")
    .append("path")
    .datum(dataset)
    .attr("class", "barchart-line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg
    .select(".dot")
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("fill", "steelblue")
    .attr("r", 5)
    .attr("cx", (d) => xScale(+d.year) + margin.left + 20)
    .attr("cy", (d) => yScale(d["Happiness Score"]) + margin.top);
}

function getData(country) {
  const dataset = [];
  for (let year = 2015; year <= 2021; year++) {
    if (worldHappiness[year.toString()][country] === undefined) {
      dataset.push(getEmptyData(year, country));
    } else {
      const data = worldHappiness[year.toString()][country];
      data.year = year.toString();
      dataset.push(data);
    }
  }
  return dataset;
}

function getEmptyData(year, country) {
  return {
    year: year,
    country: country,
    "Happiness Rank": 0,
    "Happiness Score": 0,
    "Economy (GDP per Capita)": 0,
    "Family (Social Support)": 0,
    Freedom: 0,
    Generosity: 0,
    "Health (Life Expectancy)": 0,
    "Trust (Government Corruption)": 0,
  };
}

export function resetStackedBar() {
  d3.selectAll(".stackedbar > *").remove();
  d3.selectAll(".line > *").remove();
}
