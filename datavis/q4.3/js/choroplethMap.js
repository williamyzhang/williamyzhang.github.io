

// Define projection and pathGenerator
const projection = d3.geoNaturalEarth1(); // ...
const pathGenerator = d3.geoPath().projection(projection);// ...

export const choroplethMap = (parent, props) => {
  const { 
    countries,
    colourScale,
    colourLegend
  } = props;

  // Group for map elements
  const g = parent.append("g");
  const width  = +parent.attr('width');
  const height = +parent.attr('height');

  // Zoom interactivity (using d3-zoom package -- standard d3 bundle)
  g.call(d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', event => g.attr('transform', event.transform)));

  // Earth's border
  g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

  // Paths for countries
  // console.log(countries.features);
  const countriesMap = g.selectAll('path').data(countries.features)
      .enter().append('path')
        .attr('class','country')
        .attr('d', pathGenerator)
        .attr("fill", (d) => {
          // Set fill color based on population density
          return colourScale(d.properties.economy);
        })
        .attr('opacity', 1);
  
  // Colour legend
  // console.log(`${width}, ${height}`)
  const legendG = g.append('g')
    .attr('transform', `translate(32, 250)`)
    .call(colourLegend, { 
      colourScale, 
      circleRadius: 10,
      spacing: 25,
      textOffset: 20
    })
  
  // Legend event listeners
  const legendItems = legendG.selectAll(".legend").data(colourScale.domain());
  let lastSelectedRegion;
  legendItems
    .on("click", (d) => {
      //console.log(i);
      // console.log(d.srcElement.__data__);
      d = d.srcElement.__data__;
      //console.log(event);
      // Get the current opacity of the countries not associated with the clicked legend item
      let currentOpacity = g.selectAll(`.country[fill]:not([fill="${colourScale(d)}"])`).style("opacity");
      
      // console.log(colourScale(d))
      // If the current opacity is 1, set it to 0.3 (attenuated)
      if (currentOpacity === "1") {
        lastSelectedRegion = d
        g.selectAll(`.country[fill]:not([fill="${colourScale(d)}"])`)
          .attr("opacity", 0.3);
        legendG.selectAll(`.legend[fill]:not([fill="${colourScale(d)}"])`)
          .attr("opacity", 0.3);
        //   legendG.selectAll(`circle[fill]:not([fill="${colourScale(d)}"])`)
        //   .attr("opacity", 0.3);
        // legendG.selectAll(`text[text]:not([text="${d}"])`)
        //   .attr("opacity", 0.3);
      } 
      // If the current opacity is 0.3, set it to 1 (fully visible)
      else if (currentOpacity === "0.3" && d === lastSelectedRegion) {
        g.selectAll(`.country[fill]:not([fill="${colourScale(d)}"])`)
          .attr("opacity", 1);
        legendG.selectAll(`.legend[fill]:not([fill="${colourScale(d)}"])`)
          .attr("opacity", 1);
        //   legendG.selectAll(`circle[fill]:not([fill="${colourScale(d)}"])`)
        //   .attr("opacity", 1);
        // legendG.selectAll(`text[d]:not([d="${d}"])`)
        //   .attr("opacity", 1);
      }
    });

    //Tooltip event listeners
    countriesMap.on("mouseover", (event, d) => {
      // Show tooltip with country name and population density
      //console.log(event.target.attributes[3]);
      let countryOpacity = +event.target.attributes[3].nodeValue;
      //d = d.srcElement.__data__;
      // console.log(d);
      // console.log(countryOpacity)
      if (countryOpacity === 1) {
        d3.select('#tooltip').style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`
            <strong>${d.properties.name}</strong>
            <br>${d.properties.economy}`);
        }
    })
    .on("mousemove", (event, d) => {
      // Update position of tooltip
      //const toolTip = d3.select(".tooltip");
      let countryOpacity = +event.target.attributes[3].nodeValue;
      // console.log(d);
      // console.log(countryOpacity)
      if (countryOpacity === 1) {
        d3.select('#tooltip').style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
      }
    })
    .on("mouseout", () => {
      // Hide tooltip
      //const toolTip = d3.select(".tooltip");
      d3.select('#tooltip').style("display", "none");
    });

}

