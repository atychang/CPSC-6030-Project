import "../scss/styles.scss";

import * as d3 from "d3";
import * as topojson from "topojson-client";

const width = 960,
  height = 600;

const svg = d3
  .select("div#map")
  .append("svg")
  .attr("viewBox", `0,0,${width},${height}`)
  .attr("width", "100%")
  .attr("height", "100%");

const projection = d3
  .geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);
const path = d3.geoPath(projection);

var mouseover = function (event, d) {
  console.log(d);
};
var mouseleave = function (event, d) {
  console.log(d);
};

Promise.all([
  d3.csv("/datasets/world-happiness-cleaned.csv"),
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
]).then(([data, topo]) => {
  const grouped = data.reduce(function (r, a) {
    r[a.Year] = r[a.Year] || [];
    r[a.Year].push(a);
    return r;
  }, Object.create(null));

  const countries = topojson.feature(topo, topo.objects.countries);
  svg
    .append("g")
    .attr("class", "country")
    .selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => {
      console.log(grouped["2021"]);
    })
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
});
