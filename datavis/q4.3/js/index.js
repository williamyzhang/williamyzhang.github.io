import { loadAndProcessData } from './loadAndProcessData.js'
import { choroplethMap } from './choroplethMap.js'
import { colourLegend } from './colourLegend.js'

const svg = d3.select('svg');

// Global variables
let countries;

const updateVis = () => {
  // data accessor to select feature that we'll use as colour
  const colourValue = d => d.properties.economy;
  // colour scale to be used (from d3-scale-chromatic -- standard D3 bundle)
  const colourScale = d3.scaleOrdinal();
  colourScale.domain(countries.features.map(colourValue).sort());
  colourScale.range(d3.schemeOranges[colourScale.domain().length]);

  // instantiate map
  svg.call(choroplethMap, {countries, colourScale, colourLegend});


};

loadAndProcessData().then(loadedData => {
  countries = loadedData;
  updateVis();
});

