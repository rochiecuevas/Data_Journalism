// Define the SVG object that will contain the chart in the HTML
var svgHeight = 960;
var svgWidth = 500;

var margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40
};

console.log(margins);

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

console.log(`Width: ${width}; Height: ${height}`);

// Add the SVG object in the HTML
var svg = d3.select(".svg-spot")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Add the chart to the SVG object
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margins.left}, ${margins.top})`);

// Prepare the dynamic charts

// 1. Default chosen x-axis
var chosenXAxis = "poverty";

// 2. Define a function that updates the x-axis upon clicking a label
function xScale(data, chosenXAxis){

    // create scales
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(d => d[chosenXAxis]), d3.max(d => d[chosenXAxis])])
                         .range([0, width]);

    return xLinearScale;
};

// 3. Define a function that updates the x-axis when an x-axis label is chosen
function renderAxis(newXAxis, xAxis){
    var bottomAxis = d3.bottomAxis(newXAxis);

    xAxis.transition()
         .duration(1000) // duration of transition is 1 second
         .call(bottomAxis);

    return xAxis;     
};

// 4. Define a function that updates circles in the chart during transition
function renderCircles(circlesGroup, newXAxis, chosenXAxis){

    circlesGroup.transition()
                .duration(1000) // duration of transition is 1 second
                .attr("cx", d => newXAxis(d[chosenXAxis]));

    return circlesGroup;
};

// 5. Define a function that updates the tooltip to each circle
function updateToolTip(chosenXAxis, circlesGroup){
    if (chosenXAxis === "poverty"){
        var label = "Below Poverty Line (%):"
    } else if (chosenXAxis === "age"){
        var label = "Median Age (yrs):"
    } else if (chosenXAxis === "income"){
        var label = "Median Household Income (USD):"
    };

    var toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([80,-60])
                    .html(function(d){
                        return (`${d.state} <hr> ${label} ${d[chosenXAxis]}`);
                    });
    
    circlesGroup.call(toolTip);

    // Show the tooltip when the mouse is over the circle
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })
    // Tooltip is hidden when the mouse moves away from the circle
                .on("mouseout", function(data){
                    toolTip.hide(data);
                });
    
    return circlesGroup;
};


// 6. Import data
d3.csv("Resources/data.csv", function(error, data){
    if (error) throw error;
    console.log(data);

    // 6a. Convert numerical data from string to float
    data.forEach(function(data){
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.noHealthInsurance = +data.noHealthInsurance;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // 6b. Use the xScale function to update the x-axis depending on the chosen x-axis label
    var xLinearScale = xScale(data, chosenXAxis);

    // 6c. Create a y-scale function
    var yLinearScale = d3.scaleLinear()
                         .domain([d3.min(data, d => d.noHealthInsurance), d3.max(data, d => d.noHealthInsurance)])
                         .range(height, 0);

    // 6d. Set the axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // 6e. Append an x-axis
    var xAxis = chartGroup.append("g")
                          .classed("x-axis", true)
                          .attr("transform", `translate(0, ${height})`)
                          .call(bottomAxis);
                
    // 6f. Append a y-axis
    chartGroup.append("g")
              .call(leftAxis);
    
    // 6g. Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
                                 .data(data)
                                 .enter()
                                 .append("circle")
                                 .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                 .attr("cy", d => yLinearScale(d.noHealthInsurance))
                                 .attr("r", 20)
                                 .attr("fill", "green")
                                 .attr("opacity", 0.75);

    // 6h. Create a group containing three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
                                 .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
                                   .attr("x", 0)
                                   .attr("y", 20)
                                   .attr("value", "poverty")
                                   .classed("active", true)
                                   .text("Below Poverty Level (%)");

    var ageLabel = xlabelsGroup.append("text")
                                   .attr("x", 0)
                                   .attr("y", 20)
                                   .attr("value", "age")
                                   .classed("active", true)
                                   .text("Median Age (yrs)");

    var incomeLabel = xlabelsGroup.append("text")
                                  .attr("x", 0)
                                  .attr("y", 20)
                                  .attr("value", "income")
                                  .classed("active", true)
                                  .text("Median Household Income (USD)");

    // 6i. Append the y-axis
    chartGroup.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margins.left)  
              .attr("x", 0 - (height / 2))
              .attr("dy", "1em")
              .classed("axis-text", true)
              .text("No Health Insurance (%)");
        
    // 6j. Use updateToolTip to update circles
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // 6k. Add an event listener so that something happens when an x-axis label is chosen
    xlabelsGroup.selectAll("text")
                .on("click", function(){

                    // Get the value of the selection (x-axis label)
                    var xSelection = d3.select(this).attr("value");

                    if (value !== chosenXAxis){

                        // Replace chosenXAxis with value (x-axis label)
                        chosenXAxis == xSelection;
                        console.log(chosenXAxis);

                        // Update the x-axis scale for the new x-axis values
                        xLinearScale = xScale(data, chosenXAxis);

                        // Update x-axis with transition
                        xAxis = renderAxis(xLinearScale, xAxis);

                        // Update circles based on new x-axis values
                        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                        // Update tooltips based on chosen x-axis label
                        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                        // Make the selected x-axis bold font
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
                    }

                })
});