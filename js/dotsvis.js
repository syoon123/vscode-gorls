class DotsVis {

  aggregate(dotsData) {
    Object.values = Object.values || function(o){return Object.keys(o).map(function(k){return o[k]})};
    function flatten(a) { return [].concat.apply([], a); }
    return flatten(Object.values(dotsData));
  }

  constructor(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.aggregate(this.data);
    this.displayData = new Set();

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

    vis.genders = ["men", "women", "trans, gender non-conforming, other"];

    vis.color = d3.scaleOrdinal()
      .domain(vis.genders)
      .range(['#FFCB5E','#B4A3E4','#63B8C0'])

    //add tooltip
    vis.tooltip = d3.select("body").append('div')
      .attr('class', "dots-tooltip");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let points = vis.filteredData.map(d => {
      return {
        'gender': d["What is your gender?"],
      }
    });

    function phyllotaxisLayout(points, pointWidth, xOffset = 0, yOffset = 0, iOffset = 0) {
      // theta determines the spiral of the layout
      const theta = Math.PI * (3 - Math.sqrt(5));

      const pointRadius = pointWidth / 2;

      points.forEach((point, i) => {
        const index = (i + iOffset) % points.length;
        const phylloX = pointRadius * Math.sqrt(index) * Math.cos(index * theta);
        const phylloY = pointRadius * Math.sqrt(index) * Math.sin(index * theta);

        point.x = xOffset + phylloX - pointRadius;
        point.y = yOffset + phylloY - pointRadius;
        // point.radius = point.gender === 'male' || point.gender === 'female' ? 3.5 : 5;
        point.radius = 3.6
      });

      return points;
    }
    console.log(points.length);

    vis.displayData = phyllotaxisLayout(points, 10.5, vis.width/2, vis.height/2);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    const center = {x: vis.width/2, y: vis.height/2};
    const forceStrength = 0.001;

    const simulation = d3.forceSimulation()
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('collide', d3.forceCollide().radius(d => d.radius + 1).iterations(3));

    simulation.stop();

    function ticked() {
      let dots = vis.svg.selectAll('circle').data(vis.displayData);
      dots.enter()
        .append('circle')
        .merge(dots)
        .attr('r', d => d.radius)
        .attr('fill', function(d) {
          let gender;
          console.log(d.gender);
          if (d.gender === "male") {
            gender = 'men';
          } else if (d.gender === "female") {
            gender = 'women';
          } else {
            gender = 'trans, gender non-conforming, other';
          }
          return vis.color(gender);
        })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('mouseover', function(event, d) {
          vis.tooltip
            .style("opacity", 1)
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 5 + "px")
            .html('<div>' +
              `<p>${d.gender}`+
              '</p></div>');
        })
        .on('mouseout', function() {
          vis.tooltip
            .style('opacity', 0)
            .html('');
        })
      dots.exit().remove();
    }

    simulation.nodes(vis.displayData)
      .on('tick', ticked)
      .restart();

  }
}
