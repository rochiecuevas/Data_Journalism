// Define the SVG object that will contain the chart in the HTML
var svgHeight = 500;
var svgWidth = 1000;

var margins = {
    top: 40,
    right: 40,
    bottom: 100,
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
    data.forEach(function(d){
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.noHealthInsurance = +d.noHealthInsurance;
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

    // Create circles that will correspond to the data points (scatter plot)
    var circlesGroup = chartGroup.selectAll("circle")
                                 .data(data)
                                 .enter()
                                 .append("circle")
                                 .attr("cx", d => xPovertyScale(d.poverty))
                                 .attr("cy", d => yObesityScale(d.obesity))
                                 .attr("fill", "green")
                                 .attr("r", "10")
                                 .attr("opacity", "0.75");
                    

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

    // Create group of y-axis labels
    var yLabels = chartGroup.append("g")
                            .attr("transform", "rotate(-90)");

    var obesityLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 25))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .classed("active", true)
        .text("Proportion of Obese People (%)");

    var noInsuranceLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 45))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Proportion of People Without Insurance (%)");

    var smokingLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 65))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Proportion of Smokers (%)");

    // Create group of x-axis labels
    var xLabels = chartGroup.append("g")
        .attr("transform", `translate(${width / 3}, ${height + margins.top})`);

    var povertyLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("value", "poverty") // value for event listener
        .classed("active", true)
        .text("Proportion of People in Poverty (%)");
        
    var ageLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "age") // value for event listener
        .classed("inactive", true)
        .text("Median Age (years)");    

    var incomeLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "income") // value for event listener
        .classed("inactive", true)
        .text("Median Household Income (USD)");    
});