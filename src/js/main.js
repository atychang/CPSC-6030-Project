import "../scss/styles.scss";

import * as d3 from "d3";
import * as topojson from "topojson-client";

document.addEventListener("contextmenu", (event) => event.preventDefault());

let currentYear = "2015";
const worldHappinessData = await d3.json("./datasets/world-happiness.json");
let currentData = worldHappinessData[currentYear];

const yearRange = document.getElementById("yearRange");
yearRange.addEventListener("change", onYearChange);
function onYearChange(event) {
  currentData = worldHappinessData[this.value];
  earth.selectAll("path").attr("fill", fillLand);
}

const mapContainer = document.getElementById("mapContainer");
const width = mapContainer.clientWidth,
  height = 600;

const sensitivity = 75;

const projection = d3
  .geoOrthographic()
  .scale(height / 2.1)
  .center([0, 0])
  .rotate([0, 0])
  .translate([width / 2, height / 2]);

const initialScale = projection.scale();
let path = d3.geoPath().projection(projection);

const svg = d3
  .select("#mapContainer")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const globe = svg
  .append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", initialScale);

svg
  .call(
    d3.drag().on("drag", function (event) {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
      path = d3.geoPath().projection(projection);
      svg.selectAll("path").attr("d", path);
    })
  )
  .call(
    d3
      .zoom()
      .on("zoom", function (event) {
        if (event.transform.k > 0.3) {
          projection.scale(initialScale * event.transform.k);
          path = d3.geoPath().projection(projection);
          svg.selectAll("path").attr("d", path);
          globe.attr("r", projection.scale());
        } else {
          event.transform.k = 0.3;
        }
      })
      .filter((event) => {
        return event.type !== "dblclick";
      })
  );

const colors = d3.interpolateOrRd;
createLegend();

const earth = svg.append("g");

// double click callback
var selectCountry = function (event, d) {
  const name = d.properties.name;
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
};
// right click callback
var deselectCountry = function (event, d) {
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
};

Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
]).then(([topo]) => {
  const countries = topojson.feature(topo, topo.objects.countries);

  earth
    .selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("class", (d) => "country_" + d.properties.name.replace(" ", "_"))
    .attr("d", path)
    .attr("fill", fillLand)
    .on("dblclick", selectCountry)
    .on("contextmenu", deselectCountry);
});

function fillLand(d) {
  if (d.properties.name in currentData) {
    return colors(currentData[d.properties.name]["Happiness Score"] / 10);
  } else {
    return "darkgrey";
  }
}

function createLegend() {
  const legendWidth = 150;
  const legendHeight = 20;

  const cScale = d3.scaleSequential().interpolator(colors).domain([0, 99]);
  const xScale = d3.scaleLinear().domain([0, 99]).range([0, 150]);

  d3.select("#legendBar")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .selectAll("rect")
    .data(Array.from(Array(100).keys()))
    .enter()
    .append("rect")
    .attr("x", (d) => Math.floor(xScale(d)))
    .attr("y", 0)
    .attr("height", 20)
    .attr("width", (d) => {
      if (d == 99) {
        return 6;
      }
      return Math.floor(xScale(d + 1)) - Math.floor(xScale(d)) + 1;
    })
    .attr("fill", (d) => cScale(d));
}
