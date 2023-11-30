export const choroplethMap = (parent, props) => {
  const { 
    countries,
    colourScale
  } = props;

  // Define projection and pathGenerator
  const projection = d3.geoMercator();
  const pathGenerator = d3.geoPath().projection(projection);

  // Group for map elements
  const g = parent.append("g");

  // Zoom interactivity (using d3-zoom package -- standard d3 bundle)
  g.call(d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", () => {
      g.attr("transform", d3.event.transform);
    }));

  // Append our paths for the countries
  projection.fitSize([parent.attr('width'),parent.attr('height')], countries);
  const countriesMap = g.selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr('class', 'country')
    .attr("d", pathGenerator)
    .attr("fill", (d) => {
      // Set fill color based on population density
      if (d.properties.pop_density === undefined) {
        return "#BFBFBF";
      }
      return colourScale(d.properties.pop_density);
    })
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);
    // .append('title')
    //   .text(d => d.properties.name)

  //Tooltip event listeners
  countriesMap
      .on("mouseover", (d) => {
        // Show tooltip with country name and population density
        d = d.srcElement.__data__;
        //console.log(d);
        d3.select('#tooltip').style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`
            <strong>${d.properties.name}</strong>
            <br>${d.properties.pop_density} population density per km<sup>2</sup>`);
      })
      .on("mousemove", (event) => {
        // Update position of tooltip
        //const toolTip = d3.select(".tooltip");
        d3.select('#tooltip').style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
      })
      .on("mouseout", () => {
        // Hide tooltip
        //const toolTip = d3.select(".tooltip");
        d3.select('#tooltip').style("display", "none");
      });
  //console.log(countries.features);
  
}

