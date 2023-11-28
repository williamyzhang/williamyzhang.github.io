export const worldmapSymbols = (parent, props) => {
  const { 
    countries,
    symbolsData
  } = props;

  // Define projection and pathGenerator
  const projection = d3.geoEqualEarth();
  const pathGenerator = d3.geoPath().projection(projection);

  // Group for map elements
  const g = parent.append("g");

  // Zoom interactivity (using d3-zoom package -- standard d3 bundle)
  g.call(d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", () => {
      g.attr("transform", d3.event.transform);
    }));

  // Earth's border
  g.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

  // Map graticule
  const graticule = d3.geoGraticule().step([15, 15]);
  g.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", pathGenerator);

  // Paths for countries
  g.selectAll('.country').data(countries.features)
      .enter().append('path')
        .attr('class','country')
        .attr('d', pathGenerator)
      .append('title')
        .text(d => d.properties.name);

  // Seven Wonders
  const wondersG = g.selectAll('g').data(symbolsData);
  const wondersEnter = wondersG
    .enter().append('g')
    
  wondersEnter.append('circle')
    .attr('r', 0)
    .attr('opacity', 0)
    .attr("cx", d => projection([d.lon, d.lat])[0])
    .attr("cy", d => projection([d.lon, d.lat])[1]);

  //console.log(symbolsData);
  wondersEnter.append('text')
    .attr('class', 'wonder-label')
    .attr('opacity', 0)
    .text(d => d.name)
    .attr("x", d => projection([d.lon, d.lat])[0])
    .attr("y", 
      d => projection([d.lon, d.lat])[1] - (d.visitors * 2 + 3));

  wondersEnter.merge(wondersG).select('circle')
      .transition().duration(1000)
      .delay((d, i) => i*300)
      .attr('r', d => d.visitors * 2)
      .attr('opacity', 0.5);
  wondersEnter.merge(wondersG).select('text')
    .transition().duration(1000)
    .delay((d, i) => i*300)
    .attr('opacity', 1)

  // Tooltip event listeners
  const tooltipPadding = 10;
  wondersEnter
    .on('mouseover', (event, d) => {
      //d3.select('circle').style('opacity', 1)
      d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + tooltipPadding) + 'px')   
        .style('top', (event.pageY + tooltipPadding) + 'px')
        .html(`
          <div class="tooltip-title">${d.name}</div>
          <div>
          ${d.country} | ${d.visitors}M visitors
          </div>
          
        `);
    })
    .on('mouseleave', () => {
      d3.select('#tooltip').style('display', 'none');
      
      //d3.select('circle').style('opacity', 0.5);
    });
}
