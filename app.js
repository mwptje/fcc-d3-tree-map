// kickstart data url
const kickstartUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const colors = [
  "#c57d95",
  "#7b74df",
  "#4791ab",
  "#3b6631",
  "#883933",
  "#d2416b",
  "#9c973e",
  "#68436b",
  "#5ba93d",
  "#cd8028",
  "#bf549b",
  "#623ac4",
  "#5ca17c",
  "#d64731",
  "#d247ba",
  "#643c8e",
  "#6c5a2b",
  "#7583c3",
  "#c8805e",
  "#ba4de1",
];
// width and height for the svg element
const width = 960;
const height = 600;

// titles
const title = "Top 100 Funded Kickstarter Projects";
const subtitle = "Funding by Category in Millions of $";

// add title and subtitle
d3.select("main").append("header");
d3.select("header")
  .append("h1")
  .attr("id", "title")
  .style("margin", "20px 0 5px 0")
  .text(title);

d3.select("header")
  .append("h3")
  .attr("id", "description")
  .style("margin", "5px 0 10px 0")
  .html(subtitle);

// append svg and position relative to main element
const svg = d3
  .select("main")
  .append("svg")
  .attr("class", "tree-map")
  .attr("width", width)
  .attr("height", height);

// add the hidden tooltip div
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);
// format numbers with group comma separator
const format = d3.format(",d");
// color function
const color = d3.scaleOrdinal(colors);

// get remote json and then create a hierarchy to display the
// data by category as a squares treemap
d3.json(kickstartUrl).then((data) => {
  // create an hierarchy structure and sort by height and value
  const root = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  // create a tree map with square tiles
  const treemap = d3.treemap().size([width, height]).padding(0.8);

  // add the hierarchical data to the tree map
  treemap(root);

  // append the squares to the svg element
  // root.leaves() are all the outer nodes
  // -> one g-group and rect per node
  const tilesGroup = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");
  // append tiles to the tilesGroup
  const tiles = tilesGroup
    .append("rect")
    .attr("class", "tile")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.data.category))
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    // tooltip
    .on("mousemove", (d) => {
      tooltip.style("opacity", 0.7);
      tooltip.attr("data-value", d.data.value);
      tooltip
        .html(
          d.data.name +
            "</br>Category: " +
            d.data.category +
            "</br>Value: $" +
            d3.format(",d")(d.data.value)
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(150).style("opacity", 0);
    });
  // add name to the tiles and split on caplitals so the text is stacked
  tilesGroup
    .append("text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .join("tspan")
    .attr("x", 10)
    .attr("y", (d, i) => 10 * i + 10)
    // .style("fill", "white")
    .text((d) => d);
});
