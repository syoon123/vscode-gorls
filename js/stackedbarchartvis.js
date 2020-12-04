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
    vis.margin = { top: 20, right: 50, bottom: 130, left: 50 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x0 = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.1);

    vis.x1 = d3.scaleBand()
        .padding(0.05);

    vis.y = d3.scaleLinear()
        .rangeRound([vis.height, 0])
        .domain([0, 1]);

    vis.y1 = d3.scaleBand()

    let colors = ['#FFCB5E','#B4A3E4','#63B8C0'];
    let genders = ["male", "female", "other"];

    vis.z = d3.scaleOrdinal()
        .domain(genders)
        .range(colors);

    // Create group for chart
    vis.g = vis.svg.append('g')
        .attr('transform', `translate(0, 80)`);

    // Add x-axis
    vis.g.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + vis.height + ")");

    // Add x-axis label
    vis.g.append("text")
      .attr("class", "axisLabel")
      .attr("transform",
        "translate(" + (vis.width/2) + " ," +
        (vis.height + vis.margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Company Size");

    // Add y-axis
    vis.g.append("g")
      .attr("class", "axis y-axis");

    // Add y-axis label
    vis.g.append("text")
      .attr("class", "axisLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - vis.margin.left)
      .attr("x", 0 - (vis.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("% of Survey Respondents");

    // Create legend
    vis.l = vis.svg.append("g")
        .attr("class", "g-legend")
        .attr("transform", "translate("+ (0) + "," + (40) + ")");
    var size = 15;
    vis.l.selectAll("legendBoxes")
        .data(genders)
        .enter()
        .append("rect")
        .attr("x", function(d,i){ return i * (size + 100)})
        .attr("y", 0)
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return vis.z(d)});
    vis.l.selectAll("legendLabels")
        .data(genders)
        .enter()
        .append("text")
        .attr("x", function(d,i){ return size + 5 + i * (size + 100)})
        .attr("y", 0 + size / 2)
        .style("fill", function(d){ return vis.z(d)})
        .text(function(d){
          switch (d) {
            case "male":
              return "men";
            case "female":
              return "women";
            case "other":
              return "trans, gender non-conforming, other";
          }
          })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    var questionSelector = document.getElementById('stackedBarChartQuestionSelector');
    switch(questionSelector.options[questionSelector.selectedIndex].value) {
      case "Q1":
        vis.selectedCategoryLabel = "Would you feel comfortable discussing a mental health disorder with your coworkers?";
        break;
      case "Q2":
        vis.selectedCategoryLabel = "Do you think that discussing a mental health disorder with your employer would have negative consequences?";
        break;
      case "Q3":
        vis.selectedCategoryLabel = "Do you think that discussing a mental health disorder with your employer would have negative consequences?";
        break;
    }

    // vis.yearData = vis.filterYear();

    // console.log(vis.selectedYearLabel);
    // console.log(vis.yearData.length);
    // console.log(vis.yearData);

    vis.yearData = vis.data["2016"];

    vis.displayData = [];

    vis.selectedCategoryValues = Array.from(d3.group(vis.yearData, d =>d[vis.selectedCategoryLabel]), ([key, value]) => (key)).filter(e => e !== "");
    vis.companySizeValues = ["1-5", "6-25", "26-100", "100-500", "500-1000", "More than 1000"];

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

    groupedData.forEach(function(companySizeList) {
      companySizeList.selectedCategory.forEach(function(selectedCategoryList, i) {
        var temp = {male: 0, female: 0, other: 0};
        selectedCategoryList[1].forEach(function(d) {
          if (d[vis.genderLabel] == "male")
            temp["male"]++;
          else if (d[vis.genderLabel] == "female")
            temp["female"]++;
          else
            temp["other"]++;
        })
        vis.displayData.forEach(function(obj) {
          if (obj.companySize == companySizeList.companySize && obj.selectedCategory == selectedCategoryList[0]) {
            obj.male = temp["male"];
            obj.female = temp["female"];
            obj.other = temp["other"];
          }
        })
      })
    })

    console.log(vis.displayData);
    var responsesPerCompanySize = {
      "1-5": 0,
      "6-25": 0,
      "26-100": 0,
      "100-500": 0,
      "500-1000": 0,
      "More than 1000": 0
    };
    vis.displayData.forEach(function(d) {
      responsesPerCompanySize[d.companySize] += d.male + d.female + d.other;
    })

    vis.displayData.forEach(function(d) {
      d.male = (d.male / responsesPerCompanySize[d.companySize]) * 100;
      d.female = (d.female / responsesPerCompanySize[d.companySize]) * 100;
      d.other = (d.other / responsesPerCompanySize[d.companySize]) * 100;
    })

    vis.standardGenderDistribution = [0, 0, 0];
    vis.yearData.forEach(function(d) {
      if (d[vis.genderLabel] == "male")
        vis.standardGenderDistribution[0]++;
      else if (d[vis.genderLabel] == "female")
        vis.standardGenderDistribution[1]++;
      else
        vis.standardGenderDistribution[2]++;
    })

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.x0.domain(vis.companySizeValues);
    vis.x1.domain(vis.selectedCategoryValues)
        .rangeRound([0, vis.x0.bandwidth()])
        .padding(0.2);

    vis.y.domain([0, 70]);

    vis.keys = vis.z.domain()
    var stackData = d3.stack()
        .keys(vis.keys)(vis.displayData)

    console.log(stackData);

    vis.serie = vis.g.selectAll(".serie")
        .data(stackData);
    vis.serie = vis.serie.enter()
        .append("g")
        .merge(vis.serie)
        .attr("class", "serie")
        .attr("fill", function(d) { return vis.z(d.key); });
    vis.serie.exit()
        .transition()
        .duration(500)
        .remove();

    vis.bars = vis.serie.selectAll("rect")
        .data(function(d) {
          return d; });
    vis.bars = vis.bars
        .enter()
        .append("rect")
        .merge(vis.bars)
        .attr("class", "serie-rect")
        .attr("transform", function(d) {
          return "translate(" + vis.x0(d.data.companySize) + ",0)"; })
        .attr("x", function(d) { return vis.x1(d.data.selectedCategory); })
        .attr("y", function(d) { return vis.y(d[1]); })
        .attr("height", function(d) { return vis.y(d[0]) - vis.y(d[1]); })
        .attr("width", vis.x1.bandwidth())
        .on('mouseover', function(event, d){
          let barData = [d.data["male"], d.data["female"], d.data["other"]]
          expectedPieVis.wrangleData(vis.standardGenderDistribution);
          observedPieVis.wrangleData(barData);
          vis.bars.attr('stroke', function (d2) {
            if (d.data.companySize == d2.data.companySize && d.data.selectedCategory == d2.data.selectedCategory) {
              return 'black';
            }
          });
          vis.bars.attr('stroke-width', function (d2) {
            if (d.data.companySize == d2.data.companySize && d.data.selectedCategory == d2.data.selectedCategory) {
              return 2;
            }
          });
        })
        .on('mouseout', function(){
          expectedPieVis.removeVis();
          observedPieVis.removeVis();
          vis.bars.attr('stroke-width', 0);
        });
    vis.bars.exit()
        .transition()
        .duration(500)
        .remove();

    // Add labels for each bar
    vis.labels = vis.serie.selectAll("text")
        .data(stackData[2]);
    vis.labels = vis.labels
        .enter()
        .append("text")
        .merge(vis.labels);
    vis.labels
        .attr("class", "serie-text")
        .attr("transform", function(d) {
          return "translate(" + vis.x0(d.data.companySize) + ",0)"; })
        .attr("x", function(d) { return vis.x1(d.data.selectedCategory) + (vis.x1.bandwidth() / 2); })
        .attr("y", function(d) { return vis.y(d[1]) - 3; })
        .style("font-size", "10px")
        .style('fill', "black")
        .attr('text-anchor', 'middle')
        .text(function(d) {
          return d.data.selectedCategory;
        });
    vis.labels.exit()
        .transition()
        .duration(500)
        .remove();

    // Call x-axis
    vis.svg.select('.x-axis')
        .call(d3.axisBottom(vis.x0));

    // Call y-axis
    vis.svg.select('.y-axis')
        .call(d3.axisLeft(vis.y).ticks(null, "s"));
  }

  wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = 0, //parseFloat(text.attr("dy")),
          tspan = text.text(null)
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
        }
      }
    });
  }

  // filterYear() {
  //   let vis = this;
  //
  //   var yearSelector = document.getElementById('stackedBarChartYearSelector');
  //   vis.selectedYearLabel = yearSelector.options[yearSelector.selectedIndex].value;
  //
  //   if (vis.selectedYearLabel == "2014") {
  //     var yearData = [];
  //     vis.data[2014].forEach(function (d) {
  //       var resp = d['Would you be willing to discuss a mental health issue with your coworkers?'];
  //       if (resp == "Some of them") {
  //         resp = "Maybe";
  //       }
  //       yearData.push({
  //         'What is your gender?': d['What is your gender?'],
  //         'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //         'Would you feel comfortable discussing a mental health disorder with your coworkers?': resp,
  //         'Do you think that discussing a mental health disorder with your employer would have negative consequences?': d['Do you think that discussing a mental health disorder with your employer would have negative consequences?'],
  //       })
  //     });
  //     yearData = yearData.slice(0, 10);
  //     return yearData;
  //   }
  //   else if (vis.selectedYearLabel == "2016") {
  //     var yearData = [];
  //     vis.data[2016].forEach(function (d) {
  //       yearData.push({
  //         'What is your gender?': d['What is your gender?'],
  //         'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //         'Would you feel comfortable discussing a mental health disorder with your coworkers?': d['Would you feel comfortable discussing a mental health disorder with your coworkers?'],
  //         'Do you think that discussing a mental health disorder with your employer would have negative consequences?': d['Do you think that discussing a mental health disorder with your employer would have negative consequences?'],
  //       })
  //     });
  //     return yearData;
  //   }
  //   else if (vis.selectedYearLabel == "2017" || vis.selectedYearLabel == "2018"  || vis.selectedYearLabel == "2019" ) {
  //     var yearData = [];
  //     vis.data[parseInt(vis.selectedYearLabel)].forEach(function (d) {
  //       yearData.push({
  //         'What is your gender?': d['What is your gender?'],
  //         'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //         'Would you feel comfortable discussing a mental health disorder with your coworkers?': d['Would you feel comfortable discussing a mental health issue with your coworkers?']
  //         //
  //       })
  //     });
  //     return yearData;
  //   }
  //   else {
  //     var yearData = [];
  //     vis.data[2016].forEach(function (d) {
  //       yearData.push({
  //         'What is your gender?': d['What is your gender?'],
  //         'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //         'Would you feel comfortable discussing a mental health disorder with your coworkers?': d['Would you feel comfortable discussing a mental health disorder with your coworkers?'],
  //         'Do you think that discussing a mental health disorder with your employer would have negative consequences?': d['Do you think that discussing a mental health disorder with your employer would have negative consequences?'],
  //       })
  //     });
  //     [2017, 2018, 2019].forEach(function (year) {
  //       vis.data[year].forEach(function (d) {
  //         yearData.push({
  //           'What is your gender?': d['What is your gender?'],
  //           'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //           'Would you feel comfortable discussing a mental health disorder with your coworkers?': d['Would you feel comfortable discussing a mental health issue with your coworkers?']
  //           //
  //         })
  //       })
  //     });
  //     vis.data[2014].forEach(function (d) {
  //       var temp = d['Would you be willing to discuss a mental health issue with your coworkers?'];
  //       if (temp == "Some of them") {
  //         temp = "Maybe";
  //       }
  //       yearData.push({
  //         'What is your gender?': d['What is your gender?'],
  //         'How many employees does your company or organization have?': d['How many employees does your company or organization have?'],
  //         'Would you feel comfortable discussing a mental health disorder with your coworkers?': temp,
  //         'Do you think that discussing a mental health disorder with your employer would have negative consequences?': d['Do you think that discussing a mental health disorder with your employer would have negative consequences?'],
  //       })
  //     });
  //     return yearData;
  //   }
  // }
}
