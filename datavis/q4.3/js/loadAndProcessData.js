export const loadAndProcessData = () =>
  Promise
    .all([
      d3.json('./data/50m.json'),
      d3.tsv('./data/50m.tsv')
    ])
    .then(([topoData, tsvData]) => {
      // The d.iso_n3 field in the tsvData corresponds to the d.id in TopoJSON
      // rowById is initially an empty object. For each d.iso_n3 identifier, a
      // new sub-object is created with all the economical info read from tsvData
      const rowById = {};
      tsvData.forEach(d => {
        rowById[d.iso_n3] = d;
      });

      // Convert TopoJSON to GeoJSON data
      const countries = topojson.feature(topoData, topoData.objects.countries);

      // For each country, we add an additional field to its features based on d.id
      countries.features.forEach(d => {
        Object.assign(d.properties, rowById[d.id]);
      });

      return countries;
    });

