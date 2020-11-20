const questions = {
  '2014': {
    'My company takes mental and physical health equally seriously.': {
      'question': "Do you feel that your employer takes mental health as seriously as physical health?",
      'positive_responses': ['Yes']
    },
    'My employer has formally discussed mental health. ': {
      'question': "Has your employer ever discussed mental health as part of an employee wellness program?",
      'positive_responses': ['Yes']
    },
    'My employer provides mental health benefits.': {
      'question': "Does your employer provide mental health benefits?",
      'positive_responses': ['Yes']
    },
    'My anonymity is protected should I take advantage of employer-provided resources.': {
      'question': "Is your anonymity protected if you choose to take advantage of mental health or substance abuse treatment resources?",
      'positive_responses': ['No']
    },
    'I have not observed negative consequences for being open about mental health issues in the workplace.': {
      'question': "Have you heard of or observed negative consequences for coworkers with mental health conditions in your workplace?",
      'positive_responses': ['No']
    },
    'It is easy to request medical leave for mental health issues.': {
      'question': "How easy is it for you to take medical leave for a mental health condition?",
      'positive_responses': ['Very easy']
    },
    'I\'d feel comfortable discussing a mental health issue with my coworkers.': {
      'question': "Would you be willing to discuss a mental health issue with your coworkers?",
      'positive_responses': ['Yes']
    },
    'I\'d feel comfortable discussing a mental health issue with my direct superior.': {
      'question': "Would you be willing to discuss a mental health issue with your direct supervisor(s)?",
      'positive_responses': ['Yes']
    }
  },
  '2016': {
    'My company takes mental and physical health equally seriously.': {
      'question': "Do you feel that your employer takes mental health as seriously as physical health?",
      'positive_responses': ['Yes']
    },
    'My employer has formally discussed mental health. ': {
      'question': "Has your employer ever formally discussed mental health (for example, as part of a wellness campaign or other official communication)?",
      'positive_responses': ['Yes']
    },
    'My employer provides mental health benefits.': {
      'question': "Does your employer provide mental health benefits as part of healthcare coverage?",
      'positive_responses': ['Yes']
    },
    'My anonymity is protected should I take advantage of employer-provided resources.': {
      'question': "Is your anonymity protected if you choose to take advantage of mental health or substance abuse treatment resources provided by your employer?",
      'positive_responses': ['No']
    },
    'I have not observed negative consequences for being open about mental health issues in the workplace.': {
      'question': "Have you heard of or observed negative consequences for co-workers who have been open about mental health issues in your workplace?",
      'positive_responses': ['No']
    },
    'It is easy to request medical leave for mental health issues.': {
      'question': "If a mental health issue prompted you to request a medical leave from work, asking for that leave would be:",
      'positive_responses': ['Very easy']
    },
    'I\'d feel comfortable discussing a mental health issue with my coworkers.': {
      'question': "Would you feel comfortable discussing a mental health disorder with your coworkers?",
      'positive_responses': ['Yes']
    },
    'I\'d feel comfortable discussing a mental health issue with my direct superior.': {
      'question': "Would you feel comfortable discussing a mental health disorder with your direct supervisor(s)?",
      'positive_responses': ['Yes']
    }
  },
  'other': {
    'My company takes mental and physical health equally seriously.': {
      'question': "Would you feel more comfortable talking to your coworkers about your physical health or your mental health?",
      'positive_responses': ['Same level of comfort for each']
    },
    'My employer has formally discussed mental health. ': {
      'question': "Has your employer ever formally discussed mental health (for example, as part of a wellness campaign or other official communication)?",
      'positive_responses': ['Yes']
    },
    'My employer provides mental health benefits.': {
      'question': "Does your employer provide mental health benefits as part of healthcare coverage?",
      'positive_responses': ['Yes']
    },
    'My anonymity is protected should I take advantage of employer-provided resources.': {
      'question': "Is your anonymity protected if you choose to take advantage of mental health or substance abuse treatment resources provided by your employer?",
      'positive_responses': ['No']
    },
    'I have not observed negative consequences for being open about mental health issues in the workplace.': {
      'question': "Have your observations of how another individual who discussed a mental health issue made you less likely to reveal a mental health issue yourself in your current workplace?",
      'positive_responses': ['No']
    },
    'It is easy to request medical leave for mental health issues.': {
      'question': "If a mental health issue prompted you to request a medical leave from work, how easy or difficult would it be to ask for that leave?",
      'positive_responses': ['Very easy']
    },
    'I\'d feel comfortable discussing a mental health issue with my coworkers.': {
      'question': "Would you feel comfortable discussing a mental health issue with your coworkers?",
      'positive_responses': ['Yes']
    },
    'I\'d feel comfortable discussing a mental health issue with my direct superior.': {
      'question': "Would you feel comfortable discussing a mental health issue with your direct supervisor(s)?",
      'positive_responses': ['Yes']
    }
  },
}

