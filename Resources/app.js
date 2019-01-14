// Define the SVG object that will contain the chart in the HTML
var svgHeight = 960;
var svgWidth = 500;

var margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40
};

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

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
});