export const scatterPlot = (parent, props) => {
  // unpack my props
  const {
    data,
    margin,
    xValue, 
    xAxisLabel,
    yValue, 
    yAxisLabel,
    circleRadius
  } = props;

  const width = +parent.attr('width');
  const height = +parent.attr('height');
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Container for inner margins
  const g = parent.selectAll('.container').data([null]);
  const gEnter = g
    .enter().append('g')
      .attr('class','container');
  gEnter
    .merge(g)
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // x-axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);

  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter
    .append('g')
      .attr('class','x-axis')
      .attr('transform', `translate(0,${innerHeight})`);
  xAxisG
    .merge(xAxisGEnter)
      .call(xAxis)
      .select('.domain').remove();

  const xAxisLabelText = xAxisG.select('.axis-label');
  const xAxisLabelTextEnter = xAxisGEnter
    .append('text')
      .attr('class', 'axis-label')
      .attr('y', 70)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle');
  xAxisLabelText
    .merge(xAxisLabelTextEnter)
      .attr('x', innerWidth/2)
      .text(xAxisLabel);
    
  // y-axis
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.select('.y-axis');
  const yAxisGEnter = gEnter
    .append('g')
      .attr('class','y-axis');
  yAxisG
    .merge(yAxisGEnter)
      .call(yAxis)
      .select('.domain').remove();
  
  const yAxisLabelText = yAxisG.select('.axis-label');
  const yAxisLabelTextEnter = yAxisGEnter
    .append('text')
      .attr('class', 'axis-label')
      .attr('y', -95)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle');
  yAxisLabelText
    .merge(yAxisLabelTextEnter)
      .attr('x', -innerHeight/2)
      .text(yAxisLabel);


  // title
  let title = 'Cars: ' + yAxisLabel + ' vs ' + xAxisLabel;
  const titleText = gEnter.merge(g)
    .selectAll('.title').data([null]);
  const titleTextEnter = titleText
    .enter().append('text')
      .attr('class','title')
      .attr('x', innerWidth/2)
      .attr('y', -10);
  titleTextEnter
    .merge(titleText)
      .text(title);

  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
  // Plot data
  const circles = gEnter.merge(g)
    .selectAll('circle').data(data);
  const circlesEnter = circles
    .enter().append('circle')
      .attr('cx', innerWidth/2)
      .attr('cy', innerHeight/2)
      .attr('r', 0);
  circlesEnter
    .append('title').text(d=> `${d.name}: ${d.origin}, ${d.year}`)
  circlesEnter
    .merge(circles)
    .attr('stroke-width', 3)
    .transition().duration(1000)
    .delay((d, i) => i*5)
      .attr('cx', d => xScale(xValue(d)))
      .attr('cy', d => yScale(yValue(d)))
      .attr('r', circleRadius);

};