const question_order = [
  'My company takes mental and physical health equally seriously.',
  'My employer has formally discussed mental health. ',
  'My employer provides mental health benefits.',
  'It is easy to request medical leave for mental health issues.',
  'My anonymity is protected should I take advantage of employer-provided resources.',
  'I have not observed negative consequences for being open about mental health issues in the workplace.',
  'I\'d feel comfortable discussing a mental health issue with my coworkers.',
  'I\'d feel comfortable discussing a mental health issue with my direct superior.',
]

class GapsVis {

  aggregate(gapsData) {
    Object.values = Object.values || function(o){return Object.keys(o).map(function(k){return o[k]})};
    function flatten(a) { return [].concat.apply([], a); }
    return flatten(Object.values(gapsData));
  }

  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.aggregate(this.data);

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 80, right: 20, bottom: 10, left: 20 };

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

    vis.genders = ["men", "women", "trans, gender non-conforming, other"];

    vis.color = d3.scaleOrdinal()
      .domain(vis.genders)
      .range(['#FFCB5E','#B4A3E4','#63B8C0'])

    vis.y = d3.scaleLinear()
      .range([vis.width/2, vis.width]);

    vis.xAxis = d3.axisLeft()
      .scale(vis.x0)
      .tickFormat((q, index) => question_order[index]);

    vis.yAxis = d3.axisTop()
      .scale(vis.y)
      .tickFormat(q => q + '%');

    // Append axes
    vis.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(${vis.width * 0.75}, 0)`);

    vis.svg.append("g")
      .attr("class", "y-axis axis");

    // Add y-axis label
    vis.svg.append("text")
      .attr("class", "axisLabel")
      .text('Gaps (Observed - Expected)')
      .attr("transform", function() {
        return "translate(" + (vis.width - this.getComputedTextLength() + 10) + " ," +
          -30 + ")"
      })
      .style("text-anchor", "right");

    // Create legend
    vis.l = vis.svg.append("g")
      .attr("class", "g-legend")
      .attr("transform", "translate("+ (0) + "," + (40) + ")");
    const size = 15;
    vis.l.selectAll("legendBoxes")
      .data(vis.genders)
      .enter()
      .append("rect")
      .attr("x", function(d,i) { return i * (size + 70) + vis.width * 0.59 })
      .attr("y", -120)
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d) { return vis.color(d) });
    vis.l.selectAll("legendLabels")
      .data(vis.genders)
      .enter()
      .append("text")
      .attr("x", function(d,i) { return size + 5 + i * (size + 70)  + vis.width * 0.59 })
      .attr("y", -120 + size / 2)
      .style("fill", function(d){ return vis.color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .attr('font-size', 'small')
      .style("alignment-baseline", "middle")

    //add tooltip
    vis.tooltip = d3.select("body").append('div')
      .attr('class', "tooltip");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let selectedYear = $('#gapsYearSelector').val();
    let selectedCompanySize = $('#gapsCompanySizeSelector').val();

    vis.filteredData = vis.aggregate(vis.data);
    if (selectedYear) {
      vis.filteredData = vis.data[selectedYear];
    }
    if (selectedCompanySize) {
      vis.filteredData = vis.filteredData.filter(
        d => d['How many employees does your company or organization have?'] === selectedCompanySize
      )
    }

    vis.gender_counts = {
      'total': 0,
      'm': 0,
      'f': 0,
      'tnco': 0// trans, gender non-conforming, other
    }
    vis.counts = {}
    const qs = selectedYear === '2014' || selectedYear === '2016' ? questions[selectedYear] : questions['other'];
    question_order.forEach(q => {
      vis.counts[q] = {
        'positive_responses': qs[q].positive_responses,
        "total": 0,
        "m": 0,
        "f": 0,
        "tnco": 0
      }
    });

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

      question_order.forEach(question => {
        let q;
        if (selectedYear === '') {
          Object.keys(questions).forEach(yr => {
            q = questions[yr][question].question;
            if (vis.counts[question].positive_responses.includes(d[q])) {
              vis.counts[question].total += 1;
              vis.counts[question][gender] += 1;
            }
          })
        } else {
          if (selectedYear === '2014' || selectedYear === '2016') {
            q = questions[selectedYear][question].question;
          } else {
            q = questions['other'][question].question;
          }
          if (vis.counts[question].positive_responses.includes(d[q])) {
            vis.counts[question].total += 1;
            vis.counts[question][gender] += 1;
          }
        }
      });
    })

    function calculate_gap(question, gender_category) {
      if (vis.gender_counts.total === 0 || vis.counts[question].total === 0) {
        return 0;
      }
      return 100 * (vis.counts[question][gender_category] / vis.counts[question].total -
        vis.gender_counts[gender_category] / vis.gender_counts.total);
    }

    vis.displayData = [];
    Object.keys(vis.counts).forEach(q => {
      vis.displayData.push({
        'question': q,
        'men': {
          'positive_proportion': vis.counts[q].total !== 0 ? 100 * vis.counts[q]['m'] / vis.counts[q].total : 0,
          'total_proportion': vis.gender_counts.total !== 0 ? 100 * vis.gender_counts['m'] / vis.gender_counts.total : 0,
          'gap': calculate_gap(q, 'm'),
        },
        'women': {
          'positive_proportion': vis.counts[q].total !== 0 ? 100 * vis.counts[q]['f'] / vis.counts[q].total : 0,
          'total_proportion': vis.gender_counts.total !== 0 ? 100 * vis.gender_counts['f'] / vis.gender_counts.total : 0,
          'gap': calculate_gap(q, 'f'),
        },
        'trans, gender non-conforming, other': {
          'positive_proportion': vis.counts[q].total !== 0 ? 100 * vis.counts[q]['tnco'] / vis.counts[q].total : 0,
          'total_proportion': vis.gender_counts.total !== 0 ? 100 * vis.gender_counts['tnco'] / vis.gender_counts.total : 0,
          'gap': calculate_gap(q, 'tnco'),
        }
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
        percentages.push(d[g].gap)
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
      .attr('class', 'tickLabel')
      .attr('transform', function() {
        return `translate(${-vis.width * 0.25}, 0)`
      });

    vis.svg.select(".y-axis").attr('class', 'tickLabel').transition().call(vis.yAxis);

    let barGroup = vis.svg.selectAll(".barGroup").data(vis.displayData);
    barGroup.enter().append("g").attr('class', 'barGroup')
      .merge(barGroup)
      .attr("transform", function(d) { return `translate(0, ${vis.x0(d.question)})`; });
    barGroup.exit().remove();

    let bars = vis.svg.selectAll('.barGroup')
      .selectAll(".bar")
      .data(function(d) { return vis.genders.map(function(key) { return {key: key, value: d[key]}; }); });
    bars.enter().append("rect").attr('class', 'bar')
      .merge(bars)
      .attr("y", function(d) { return vis.x1(d.key); })
      .attr("height", vis.x1.bandwidth())
      .attr("fill", function(d) { return vis.color(d.key); })
      .on('mouseover', function(event, d) {
        vis.tooltip
          .style("opacity", 1)
          .style("left", d.value.gap < 0 ? event.pageX + 20 + "px" : event.pageX - 240 + 'px')
          .style("top", event.pageY - 60 + "px")
          .html('<div>' +
            `<p><b>${d.value.positive_proportion.toFixed(2) + '%'}</b> of respondents who agreed with this statement ` +
            `identified as <b>${d.key}</b>, compared to the <b>${d.value.total_proportion.toFixed(2) + '%'}</b> of all ` +
            `respondents who identified as such, yielding a gap of <b>${d.value.gap.toFixed(2) + '%'}</b>.` +
            '</p></div>');
      })
      .on('mouseout', function() {
        vis.tooltip
          .style('opacity', 0)
          .html('');
      })
      .attr('width', 0)
      .each(function(d) {
        if (d.value.gap < 0) {
          d3.select(this)
            .attr('x', vis.width * 0.75)
            .transition()
            .attr('width', vis.width * 0.75 - vis.y(d.value.gap))
            .attr('x', vis.y(d.value.gap));
        } else {
          d3.select(this)
            .attr('x', vis.width * 0.75 + 1)
            .transition()
            .attr('width', vis.y(d.value.gap) - vis.width * 0.75);
        }
      });

    bars.exit().remove();
  }
}