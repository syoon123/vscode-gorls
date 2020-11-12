const years = ['2014', '2016', '2017', '2018', '2019', '2020'];
let promises = [];
years.forEach((year) => {
  promises.push(d3.csv(`data/cleaned_mhs_${year}.csv`));
})

Promise.all(promises)
  .then(function (data) { gettingStarted(data) })
  .catch(function(error) { console.log(error) });


function gettingStarted(allData) {
  let data = {}
  allData.forEach((yearData, index) => {
    data[years[index]] = yearData;
  })
  let lineGraphVis = new LineGraphVis('lineGraph', data);
  let sankeyVis = new SankeyVis('sankey', data);
  let dotsVis = new DotsVis('dots', data);
  let stackedBarChartVis = new StackedBarChartVis('stackedBarChart', data);
  let gapsVis = new GapsVis('gaps', data);
}