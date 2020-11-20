const questions = {
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
      .scale(vis.x0)
      .tickFormat((q, index) => question_order[index]);

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
      'tnco': 0// Trans/Gender non-conforming/Other
    }
    vis.counts = {}
    const qs = selectedYear === '2016' ? questions[selectedYear] : questions['other'];
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
          if (selectedYear === '2016') {
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
        // return `translate(${vis.width * -0.55  + this.getComputedTextLength()}, 0)`
        return `translate(${-vis.width * 0.25}, 0)`
      });
    vis.svg.select(".y-axis").transition().call(vis.yAxis);

    console.log(vis.displayData);
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
      .on('mouseover', )
      .each(function(d) {
        if (d.value < 0) {
          d3.select(this)
            .attr('x', vis.width * 0.75)
            .attr('width', 0)
            .transition()
            .attr('width', vis.width * 0.75 - vis.y(d.value))
            .attr('x', vis.y(d.value));
        } else {
          d3.select(this)
            .attr('x', vis.width * 0.75)
            .attr('width', 0)
            .transition()
            .attr('width', vis.y(d.value) - vis.width * 0.75);
        }
      });

    bars.exit().remove();

    // TODO: Add tooltip

  }
}