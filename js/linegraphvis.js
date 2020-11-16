class LineGraphVis {
  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // Append the axes to the drawing area
    vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${vis.height})`);
    vis.svg.append("g")
        .attr("class", "axis y-axis");

    // Axis titles
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Time (Years)");
    vis.svg.append("text")
        .attr("x", vis.width - 5)
        .attr("y", vis.height + 25)
        .text("% of Companies With Benefits");

    // Append a single path to the drawing area
    vis.svg.append("path")
        .attr("class", "line");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = [];

    // Create a sequence of values from 0 - 98 (age: 1-99; array length: 99)
    let companiesWithBenefits = d3.range(0, 6).map(function() {
      return 0;
    })

    let companiesNoBenefits = d3.range(0, 6).map(function () {
      return 0;
    })

    // TODO: FILTER DATA BY BENEFITS/NO BENEFITS
    let offerBenefits = "Does your employer provide mental health benefits as part of healthcare coverage?"
    let offerResources = "Does your employer offer resources to learn more about mental health concerns and options for seeking help?"
    vis.counts = {
      2016: 0,
      2017: 0,
      2018: 0,
      2019: 0,
      2020: 0
    };
    vis.data.forEach(d, i => {
      if (d[offerBenefits]) {
        vis.counts[Object.keys(vis.data)[i]] += 1;
      }
    })

    // TODO: CREATE STRUCT FOR # WITH MH DISORDER BY YEAR

    // Iterate over each day
    // vis.filteredData.forEach(d => {
    //   d3.range(0, 6).forEach(i => {
    //     if (d[years[i]) {
    //       companiesWithBenefits[i] += d.ages[i];
    //     }
    //   })
    // });

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    console.log(vis.data);
  }
}
