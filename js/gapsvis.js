class GapsVis {
  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    Object.values = Object.values || function(o){return Object.keys(o).map(function(k){return o[k]})};
    function flatten(a) { return [].concat.apply([], a); }
    this.filteredData = flatten(Object.values(this.data));

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
    vis.x0 = d3.scaleBand()
      .range([0, vis.height])
      .padding(0.3);

    vis.genders = ["Men", "Women", "Trans/Gender non-conforming/Other"];

    vis.color = d3.scaleOrdinal()
      .domain(vis.genders)
      .range(['#e41a1c','#377eb8','#4daf4a'])  // TODO: Pick better colors

    vis.y = d3.scaleLinear()
      .range([vis.width/2, vis.width]);

    vis.xAxis = d3.axisLeft()
      .scale(vis.x0);

    vis.yAxis = d3.axisTop()
      .scale(vis.y);

    // Append axes
    vis.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(${vis.width * 0.75}, 0)`);

    vis.svg.append("g")
      .attr("class", "y-axis axis");

    // TODO: Add axis titles, legend

    // (Filter, aggregate, modify data)
    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    // TODO: FIX THIS!!
    // let selectedYear = $('#gapsYearSelector').val();
    // let selectedCompanySize = $('#gapsCompanySizeSelector').val();
    //
    // if (selectedYear) {
    //   vis.filteredData = vis.data[selectedYear];
    // }
    // if (selectedCompanySize) {
    //   vis.filteredData = vis.filteredData.filter(
    //     d => d['How many employees does your company or organization have?'] === selectedCompanySize
    //   )
    // }

    vis.gender_counts = {
      'total': 0,
      'm': 0,
      'f': 0,
      'tnco': 0// Trans/Gender non-conforming/Other
    }
    vis.counts = {
      "Do you feel that your employer takes mental health as seriously as physical health?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Has your employer ever formally discussed mental health (for example, as part of a wellness campaign or other official communication)?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Does your employer provide mental health benefits as part of healthcare coverage?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Is your anonymity protected if you choose to take advantage of mental health or substance abuse treatment resources provided by your employer?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Have you heard of or observed negative consequences for co-workers who have been open about mental health issues in your workplace?": {
        "positive_responses": ["No"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "If a mental health issue prompted you to request a medical leave from work, asking for that leave would be:": {
        "positive_responses": ["Very easy"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Would you feel comfortable discussing a mental health disorder with your coworkers?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      },
      "Would you feel comfortable discussing a mental health disorder with your direct supervisor(s)?": {
        "positive_responses": ["Yes"],
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      }
    };
    vis.filteredData.forEach(d => {
      let gender;
      if (d["What is your gender?"] === "male") {
        gender = 'm';
      } else if (d["What is your gender?"] === "female") {
        gender = 'f';
      } else {
        gender = 'tnco';
      }
      vis.gender_counts.total += 1;
      vis.gender_counts[gender] += 1;
      Object.keys(vis.counts).forEach(q => {
        if (vis.counts[q].positive_responses.includes(d[q])) {
          vis.counts[q].total += 1;
          vis.counts[q][gender] += 1;
        }
      })
    })

    function calculate_gap(question, gender_category) {
      return 100 * (vis.gender_counts[gender_category] / vis.gender_counts.total -
        vis.counts[question][gender_category] / vis.counts[question].total);
    }

    vis.displayData = [];
    Object.keys(vis.counts).forEach(q => {
      vis.displayData.push({
        'question': q,
        'Men': calculate_gap(q, 'm'),
        'Women': calculate_gap(q, 'f'),
        'Trans/Gender non-conforming/Other': calculate_gap(q, 'tnco')
      })
    })

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Update domains
    vis.x0.domain(Object.keys(vis.counts));

    Object.values = Object.values || function(o){return Object.keys(o).map(function(k){return o[k]})};
    let percentages = [];
    vis.displayData.forEach(d => {
      vis.genders.forEach(g => {
        percentages.push(d[g])
      })
    });
    const maxMagnitude = Math.max(...d3.extent(percentages).map(value => Math.abs(value)));
    vis.y.domain([-1 * maxMagnitude - 3, maxMagnitude + 3]);

    vis.x1 = d3.scaleBand()
      .domain(vis.genders)
      .range([0, vis.x0.bandwidth()])
      .paddingInner(0.05);

    // Call axis functions with new domains
    vis.svg.select(".x-axis").call(vis.xAxis)
      .selectAll('text')
      .attr('transform', function() {
        // return `translate(${vis.width * -0.75  + this.getComputedTextLength()}, 0)`
        return `translate(${-vis.width * 0.15}, 0)`  // TODO: Figure out multi-line tick labels
      });
    vis.svg.select(".y-axis").call(vis.yAxis);

    console.log(vis.displayData);
    let barGroup = vis.svg.selectAll(".barGroup").data(vis.displayData);
    barGroup.enter().append("g").attr('class', 'barGroup')
      .merge(barGroup)
      .attr("transform", function(d) { return `translate(0, ${vis.x0(d.question)})`; })
      .selectAll("rect")
      .data(function(d) { return vis.genders.map(function(key) { return {key: key, value: d[key]}; }); })
      .enter().append("rect")
      .attr("y", function(d) { return vis.x1(d.key); })
      .attr("height", vis.x1.bandwidth())
      .attr("fill", function(d) { return vis.color(d.key); })
      .attr("x", function(d) {
        if (d.value < 0) {
          return vis.y(d.value);
        } else {
          return vis.width * 0.75;
        }
      })
      .transition()  // TODO: Fix this
      .attr("width", function(d) {
        if (d.value < 0) {
          return vis.width * 0.75 - vis.y(d.value);
        } else {
          return vis.y(d.value) - vis.width * 0.75;
        }
      });

    // TODO: Add tooltip

    barGroup.exit().remove();

  }
}