import { scatterPlot }  from './scatterplot.js';
import { dropdownMenu } from './dropdownMenu.js';
const svg = d3.select('svg');

// Global/state variables
let data;
let selectedXOption = 'weight';
let selectedYOption = 'mpg';
const dataColsY = ['mpg', 'weight', 'cylinders', 'displacement', 'horsepower', 
      'acceleration'];
const dataColsX = ['weight', 'mpg', 'cylinders', 'displacement', 'horsepower', 
'acceleration'];
let options = [];
// let yoptions = [];
// let xoptions = [];
let onOptionSelected;

// Function(s) triggered by event listeners
const onYOptionSelected = event => {
  //console.log(event)
  selectedYOption = event.target.value;
  updateVis();
}

const onXOptionSelected = event => {
  //console.log(event)
  selectedXOption = event.target.value;
  updateVis();
}

const updateVis = () => {
  // menus
  options = dataColsY;
  onOptionSelected = onYOptionSelected;
  dropdownMenu(d3.select('#y-menu'), { options, onOptionSelected });
  options = dataColsX;
  onOptionSelected = onXOptionSelected;
  dropdownMenu(d3.select('#x-menu'), { options, onOptionSelected });
  //console.log('selected options: ' + selectedXOption + ', ' + selectedYOption)
  // refresh scatterPlot
  svg.call(scatterPlot, {
    data,
    margin: { top: 50, bottom: 80, left: 150, right: 40 },
    xValue: d => d[selectedXOption],
    xAxisLabel: selectedXOption,
    yValue: d => d[selectedYOption],
    yAxisLabel: selectedYOption,
    circleRadius: 10
  });
};

d3.csv('auto-mpg.csv')
  .then(loadedData => {                 // Data loading
    data = loadedData;
    data.forEach(d => {                 // Data parsing
      d.mpg = +d.mpg;
      d.cylinders = +d.cylinders;
      d.displacement = +d.displacement;
      d.horsepower = +d.horsepower;
      d.weight = +d.weight
      d.acceleration = +d.acceleration;
      d.year = +d.year;
    });
    //console.log(data.columns);
    updateVis();                        // Init visualisation
  });

