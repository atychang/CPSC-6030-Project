import * as d3 from "d3";
import * as topojson from "topojson-client";

import worldHappiness from "../public/datasets/world-happiness.json";
import countries from "../public/datasets/countries-110m.json";
import colors from "./main.js";
import { initStackedBarChart } from "./stackedBarChart.js";

import {
  highlightCountryOnScatter,
  initScatter,
  unhighlightScatter,
  getFactorName,
} from "./scatter.js";

let currentYear = "2015";
let currentData = worldHappiness[currentYear];
let selectedCountry = null;

document
  .getElementById("yearRange")
  .addEventListener("change", function (event) {
    currentYear = this.value;
    currentData = worldHappiness[currentYear];
    d3.select("#earth")
      .selectAll("path")
      .attr("fill", (d) => fillLand(d.properties.name));
    initScatter(
      getFactorName(document.getElementById("factor-select").value - 1),
      currentYear
    );
    if (selectedCountry !== null) {
      const country = selectedCountry.attr("countryName");
      if (currentData[country] === undefined) {
        resetEarth();
        unhighlightScatter();
        selectedCountry = null;
      }
    }
  });

const body = document.getElementById("earth");
const width = body.clientWidth,
  height = body.clientHeight - 20;

const sensitivity = 75;

const projection = d3
  .geoOrthographic()
  .scale(height / 2.1)
  .center([0, 0])
  .rotate([0, 0])
  .translate([width / 2, height / 2]);

const initialScale = projection.scale();

const earth = d3
  .select("#earth")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const globe = earth
  .append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", initialScale);

let path = d3.geoPath().projection(projection);

earth
  .call(
    d3.drag().on("drag", function (event) {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
      path = d3.geoPath().projection(projection);
      earth.selectAll("path").attr("d", path);
    })
  )
  .call(
    d3
      .zoom()
      .on("zoom", function (event) {
        if (event.transform.k > 0.3) {
          projection.scale(initialScale * event.transform.k);
          path = d3.geoPath().projection(projection);
          earth.selectAll("path").attr("d", path);
          globe.attr("r", projection.scale());
        } else {
          event.transform.k = 0.3;
        }
      })
      .filter((event) => {
        return event.type !== "dblclick";
      })
  );
const tooltip = d3
  .select("#earth")
  .append("div")
  .style("opacity", 0)
  .style("position", "absolute")
  .attr("class", "tooltip unselectable")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10pddx")
  .html(
    `
      <div class="card">
        <div class="card-body">
          <h5 id="countryName" class="card-title">No country selected</h5>
          <p id="region" class="card-text">Region:</p>
          <p id="hr" class="card-text">Happiness Rank:</p>
          <p id="hs" class="card-text">Happiness Score:</p>
          <p id="eco" class="card-text">Economy (GDP per Capita):</p>
          <p id="freedom" class="card-text">Freedom to make life choices:</p>
          <p id="fss" class="card-text">Family (Social Support):</p>
          <p id="hle" class="card-text">Healthy life expectancy:</p>
          <p id="gen" class="card-text">Generosity:</p>
          <p id="trust" class="card-text">Trust (Government Corruption):</p>
      </div></div>
    `
  );

// hover callback
function mouseover(event, d) {
  const name = d.properties.name;
  if (currentData[name] === undefined) {
    return;
  }
  d3.select("#countryName").text(name);
  d3.select("#region").text(`Region: ${currentData[name]["Region"]}`);
  d3.select("#hr").text(
    `Happiness Rank: ${currentData[name]["Happiness Rank"]}`
  );
  d3.select("#hs").text(
    `Happiness Score: ${currentData[name]["Happiness Score"]}`
  );
  d3.select("#eco").text(
    `Economy (GDP per Capita): ${currentData[name]["Economy (GDP per Capita)"]}`
  );
  d3.select("#freedom").text(`Freedom: ${currentData[name]["Freedom"]}`);
  d3.select("#fss").text(
    `Family (Social Support): ${currentData[name]["Family (Social Support)"]}`
  );
  d3.select("#hle").text(
    `Health (Life Expectancy): ${currentData[name]["Health (Life Expectancy)"]}`
  );
  d3.select("#gen").text(`Generosity: ${currentData[name]["Generosity"]}`);
  d3.select("#trust").text(
    `Trust (Government Corruption): ${currentData[name]["Trust (Government Corruption)"]}`
  );
  tooltip.style("opacity", 1);
}

