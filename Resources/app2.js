var svgWidth = 1000;
var svgHeight = 500;

var margins = {
  top: 40,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

// Add the SVG object in the HTML
var svg = d3
  .select("#svg-spot")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`);

// Initial chosen axis labels
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon clicking the x-axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale upon clicking the y-axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;  
}

// function used for updating xAxis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;  
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, circleTexts, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  console.log(circlesGroup);
  circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
    
  circleTexts.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Median Age (yrs):";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Median Household Income (USD):"
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity (%):";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers (%):";
  }
  else if (chosenYAxis === "noHealthInsurance") {
    var ylabel = "No health insurance (%):"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Resources/data.csv", function(err, data) {
  if (err) throw err;
  console.log(data)

  // convert numeric data from string to float
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.noHealthInsurance = +d.noHealthInsurance;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  console.log(chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);
  console.log(chosenYAxis);

  // // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain(d3.extent(data, d => d.obesity))
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Create a group of circles that will contain the data points (scatter plot)
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("g")
    .classed("element-group", true)

  // Create a circle that will correspond to each data point
  circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "green")
    .attr("opacity", ".5");

  // At the same level (not nested), create text that will correspond to the abbreviations of the state names
  var circleTexts = circlesGroup.append("text")
    .style("text-anchor", "middle")

    // coordinates of the text match those of the circles
    .attr("x", d => xLinearScale(d[chosenXAxis])) 
    .attr("y", d => yLinearScale(d[chosenYAxis]))

    // "dy" is offset on the y-axis
    .attr("dy", ".3em")

    // the text comes from the abbr column of the csv file
    .text(function(d){
        return d.abbr
    })
    .classed("circle-text", true); 

  // Create group for x-axis labels
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

  // Create group for y-axis labels
  var yLabels = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var obesityLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 50)
    .attr("x", 0 - (height - 150))
    .attr("dy", "1em")
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 30)
    .attr("x", 0 - (height - 150))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokers (%)");

  var insuranceLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 10)
    .attr("x", 0 - (height -100))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Without Health Insurance (%)");
  
  // // append y axis
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", 0 - margins.left)
  //   .attr("x", 0 - (height / 2))
  //   .attr("dy", "1em")
  //   .classed("axis-text", true)
  //   .text("Obesity");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Create x-axis label event listener
  xLabels.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xValue = d3.select(this).attr("xValue");
      if (xValue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xValue;

        console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup,circleTexts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          ageLabel
              .classed("active", false)
              .classed("inactive", true);
          incomeLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          ageLabel
              .classed("active", true)
              .classed("inactive", false);
          incomeLabel
              .classed("active", false)
              .classed("inactive", true);
      } 
      else if (chosenXAxis === "income"){
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
