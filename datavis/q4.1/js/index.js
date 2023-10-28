import { loadAndProcessData } from './loadAndProcessData.js'
import { choroplethMap } from './choroplethMap.js'
import { colourbar } from './colourbar.js'

const svg = d3.select('svg');
const width  = +svg.attr('width');
const height = +svg.attr('height');

// Global/State variables
let countries;

const updateVis = () => {
  // data accessor to select feature we will use as colour
  const colourValue = d => d.properties.pop_density;

  // colour scale (from d3-scale-chromatic -- standard D3 bundle)
  const popDensityExtent = d3.extent(countries.features, colourValue);
  const colourScale = d3.scaleSequential()
    .domain(popDensityExtent)
    .interpolator(d3.interpolateBlues);

  // instantiate map
  svg.call(choroplethMap, {countries, colourScale});
  const legendG = svg.append('g');
  legendG.attr('transform', `translate(${width/8}, ${height/2 + 20})`)
  legendG.call(colourbar, {
    colourScale,
    nTicks: 2,
    barWidth: 180,
    barHeight: 15,
    title: "Population density per square km"
  }).attr('class', 'colourbar')
   
};

loadAndProcessData().then(loadedData => {
  countries = loadedData;
  updateVis();
});