// move callback
function mousemove(event, d) {
  tooltip.style("left", event.x + 10 + "px").style("top", event.y - 10 + "px");
}

// leave callback
function mouseleave(event, d) {
  d3.select("#countryName").text("No country selected");
  d3.select("#region").text(`Region:`);
  d3.select("#hr").text(`Happiness Rank:`);
  d3.select("#hs").text(`Happiness Score:`);
  d3.select("#eco").text(`Economy (GDP per Capita):`);
  d3.select("#freedom").text(`Freedom:`);
  d3.select("#fss").text(`Family (Social Support):`);
  d3.select("#hle").text(`Health (Life Expectancy):`);
  d3.select("#gen").text(`Generosity:`);
  d3.select("#trust").text(`Trust (Government Corruption):`);
  tooltip.style("opacity", 0);
}

// double click callback
function doubleclick(event, d) {
  if (currentData[d.properties.name] === undefined) {
    return;
  }
  const country = d.properties.name;
  highlightCountryOnEarth(country);
  highlightCountryOnScatter(country);
  initStackedBarChart(country);
}

function fillLand(country) {
  if (country in currentData) {
    return colors(currentData[country]["Happiness Score"] / 10);
  } else {
    return "darkgrey";
  }
}

export function initEarth() {
  earth
    .append("g")
    .attr("id", "earth")
    .selectAll("path")
    .data(topojson.feature(countries, countries.objects.countries).features)
    .enter()
    .append("path")
    .attr("countryName", (d) => d.properties.name)
    .attr("class", (d) => `country-${d.properties.name.split(" ").join("-")}`)
    .attr("d", path)
    .attr("fill", (d) => fillLand(d.properties.name))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("dblclick", doubleclick);
}

export function highlightCountryOnEarth(country) {
  resetEarth();
  if (
    selectedCountry !== null &&
    country === selectedCountry.attr("countryName")
  ) {
    selectedCountry = null;
    return;
  }
  selectedCountry = d3.select(`.country-${country.split(" ").join("-")}`);
  selectedCountry.style("fill", "green");
}

function updateCountryInfo(country) {
  if (country !== null) {
    d3.select("#g_countryName").text(`Country: ${country}`);
    d3.select("#g_region").text(`Region: ${currentData[country]["Region"]}`);
    d3.select("#g_h").text(
      `Happiness Rank: ${currentData[country]["Happiness Rank"]}, Happiness Score: ${currentData[country]["Happiness Score"]}`
    );
  } else {
    d3.select("#g_countryName").text("No country selected");
    d3.select("#g_region").text(`Region:`);
    d3.select("#g_h").text(`Happiness Rank: , Happiness Score:`);
  }
}

export function highlightRegionOnEarth(region, countries) {
  resetEarth();
  selectedCountry = null;
  if (region === "Select all region") {
    return;
  }
  let flag = false;
  countries.forEach((country) => {
    d3.select(`.country-${country.split(" ").join("-")}`).style("fill", (_) => {
      if (!flag && centerCountry(country)) {
        flag = true;
      }
      return "green";
    });
  });
}

export function resetEarth() {
  d3.selectAll(`path[style*="fill: green"`).style("fill", "");
}

export function centerCountry(country) {
  const p = getCentroid(country);
  if (p === undefined) {
    return false;
  }
  (function transition() {
    d3.transition()
      .duration(2500)
      .tween("rotate", function () {
        const r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
        return function (t) {
          projection.rotate(r(t));
          earth.selectAll("path").attr("d", path);
        };
      });
  })();
  return true;
}

function getCentroid(country) {
  const paths = earth.selectAll("path");
  for (let i = 0; i < paths.data().length; i++) {
    const p = paths.data()[i];
    if (p.properties.name === country) {
      return d3.geoCentroid(p);
    }
  }
}
