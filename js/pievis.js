class PieVis {
    constructor(_parentElement, _data, _titleText) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.titleText = _titleText;
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 110, right: 20, bottom: 20, left: 20 };

        vis.width = 200;
        vis.height = 200;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.colors = ['#FFCB5E','#B4A3E4','#63B8C0'];

        if (vis.data != null) {
            vis.wrangleData(vis.data);
        }
    }

    wrangleData(data) {
        let vis = this;

        vis.data = data;

        vis.displayData = [];

        function round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }

        var tempSum = d3.sum(vis.data);
        data.forEach(function(d, i) {
            vis.displayData.push({
                value: round((d / tempSum) * 100, 2),
                color: vis.colors[i]
            });
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text(vis.titleText)
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle');


        var radius = Math.min(vis.width, vis.height) / 2;

        var arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var pie = d3.pie()
            .value(function(d) { return d.value; });

        vis.g = vis.svg.selectAll(".arc")
            .data(pie(vis.displayData))
            .enter().append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + vis.width / 2 + "," + (vis.height / 2 + 10) + ")");

        vis.g.append("path")
            .attr("d", arc)
            // .attr("stroke", function (d) {
            //     if (vis.titleText == "Observed") {
            //         return 'black';
            //     }
            // })
            // .style("stroke-width", function (d) {
            //     if (vis.titleText == "Observed") {
            //         return 2;
            //     }
            // })
            .style("fill", function(d,i) {
                return vis.colors[i];
            });

        vis.g.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) {
                if (d.value > 0) {
                    return (d.value + "%");
                }
            });
    }

    removeVis() {
        let vis = this;

        vis.title.remove();
        vis.g.remove();
    }
}
