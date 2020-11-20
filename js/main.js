const years = ['2014', '2016', '2017', '2018', '2019'];
let promises = [];
years.forEach((year) => {
  promises.push(d3.csv(`data/cleaned_mhs_${year}.csv`));
})

Promise.all(promises)
  .then(function (data) { gettingStarted(data) })
  .catch(function(error) { console.log(error) });

let lineGraphVis, sankeyVis, dotsVis, stackedBarChartVis, gapsVis;

function gettingStarted(allData) {
  let data = {}
  allData.forEach((yearData, index) => {
    data[years[index]] = yearData;
  })
  lineGraphVis = new LineGraphVis('lineGraph', data);
  sankeyVis = new SankeyVis('sankey', data);
  dotsVis = new DotsVis('dots', data);
  stackedBarChartVis = new StackedBarChartVis('stackedBarChart', data);
  gapsVis = new GapsVis('gaps', data);
}