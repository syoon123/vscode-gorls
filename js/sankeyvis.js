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

    vis.data[2016].forEach(function(d) {
      if (d.questionOne != "" && d.questionTwo != "" && d.questionThree != "") {
        var index = vis.dataOrder[d[questionOne] + d[questionTwo] + d[questionThree]];
        if (index != null) {
          vis.tempDisplayData[index].value += 1;
        }
      }
    });

    console.log(vis.tempDisplayData);

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
    // console.log(vis.data);
    vis.color = d3.scaleOrdinal(["No", "Yes", "Maybe"], ['#FFCB5E','#B4A3E4','#63B8C0']).unknown("#ccc");

    vis.sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[0, 5], [vis.width, vis.height - 5]]);

    const {nodes, links} = vis.sankey({
      nodes: vis.nodes.map(d => Object.assign({}, d)),
      links: vis.links.map(d => Object.assign({}, d))
    });


    vis.svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);

    vis.svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => vis.color(d.names[0]))
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply")
        .append("title")
        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

    vis.svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < vis.width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < vis.width / 2 ? "start" : "end")
        .text(d => d.name)
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);
  }
}

