class StackedBarChartVis {
  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.selectedCategoryLabel = "Would you feel comfortable discussing a mental health disorder with your coworkers?";
    vis.genderLabel = "What is your gender?";
    vis.companySizeLabel = "How many employees does your company or organization have?";

    // margin conventions
    vis.margin = { top: 20, right: 50, bottom: 100, left: 50 };

    vis.width = 700;
    vis.height = 300;

    // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    // vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // add title
    vis.svg.append('g')
        .attr('class', 'title stacked-bar-chart-title')
        .append('text')
        .text(vis.selectedCategoryLabel)
        .attr('transform', `translate(${vis.width / 2}, 20)`)
        .attr("font-weight", "bold")
        .style("font-size", "12px")
        .attr('text-anchor', 'middle');

    vis.x0 = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.1);

    vis.x1 = d3.scaleBand()
        .padding(0.05);

    vis.y = d3.scaleLinear()
        .rangeRound([vis.height, 0])
        .domain([0, 1]);

    vis.y1 = d3.scaleBand()

    vis.z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = []

    // vis.companySizeValues = Array.from(d3.group(vis.data, d =>d[companySizeLabel]), ([key, value]) => (key)).filter(e => e !== "");
    vis.selectedCategoryValues = Array.from(d3.group(vis.data[2016], d =>d[vis.selectedCategoryLabel]), ([key, value]) => (key)).filter(e => e !== "");
    // manually set company size value for order
    vis.companySizeValues = ["1-5", "6-25", "26-100", "100-500", "500-1000", "More than 1000"];

    console.log(vis.companySizeValues);

    vis.companySizeValues.forEach(function(companySize) {
      vis.selectedCategoryValues.forEach(function(selectedCategory) {
        if (companySize !== "" && selectedCategory !== "") {
          vis.displayData.push({
            companySize: companySize,
            selectedCategory: selectedCategory,
            male: 0,
            female: 0,
            other: 0
          })
        }
      })
    })

    let groupedData = Array.from(d3.group(vis.data[2016], d =>d[vis.companySizeLabel]), function([key, value]) {
      {
        return {
          companySize: key,
          selectedCategory: Array.from(d3.group(value, d =>d[vis.selectedCategoryLabel])),
        }
      }
    });

    vis.yMax = 0;

    groupedData.forEach(function(companySizeList) {
      companySizeList.selectedCategory.forEach(function(selectedCategoryList) {
        var temp = {male: 0, female: 0, other: 0};
        // var total = 0;
        selectedCategoryList[1].forEach(function(d) {
          if (d[vis.genderLabel] == "male")
            temp["male"]++;
          else if (d[vis.genderLabel] == "female")
            temp["female"]++;
          else
            temp["other"]++;
          // total++;
        })
        vis.displayData.forEach(function(obj) {
          if (obj.companySize == companySizeList.companySize && obj.selectedCategory == selectedCategoryList[0]) {
            obj.male = temp["male"];
            obj.female = temp["female"];
            obj.other = temp["other"];
            // obj.male = (temp["male"] / total) * 100;
            // obj.female = (temp["female"] / total) * 100;
            // obj.other = (temp["other"] / total) * 100;
          }
        })
      })
    })

    console.log(vis.displayData);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.x0.domain(vis.companySizeValues);
    vis.x1.domain(vis.selectedCategoryValues)
        .rangeRound([0, vis.x0.bandwidth()])
        .padding(0.2);

    vis.z.domain(["male", "female", "other"]);
    vis.keys = vis.z.domain()


    vis.y.domain([0, 200]);
    // vis.y.domain([0, 100]);

    console.log(vis.displayData);
    console.log(vis.keys);
    var stackData = d3.stack()
        .keys(vis.keys)(vis.displayData)
    console.log("stackData", stackData);

    var g = vis.svg.append('g')
        .attr('transform', `translate(0, 60)`);

    var serie = g.selectAll(".serie")
        .data(stackData)
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function(d) { return vis.z(d.key); });

    serie.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class", "serie-rect")
        .attr("transform", function(d) {
          return "translate(" + vis.x0(d.data.companySize) + ",0)"; })
        .attr("x", function(d) { return vis.x1(d.data.selectedCategory); })
        .attr("y", function(d) { return vis.y(d[1]); })
        .attr("height", function(d) { return vis.y(d[0]) - vis.y(d[1]); })
        .attr("width", vis.x1.bandwidth())
        .on("click", function(d, i){ console.log("serie-rect click d", i, d); });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.x0));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(vis.y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", vis.y(vis.y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("# of Survey Respondents");
  }
}
