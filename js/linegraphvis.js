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

    // Append axes groups to the drawing area
    vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${vis.height})`);
    vis.svg.append("g")
        .attr("class", "axis y-axis");

    // Axis titles
    vis.svg.append("text")
        .attr("x", -10)
        .attr("y", -8)
        .text("% of Companies With Benefits");
    vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", vis.height + 20)
        .text("Year");

    // Append a single path to the drawing area
    vis.linePath = vis.svg.append("path")
        .attr("class", "line benefits-line");
    // Define the D3 line generator
    vis.line = d3.line()
        .x(d => vis.x(d.year))
        .y(d => vis.y(d.proportion))
        .curve(d3.curveLinear);

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = [];

    // TODO: FILTER DATA BY BENEFITS/NO BENEFITS
    let offerBenefits = "Does your employer provide mental health benefits as part of healthcare coverage?"

    // TODO: MAKE COUNTS INTO PROPORTIONS
    Object.keys(vis.data).forEach( (year, i) => {
      console.log(year, vis.data[year])
      vis.displayData.push(
          {
            year: year,
            proportion: 0
          }
      );
      let count = 0;
      vis.data[year].forEach( d => {
        if (d[offerBenefits] === "Yes") {
          count += 1;
        }
      })
      vis.displayData[i].proportion = count / vis.data[year].length;
    });

    console.log("vis.displaydata linegraph", vis.displayData)

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    console.log(vis.data)

    // Update the scales and draw axes of the graph
    vis.x.domain(d3.extent(vis.displayData, d => d.year));
    vis.svg.select(".x-axis")
        .call(vis.xAxis);
    vis.y.domain([0, d3.max(vis.displayData, d => d.proportion)]);
    vis.svg.select(".y-axis")
        .call(vis.yAxis);

    // Define the line for graph
    vis.linePath
        .datum(vis.displayData)
        .transition()
        .duration(800)
        .attr("d", vis.line);

    // Update points on the line graph
    let points = vis.svg.selectAll(".point")
        .data(vis.displayData);
    points.enter().append("circle")
        .attr("class", "point")
        .attr("fill", "green")
        // .on("click", (event, d) => showEdition(d))
        // .on("mouseover", (event, d) => updateTooltip(event, d))
        // .on("mouseout", hideTooltip)
        .merge(points)
        .transition()
        .duration(800)
        .attr("cx", d => vis.x(d.year))
        .attr("cy", d => vis.y(d.proportion))
        .attr("r", 4);

    points.exit().remove();
  }
}
