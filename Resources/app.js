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

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Define a function that updates the x-axis scale upon choosing an x-axis label
function xScale(data, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenXAxis]))
        .range([0, width]);
    
    return xLinearScale;
};

// Define a function that updates the x-axis upon clicking the x-axis label
function renderXAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000) // it takes 1 sec to change the scatter plot
        .call(bottomAxis);

    return xAxis;
};

// Define a function that updates the y-axis scale after selecting a y-axis label
function yScale(data, chosenYAxis){
    var yLinearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenYAxis]))
        .range([height, 0]);
    
    return yLinearScale;
};

// Define a function that updates the y-axis upon clicking the y-axis label
function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000) // it takes 1 sec to change the scatter plot
        .call(leftAxis);

    return yAxis;
};

// Define a function that updates the circles based on the x-axis and y-axis labels chosen
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){
    
    circlesGroup.transition()
        .duration(1000) // it takes 1 sec to move the circles around
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
};

// Define a function that updates the tooltips
function updateToolTips(chosenXAxis, chosenYAxis, circlesGroup){

    if (chosenXAxis === "poverty"){
        var xlabel = "Poverty (%):"
    } else if (chosenXAxis === "age"){
        var xlabel = "Median Age (yrs):"
    } else if (chosenXAxis === "income"){
        var xlabel = "Median Household Income (USD):"
    }

    if (chosenYAxis === "obesity"){
        var ylabel = "Obesity (%):"
    } else if (chosenYAxis === "smokes"){
        var ylabel = "Smokers (%):"
    } else if (chosenYAxis === "noHealthInsurance"){
        var ylabel = "Without Health Insurance (%):"
    }

    var toolTips = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d){
            return(`<strong>${d.state}</strong><br><br>${xlabel} ${d[chosenXAxis]} <br> ${ylabel} ${d[chosenYAxis]}`);
        });
    
    circlesGroup.call(toolTips);

    // Create event listeners so that when a point is clicked, the tooltip is shown
    circlesGroup.on("mouseover", function(data){
        toolTips.show(data, this);
    })
        .on("mouseout", function(data){
            toolTips.hide(data);
        });
};

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

    // Configure the x-axis
    var xLinearScale = xScale(data, chosenXAxis);

    // Configure the y-axis
    var yLinearScale = yScale(data, chosenYAxis);
    
    // Create new functions for the axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

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
                                 .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                 .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                 .attr("fill", "green")
                                 .attr("r", "10")
                                 .attr("opacity", "0.75");

    // Create event listeners so that when a point is clicked, the tooltip is shown
    var circlesGroup = updateToolTips(chosenXAxis, chosenYAxis, circlesGroup);

    // Create group of y-axis labels
    var yLabels = chartGroup.append("g")
                            .attr("transform", "rotate(-90)");

    var obesityLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 25))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .attr("yValue", "obesity") // value for event listener
        .classed("active", true)
        .text("Proportion of Obese People (%)");

    var noInsuranceLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 45))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .attr("yValue", "noHealthInsurance") // value for event listener
        .classed("inactive", true)
        .text("Proportion of People Without Insurance (%)");

    var smokingLabel = yLabels.append("text")
        .attr("y", 0 - (margins.left + 65))
        .attr("x", 0 - (height - 20))
        .attr("dy", "1em")
        .attr("yValue", "smokes") // value for event listener
        .classed("inactive", true)
        .text("Proportion of Smokers (%)");

    // Create group of x-axis labels
    var xLabels = chartGroup.append("g")
        .attr("transform", `translate(${width / 3}, ${height + margins.top})`);

    var povertyLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("xValue", "poverty") // value for event listener
        .classed("active", true)
        .text("Proportion of People in Poverty (%)");
        
    var ageLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("xValue", "age") // value for event listener
        .classed("inactive", true)
        .text("Median Age (years)");    

    var incomeLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("xValue", "income") // value for event listener
        .classed("inactive", true)
        .text("Median Household Income (USD)");    

    // Event listeners
    // (1) Activate x-axis event listener
    xLabels.selectAll("text") 
        .on("click", function(){
            // Get the value of the selected x-axis
            var xValue = d3.select(this).attr("xValue");

            if (xValue !== chosenXAxis){ // initial chosenXAxis is "poverty"
                chosenXAxis = xValue;
                console.log(chosenXAxis);

                // Change the font style of the selected x-axis label
                if (chosenXAxis === "poverty"){
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "income"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // Update the scale of the x-axis based on the chosen x-axis label
                xLinearScale = xScale(data, chosenXAxis);

                // Update x-axis with transition
                xAxis = renderXAxis(xLinearScale, chosenXAxis);

                // Update the circles with new values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // Update tooltip
                circlesGroup = updateToolTips(chosenXAxis, chosenYAxis, circlesGroup);
                
            }
        })

    // (2) Activate y-axis event listener
    yLabels.selectAll("text")
        .on("click", function(){
            // Get the value of the selected x-axis
            var yValue = d3.select(this).attr("yValue");

            if (yValue !== chosenYAxis){
                chosenYAxis = yValue;
                console.log(chosenYAxis);
            }
        })
});