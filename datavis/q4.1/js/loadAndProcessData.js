export const loadAndProcessData = () =>
  Promise
    .all([
      d3.json('./data/africa.json'),
      d3.csv('./data/region_population_density.csv')
    ])
    .then(([topoData, csvData]) => {
      // Conversion from TopoJSON to GeoJSON
      const countries = topojson.feature(topoData, topoData.objects.collection);

      // Add pop_density (from csv) to our GeoJSON data
      countries.features.forEach(d => {
        for (let i = 0; i < csvData.length; i++) {
          if (d.properties.name === csvData[i].region) {
            d.properties.pop_density = +csvData[i].pop_density;
          }
        }
      });

      // Return the combined data
      return countries;
    });
