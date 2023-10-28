export const colourLegend = (parent, props) => {
  const { 
    colourScale, 
    circleRadius,
    spacing,
    textOffset
  } = props;

  // We're passing colourScale as part of props, and need its domain data
  const groups = parent.selectAll('g').data(colourScale.domain());
  const rectEnter = groups.enter().append('rect')
      .attr('class', 'legend-rect')
      .attr('rx', circleRadius)
      .attr('ry', circleRadius)
      .attr('width', 250)
      .attr('height', (colourScale.domain().length + 0.5) * (spacing))
      .attr('transform', `translate(-20, ${-0.8 * spacing})`);

  const groupsEnter = groups
    .enter().append('g')
      .attr('class','legend')
      .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
      .attr('fill', colourScale);
  
  groupsEnter.append('circle')
      .attr('fill', colourScale)
      .attr('r', circleRadius);

  groupsEnter.append('text')
      .text(d => d)
      .attr('x', textOffset);
}


