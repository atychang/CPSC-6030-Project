import * as d3 from "d3";

import {
  centerCountry,
  highlightCountryOnEarth,
  highlightRegionOnEarth,
} from "./earth.js";

import worldHappiness from "../public/datasets/world-happiness.json";
const defaultData = [];
for (const [_, info] of Object.entries(worldHappiness["2015"])) {
  defaultData.push(info);
}

import { initStackedBarChart, resetStackedBar } from "./stackedBarChart.js";

const body = document.getElementById("scatterplot");
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
  "Sub Saharan Africa",
  "Southern Asia",
  "Select all region",
];
const svg = d3.select("#scatterplot").append("svg");
svg.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

const graph = svg
  .append("g")
  .attr("position", "relative")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3.scaleLinear().domain([0, 2]).range([0, width]);
const xAxis = d3.axisBottom(xScale).ticks(20);
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

const yScale = d3.scaleLinear().domain([8, 0]).range([0, height]);
const yAxis = d3.axisLeft(yScale).ticks(8);
const yAxisGroup = graph.append("g").call(yAxis);

const xLabel = graph
  .append("g")
  .append("text")
  .attr("class", "x-axis-label")
  .attr("x", width / 2)
  .attr("y", height + 50)
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
  .attr("x", -(height / 2))
  .attr("y", -50)
  .attr("font-size", "18px")
  .attr("font-weight", "600")
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .text("Happiness Score");

graph
  .append("g")
  .attr("class", "g-scatter")
  .selectAll("circle")
  .data(defaultData)
  .enter()
  .append("circle")
  .attr("countryName", (d) => d["Country"])
  .attr(
    "class",
    (d) =>
      `c-country-${d["Country"].split(" ").join("-")} c-region-${d["Region"]
        .split(" ")
        .join("-")} country-circle`
  )
  .attr("cx", (d) => xScale(d["Economy (GDP per Capita)"]))
  .attr("cy", (d) => yScale(d["Happiness Score"]))
  .attr("fill", (d) => {
    const idx = regions.indexOf(d["Region"]);
    return color[idx];
  })
  .attr("r", "5")
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)
  .on("dblclick", doubleclick);

const legend = graph
  .selectAll(".legend")
  .data(regions)
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
  .style("fill", function (d) {
    const idx = regions.indexOf(d);
    return color[idx];
  })
  .text(function (d) {
    return d;
  });

legend
  .append("text")
  .attr("class", (d) => `${d.split(" ").join("-")}`)
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
  .style("fill", "white")
  .on("click", highlightRegion);

let selectedRegion = null;
let selectedCountry = null;

function highlightRegion(_, d) {
  highlightRegionOnScatter(d);
  const name =
    selectedRegion !== null ? selectedRegion.split(" ").join("-") : "";
  const countries = [];
  graph.selectAll(`circle:is(.c-region-${name})`).each(function (d, i) {
    countries.push(d["Country"]);
  });
  highlightRegionOnEarth(d, countries);
}

const fields = [
  { label: "Economy (GDP per Capita)", value: 1 },
  { label: "Family (Social Support)", value: 2 },
  { label: "Health (Life Expectancy)", value: 3 },
  { label: "Freedom", value: 4 },
  { label: "Trust (Government Corruption)", value: 5 },
  { label: "Generosity", value: 6 },
];

const dropDown = d3
  .select("#scatterContainer")
  .append("div")
  .style("position", "absolute")
  .append("select")
  .attr("id", "factor-select")
  .attr("name", "fields")
  .on("change", optionChanged);

const options = dropDown
  .selectAll("option")
  .data(fields)
  .enter()
  .append("option");

options
  .text(function (d) {
    return d.label;
  })
  .attr("value", function (d) {
    return d.value;
  });

function optionChanged(_) {
  initScatter(
    getFactorName(this.selectedIndex),
    document.getElementById("yearRange").value
  );
}

export function getFactorName(index) {
  switch (index) {
    case 0:
      return "Economy (GDP per Capita)";
    case 1:
      return "Family (Social Support)";
    case 2:
      return "Health (Life Expectancy)";
    case 3:
      return "Freedom";
    case 4:
      return "Trust (Government Corruption)";
    case 5:
      return "Generosity";
  }
}

const tooltip = d3
  .select("#scatterplot")
  .append("div")
  .style("opacity", 0)
  .style("position", "absolute")
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10pddx")
  .html(
    `
      <div class="card">
        <div class="card-body">
          <h5 id="sc_countryName" class="card-title">test</h5>
        </div>
      </div>
    `
  );

// hover callback
function mouseover(event, d) {
  if (selectedRegion != null && selectedRegion !== d["Region"]) {
    return;
  }
  const name = d["Country"];
  d3.select("#sc_countryName").text(name);
  tooltip.style("opacity", 1);
}

// move callback
function mousemove(event, d) {
  tooltip.style("left", event.x + 10 + "px").style("top", event.y - 10 + "px");
}

// leave callback
function mouseleave(event, d) {
  d3.select("#sc_countryName").text("");
  tooltip.style("opacity", 0);
}

// double click callback
function doubleclick(event, d) {
  centerCountry(d["Country"]);
  highlightCountryOnEarth(d["Country"]);
  highlightCountryOnScatter(d["Country"]);
  initStackedBarChart(d["Country"]);
}

export function initScatter(index, year) {
  resetScatter();

  xLabel.text(index);

  const data = [];
  for (const [_, info] of Object.entries(worldHappiness[year])) {
    data.push(info);
  }

  graph
    .select(".g-scatter")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("countryName", (d) => d["Country"])
    .attr(
      "class",
      (d) =>
        `c-country-${d["Country"].split(" ").join("-")} c-region-${d["Region"]
          .split(" ")
          .join("-")} country-circle`
    )
    .attr("cx", (d) => xScale(d[index]))
    .attr("cy", (d) => yScale(d["Happiness Score"]))
    .attr("fill", (d) => {
      const idx = regions.indexOf(d["Region"]);
      return color[idx];
    })
    .attr("r", "5")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("dblclick", doubleclick);
}

export function highlightCountryOnScatter(country) {
  unhighlightScatter();
  if (
    selectedCountry != null &&
    country === selectedCountry.attr("countryName")
  ) {
    selectedCountry = null;
    return;
  }
  country = country.split(" ").join("-");
  selectedCountry = d3.select(`.c-country-${country}`);
  graph.selectAll(`circle:not(.c-country-${country})`).attr("opacity", "0.05");
}

export function highlightRegionOnScatter(region) {
  unhighlightScatter();
  if (region === "Select all region") {
    resetStackedBar();
    selectedRegion = null;
    return;
  }
  selectedRegion = region;
  const name = selectedRegion.split(" ").join("-");
  legend.selectAll(`text:not(.${name})`).attr("opacity", "0.05");
  graph.selectAll(`circle:not(.c-region-${name})`).attr("opacity", "0.05");
}

export function unhighlightScatter() {
  graph.selectAll("circle").attr("opacity", "1");
  legend.selectAll("text").attr("opacity", "1");
}

function resetScatter() {
  d3.selectAll(".g-scatter > *").remove();
}
