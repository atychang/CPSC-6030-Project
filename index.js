const width = 960,
  height = 500;

const svg = d3.select("#map").attr("width", width).attr("height", height);

const projection = d3.geoMercator().center([0, 5]).scale(150).rotate([-180, 0]);
const path = d3.geoPath(projection);

Promise.all([d3.json("datasets/world.json")]).then(([topo]) => {
  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(topo, topo.objects.countries).features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "white")
    .style("stroke-width", "0.25px")
    .style("fill", "grey");
});
