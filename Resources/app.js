// Define the SVG object that will contain the chart in the HTML
var svgHeight = 500;
var svgWidth = 1000;

var margins = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 40
};

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

// Add the SVG object in the HTML
var svg = d3.select("#svg-spot") // "svg-spot" is a div id hence the pound sign
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Add the chart to the SVG object
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margins.left + 100}, ${margins.top})`);

// Load data from data.csv
d3.csv("Resources/data.csv", function(error, data){
    // If there's an error, throw an error
    if (error) throw error;
    
    // Otherwise, print the data
    console.log(data);

    // Convert the numbers from strings to floats
    // I chose to plot poverty vs obesity
    data.forEach(function(d){
        d.poverty = +d.poverty;
        // d.age = +d.age;
        // d.income = +d.income;
        d.obesity = +d.obesity;
        // d.smokes = +d.smokes;
        // d.noHealthInsurance = +d.noHealthInsurance;
    });

    // Configure poverty as the x-axis
    var xPovertyScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.poverty))
        .range([0, width]);

    // Configure obesity as the y-axis
    var yObesityScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.obesity))
        .range([height, 0]);
    
    // Create new functions for the axes
    var bottomAxis = d3.axisBottom(xPovertyScale);
    var leftAxis = d3.axisLeft(yObesityScale);

    // Append an SVG group element for the left y-axis to the chartGroup
    chartGroup.append("g")
              .classed("axis", true)
              .call(leftAxis);

    // Append an SVG group element for the bottom x-axis to the chartGroup
    chartGroup.append("g")
              .classed("axis", true)
              .attr("transform", `translate(0,${height})`)
              .call(bottomAxis);

    // Create a group of circles that will contain the data points (scatter plot)
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("g")
        .classed("element-group", true);
    
    // Create a circle that will correspond to each data point
    circlesGroup.append("circle")
        .attr("cx", d => xPovertyScale(d.poverty))
        .attr("cy", d => yObesityScale(d.obesity))
        .attr("fill", "green")
        .attr("r", "10")
        .attr("opacity", "0.5")
        .classed("circle", true);

    // At the same level (not nested), create text that will correspond to the abbreviations of the state names
    circlesGroup.append("text")
        .style("text-anchor", "middle")

        // coordinates of the text match those of the circles
        .attr("x", d => xPovertyScale(d.poverty)) 
        .attr("y", d => yObesityScale(d.obesity))

        // "dy" is offset on the y-axis
        .attr("dy", ".3em")

        // the text comes from the abbr column of the csv file
        .text(function(d){
            return d.abbr
        })
        .classed("circle-text", true);    

    // Create tooltips
    var toolTips = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d){
            return(`<strong>${d.state}</strong><br><br>Obesity (%): ${d.obesity} <br> Poverty (%): ${d.poverty}`);
        });
    
    chartGroup.call(toolTips);

    // Create event listeners so that when a point is clicked, the tooltip is shown
    circlesGroup.on("mouseover", function(data){
        toolTips.show(data, this);
    })
        .on("mouseout", function(data){
            toolTips.hide(data);
        });

    // Create axis labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margins.left + 25))
        .attr("x", 0 - (height - 60))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Proportion of Obese People in the Population (%)");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 3}, ${height + margins.top})`)
        .attr("class", "axisText")
        .text("Proportion of People in Poverty (%)");    

    // Create labels inside the circles
    // circlesGroup.append("text")
    //     .attr("dx", 12)
    //     .classed("circle-text", true)
    //     .text(function(d){
    //         return d.abbr
    //     })
});