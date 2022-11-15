import "../scss/styles.scss";

import * as d3 from "d3";
import * as topojson from "topojson-client";

document.addEventListener("contextmenu", (event) => event.preventDefault());

let currentData;

const yearRange = document.getElementById("yearRange");
yearRange.addEventListener("change", onYearChange);
function onYearChange(event) {
  d3.json(`./datasets/${this.value}.json`).then((data) => {
    currentData = data;
    earth.selectAll("path").attr("fill", fillLand);
  });
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

const earth = svg.append("g");

// hover callback
var selectCountry = function (event, d) {
  d3.select("#countryName").text(d.properties.name);
  d3.select(this).attr("stroke-width: 1");
};
// leave callback
var deselectCountry = function (event, d) {
  d3.select("#countryName").text("No country selected");
};

Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.json("./datasets/2015.json"),
]).then(([topo, data]) => {
  const countries = topojson.feature(topo, topo.objects.countries);
  currentData = data;

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
