document.addEventListener("contextmenu", (event) => event.preventDefault());

import "../scss/styles.scss";

import * as d3 from "d3";

const colors = d3.interpolateOrRd;
export default colors;

import initEarth from "./earth.js";
initEarth();

import createLegend from "./legend.js";
createLegend();
