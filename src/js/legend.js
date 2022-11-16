import * as d3 from "d3";

import colors from "./main.js";

export default function createLegend() {
  const legendWidth = 250;
  const legendHeight = 20;

  const cScale = d3.scaleSequential().interpolator(colors).domain([0, 99]);
  const xScale = d3.scaleLinear().domain([0, 99]).range([0, legendWidth]);

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
