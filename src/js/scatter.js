import * as d3 from "d3";

import { centerCountry, resetEarth } from "./earth.js";

import worldHappiness from "../public/datasets/world-happiness.json";
const defaultData = [];
for (const [_, info] of Object.entries(worldHappiness["2015"])) {
  defaultData.push(info);
}

const body = document.getElementById("scatterplot");
const graphWidth = body.clientWidth - 150,
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
svg.attr(
  "viewBox",
  `0 0 ${graphWidth + margin * 2} ${graphHeight + margin * 2}`
);

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

function highlightRegion(event, d) {
  reset();
  resetEarth();
  if (d === "Select all region") {
    return;
  }
  selectedRegion = d;
  const name = selectedRegion.split(" ").join("-");
  legend.selectAll(`text:not(.${name})`).attr("opacity", "0.05");
  graph.selectAll(`circle:not(.region-${name})`).attr("opacity", "0.05");
}

function reset() {
  graph.selectAll("circle").attr("opacity", "1");
  legend.selectAll("text").attr("opacity", "1");
  selectedRegion = null;
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
  switch (this.selectedIndex) {
    case 0:
      initScatter(
        "Economy (GDP per Capita)",
        document.getElementById("yearRange").value
      );
      break;
    case 1:
      initScatter(
        "Family (Social Support)",
        document.getElementById("yearRange").value
      );
      break;
    case 2:
      initScatter(
        "Health (Life Expectancy)",
        document.getElementById("yearRange").value
      );
      break;
    case 3:
      initScatter("Freedom", document.getElementById("yearRange").value);
      break;
    case 4:
      initScatter(
        "Trust (Government Corruption)",
        document.getElementById("yearRange").value
      );
      break;
    case 5:
      initScatter("Generosity", document.getElementById("yearRange").value);
      break;
  }
}

export function highlightCountryOnScatter(country, focus) {
  reset();
  if (focus) {
    country = country.split(" ").join("-");
    graph.selectAll(`circle:not(.country-${country})`).attr("opacity", "0.05");
  }
}

export function initScatter(index, year) {
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

function doubleclick(event, d) {
  centerCountry(d["Country"]);
}
