document.addEventListener("contextmenu", (event) => event.preventDefault());

import "../scss/styles.scss";

import * as d3 from "d3";
import * as bootstrap from "bootstrap";

const colors = d3.interpolateOrRd;
export default colors;

import { initEarth } from "./earth.js";
initEarth();

import createLegend from "./legend.js";
createLegend();

import { initScatter } from "./scatter";
const year = document.getElementById("yearRange").value;
initScatter("Economy (GDP per Capita)", year);

import { initStackedBarChart } from "./stackedBarChart.js";
initStackedBarChart(null);
