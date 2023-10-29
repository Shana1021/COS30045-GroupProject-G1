function init(){
   // Define chart dimensions and margins
    var w = 700;
    var h = 350;
    var margin = { top: 14.5, right: 30, bottom: 50, left: 150 };

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var duration = 800;

    // Create an SVG element to contain the chart
    var svg = d3.select("#chart4")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define color scale for data series (Emmigrants and Immigrants)
    var color = d3.scaleOrdinal()
        .domain(["Emmigrants", "Immigrants"])
        .range(["#4FA05C", "#C7492F"]);

    // Load data from a CSV file named "BarChart.csv"
    d3.csv("BarChart.csv").then(function(data) {
        // Extract the column headers (keys)
        var keys = data.columns.slice(1);

        // Define x-axis scale for the regions
        var x0 = d3.scaleBand()
            .domain(data.map(function (d) { return d.Region; }))
            .range([0, width])
            .padding(0.1);

        // Define x-axis scale for grouped bars
        var x1 = d3.scaleBand()
            .domain(keys)
            .range([0, x0.bandwidth()]);

        // Define y-axis scale for the percentage values
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return +d[key];
                });
            })])
            .nice() // This ensures that the axis starts at 0 and ends at a nice round number
            .range([height, 0]);

        // Create grouped bars based on the data
        var grouped = g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
            .enter()
            .append("g")
            .attr("fill", function (d) { return color(d.key); });

        // Create individual bars within grouped bars
        var rect = grouped.selectAll("rect")
            .data(function (d) { return d; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x0(d.data.Region); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x0.bandwidth())
            .attr("title", function (d) { return (d[1] - d[0]).toFixed(2) + '%'; }) // Round to 2 decimal places

        // Add x-axis label
        g.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .text("Region");

        // Add y-axis label
        g.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("transform", "rotate(-90)")
            .text("Percentage");

        // Create a linear scale for the percentage axis
        var percentageScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, -10]);

        // Add percentage axis
        var percentageAxis = d3.axisLeft(percentageScale)
            .tickFormat(function (d) { return d + "%"; });

        g.append("g")
            .attr("class", "y axis")
            .call(percentageAxis);

        // Add x-axis
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        // Create and show the tooltip
        var tooltip = d3.select("body").select(".tooltip");

        // Show tooltip on mouseover
        rect.on("mouseover", function (event, d) {
            var [x, y] = d3.pointer(event);
            var percentage = (d[1] - d[0]).toFixed(2) + '%';
            tooltip.style("opacity", 1);
            tooltip.html(percentage)
                .style("left", (x + 260 ) + "px")
                .style("top", (y + 10) + "px");
        });

        // Hide tooltip on mouseout
        rect.on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

        // Add event listener to radio buttons for mode selection
        d3.selectAll("input")
            .on("change", changed);

        // Function to switch between grouped and stacked bar modes
        function changed() {
            if (this.value === "grouped") GroupedBar();
            else StackedBar();
        }

        // Function to transition to grouped bar mode
        function GroupedBar() {
            rect
                .transition()
                .duration(duration)
                .attr("width", x1.bandwidth())
                .transition()
                .duration(duration)
                .attr("x", function (d) {
                    return x0(d.data.Region) + x1(d3.select(this.parentNode).datum().key);
                })
                .transition()
                .duration(duration)
                .attr("y", function (d) { return y(d[1] - d[0]); })
                .attr("height", function (d) { return y(0) - y(d[1] - d[0]); });
        }

        // Function to transition to stacked bar mode
        function StackedBar() {
            rect
                .transition()
                .duration(duration)
                .attr("y", function (d) { return y(d[1] - d[0]); }) // Adjust y to the top of the bar
                .attr("height", function (d) { return y(d[0]) - y(d[1]); }) // Adjust height
                .transition()
                .duration(duration)
                .attr("y", function (d) { return y(d[1]); })
                .transition()
                .duration(duration)
                .attr("x", function (d) { return x0(d.data.Region); })
                .attr("width", x0.bandwidth());
        }
    });
}
window.onload =init;