const regions = {
  CEE: { Region: "Central and Eastern Europe" },
  WE: { Region: "Western Europe" },
  SA: { Region: "Southern Asia" },
  SEA: { Region: "Southeastern Asia" },
  EA: { Region: "Eastern Asia" },
  MENA: { Region: "Middle East and Northern Africa" },
  SSA: { Region: "Sub-Saharan Africa" },
  LAC: { Region: "Latin America and Caribbean" },
  NA: { Region: "North America" },
  ANZ: { Region: "Australia and New Zealand" },
  ALR: { Region: "Select all regions" },
};

function drawScatter() {
  const graphWidth = 300,
    graphHeight = 200;
  const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", graphWidth)
    .attr("height", graphHeight);
}
