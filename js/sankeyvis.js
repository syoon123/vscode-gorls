class SankeyVis {
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

    let questionOne = "Do you currently have a mental health disorder?";
    let questionTwo = "Do you feel that being identified as a person with a mental health issue would hurt your career?";
    let questionThree = "Would you feel comfortable discussing a mental health disorder with your coworkers?";

    vis.wrap(vis.svg.append("text")
        .style("font", "10px sans-serif")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(questionOne), vis.width / 3 - 10);

    vis.wrap(vis.svg.append("text")
        .style("font", "10px sans-serif")
        .attr("x", vis.width / 2)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(questionTwo), vis.width / 3 - 10);

    vis.wrap(vis.svg.append("text")
        .style("font", "10px sans-serif")
        .attr("x", vis.width)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(questionThree), vis.width / 3 - 10);

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let questionOne = "Do you currently have a mental health disorder?";
    let questionTwo = "Do you feel that being identified as a person with a mental health issue would hurt your career?";
    let questionThree = "Would you feel comfortable discussing a mental health disorder with your coworkers?";

    // let questionOneValues = Array.from(d3.group(vis.data[2016], d =>d[questionOne]), ([key, value]) => (key)).filter(e => e !== "");
    // let questionTwoValues = Array.from(d3.group(vis.data[2016], d =>d[questionTwo]), ([key, value]) => (key)).filter(e => e !== "");
    // let questionThreeValues = Array.from(d3.group(vis.data[2016], d =>d[questionThree]), ([key, value]) => (key)).filter(e => e !== "");
    let questionOneValues = ["Yes", "Maybe", "No"];
    let questionTwoValues = ["Yes, it has", "Yes, I think it would", "Maybe", "No, I don't think it would", "No, it hasn't"];
    let questionThreeValues = ["Yes", "Maybe", "No"];

    vis.dataOrder = {};
    vis.tempDisplayData = [];

    questionOneValues.forEach(function(qOneVal) {
      questionTwoValues.forEach(function(qTwoVal) {
        questionThreeValues.forEach(function(qThreeVal) {
          vis.tempDisplayData.push({
            questionOne: qOneVal,
            questionTwo: qTwoVal,
            questionThree: qThreeVal,
            value: 0
          });
          vis.dataOrder[qOneVal + qTwoVal + qThreeVal] = vis.tempDisplayData.length - 1;
        });
      });
    });

    let selectedCompanySize = $('#sankeyCompanySizeSelector').val();

    vis.filteredData = vis.data[2016];

    if (selectedCompanySize) {
      vis.filteredData = vis.filteredData.filter(
          d => d['How many employees does your company or organization have?'] === selectedCompanySize
      )
    }

    vis.filteredData.forEach(function(d) {
      if (d.questionOne != "" && d.questionTwo != "" && d.questionThree != "") {
        var index = vis.dataOrder[d[questionOne] + d[questionTwo] + d[questionThree]];
        if (index != null) {
          vis.tempDisplayData[index].value += 1;
        }
      }
    });

    vis.displayData = vis.tempDisplayData;
    vis.keys = ["questionOne", "questionTwo", "questionThree"];

    let index = -1;
    const nodes = [];
    const nodeByKey = new Map;
    const indexByKey = new Map;
    const links = [];

    for (const k of vis.keys) {
      for (const d of vis.displayData) {
        const key = JSON.stringify([k, d[k]]);
        if (nodeByKey.has(key)) continue;
        const node = {name: d[k]};
        nodes.push(node);
        nodeByKey.set(key, node);
        indexByKey.set(key, ++index);
      }
    }

    for (let i = 1; i < vis.keys.length; ++i) {
      const a = vis.keys[i - 1];
      const b = vis.keys[i];
      const prefix = vis.keys.slice(0, i + 1);
      const linkByKey = new Map;
      for (const d of vis.displayData) {
        const names = prefix.map(k => d[k]);
        const key = JSON.stringify(names);
        const value = d.value || 1;
        let link = linkByKey.get(key);
        if (link) { link.value += value; continue; }
        link = {
          source: indexByKey.get(JSON.stringify([a, d[a]])),
          target: indexByKey.get(JSON.stringify([b, d[b]])),
          names,
          value
        };
        links.push(link);
        linkByKey.set(key, link);
      }
    }

    vis.nodes = nodes;
    vis.links = links;

    console.log({nodes, links});

    // vis.data[2016]


    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.color = d3.scaleOrdinal(["No", "Yes", "Maybe"], ['#B4A3E4','#63B8C0','#FFCB5E']).unknown("#ccc");

    vis.sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[vis.margin.left, vis.margin.top], [vis.width - vis.margin.right, vis.height - vis.margin.bottom]]);

    const {nodes, links} = vis.sankey({
      nodes: vis.nodes.map(d => Object.assign({}, d)),
      links: vis.links.map(d => Object.assign({}, d))
    });

    if (vis.rects != null) {
      vis.rects.remove();
    }
    vis.rects = vis.svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0);

    if (vis.paths != null) {
      vis.paths.remove();
    }
    vis.paths = vis.svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => vis.color(d.names[0]))
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply");

    vis.paths
        .on("mouseover", function(d, e) {
          vis.paths.attr('stroke', d => vis.color("gray"));
          d3.select(this).attr('stroke', vis.color(e.names[0]));
          vis.paths
              .style('stroke', function (link_d) {
                if (e.source == link_d.source && e.target == link_d.target && e.names == link_d.names) {
                  return vis.color(link_d.names[0]);
                }
                else if (e.target == link_d.source && e.names[0] == link_d.names[0]) {
                  return vis.color(link_d.names[0]);
                }
                else {
                  return vis.color("gray");
                }
              });
        })
        .on("mouseout", function(d) {
          vis.paths
              .style('stroke', function (link_d) {
                return vis.color(link_d.names[0]);});
        });

    if (vis.yLabels != null || vis.yLabels2 != null) {
      vis.yLabels.remove();
      vis.yLabels2.remove();
    }
    vis.yLabels = vis.svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < vis.width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < vis.width / 2 ? "start" : "end")
        .text(d => d.name);
    vis.yLabels2 = vis.yLabels
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);
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
}

