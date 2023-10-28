export const loadAndProcessData = () =>
  Promise
    .all([
      d3.json('./data/countries-50m.json'),
      d3.csv('./data/world_wonders.csv')
    ])
    .then(([topoData, csvData]) => {      
      // Conversion from TopoJSON to GeoJSON
      const countries = topojson.feature(topoData, topoData.objects.countries);

      // Parse CSV data 
      csvData.forEach(d => {
        d.lon = +d.lon;
        d.lat = +d.lat;
        d.visitors = +d.visitors;
      });
    
      // Return array containing GeoJSON and symbols data
      return [countries, csvData];
    });

