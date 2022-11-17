document.addEventListener("contextmenu", (event) => event.preventDefault());

import "../scss/styles.scss";

import * as d3 from "d3";
import * as bootstrap from "bootstrap";

const colors = d3.interpolateOrRd;
export default colors;

import initEarth from "./earth.js";
initEarth();

import createLegend from "./legend.js";
createLegend();

import initScatter from "./scatter";
const scatterModal = document.getElementById("scatterModal");
scatterModal.addEventListener("shown.bs.modal", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Economy (GDP per Capita)", year);
});

document.getElementById("sc-btn-gdp").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Economy (GDP per Capita)", year);
});
document.getElementById("sc-btn-family").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Family (Social Support)", year);
});
document.getElementById("sc-btn-health").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Health (Life Expectancy)", year);
});
document.getElementById("sc-btn-freedom").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Freedom", year);
});
document.getElementById("sc-btn-trust").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Trust (Government Corruption)", year);
});
document.getElementById("sc-btn-generosity").addEventListener("click", () => {
  const year = document.getElementById("yearRange").value;
  initScatter("Generosity", year);
});
