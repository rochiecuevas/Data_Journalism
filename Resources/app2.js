var svgWidth = 750;
var svgHeight = 500;

var margins = {
  top: 40,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

// Add the SVG object in the HTML for the scatter plot
var svg = d3
  .select("#svg-scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var scatterGroup = svg.append("g")
  .attr("id", "scatterplot")
  .attr("transform", `translate(${margins.left}, ${margins.top})`);

// Initial chosen axis labels
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Create a function for updating the x-axis scale var upon clicking the x-axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// Create a function for updating the y-axis scale upon clicking the y-axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;  
}

// Create a function for updating xAxis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Create a function for updating yAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;  
}

// Create a function for updating the position of the circles and texts based on chosen x- and y-axes
// With transitions at 1s (1000ms)
function renderCircles(circlesGroup, circleTexts, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  console.log(circlesGroup);

  // Move all circles in the circles group based on the axes selected
  circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
    
  // Move the state abbreviations to the same locations as the circles
  circleTexts.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Create a function for updating circlesGroup with new tooltips, based on selected axis labels
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

  // Convert numeric data from string to float
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.noHealthInsurance = +d.noHealthInsurance;
  });

  // Set the x- and the y-scales
  var xLinearScale = xScale(data, chosenXAxis);
  console.log(chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);
  console.log(chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append an x-axis graphic element
  var xAxis = scatterGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append a y-axis graphic element
  var yAxis = scatterGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Create a group of circles that will contain the data points (scatter plot)
  var circlesGroup = scatterGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("g")
    .classed("element-group", true)

  // Create a circle that will correspond to each data point
  circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "green")
    .attr("opacity", ".5");

  // At the same level (not nested), create text that will correspond to the abbreviations of the state names
  var circleTexts = circlesGroup.append("text")
    .style("text-anchor", "middle")

    // coordinates of the text match those of the circles
    .attr("x", d => xLinearScale(d[chosenXAxis])) 
    .attr("y", d => yLinearScale(d[chosenYAxis]))

    // "dy" is offset on the y-axis (so that the text is in the center of the circle)
    .attr("dy", ".3em")

    // the text comes from the "abbr" column of the csv file
    .text(function(d){
        return d.abbr
    })
    .classed("circle-text", true); 

  // Create group for x-axis labels
  var xLabels = scatterGroup.append("g")
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
  var yLabels = scatterGroup.append("g")
    .attr("transform", "rotate(-90)");

  var obesityLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 50)
    .attr("x", 0 - (height - 150))
    .attr("dy", "1em")
    .attr("yValue", "obesity") // value for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 30)
    .attr("x", 0 - (height - 150))
    .attr("dy", "1em")
    .attr("yValue", "smokes") // value for event listener
    .classed("inactive", true)
    .text("Smokers (%)");

  var insuranceLabel = yLabels.append("text")
    .attr("y", 0 - margins.left + 10)
    .attr("x", 0 - (height -100))
    .attr("dy", "1em")
    .attr("yValue", "noHealthInsurance") // value for event listener
    .classed("inactive", true)
    .text("Without Health Insurance (%)"); 

  // The tooltip of each circle is updated based on the selected x- and y-axis
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Create x-axis label event listener
  xLabels.selectAll("text")
    .on("click", function() {

      // get value of selection
      var xValue = d3.select(this).attr("xValue");
      if (xValue !== chosenXAxis) {

        // original chosenXAxis ("poverty") is replaced by the selected x-axis label ("age" or "income")
        chosenXAxis = xValue;
        console.log(chosenXAxis);

        // Update the x-scale based on the chosen x-axis label
        xLinearScale = xScale(data, chosenXAxis);

        // Update x-axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Update circlesGroup based on the selected x-axis label
        circlesGroup = renderCircles(circlesGroup,circleTexts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update the tooltip per circle based on the selected x- and y-axes
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

  // Create y-axis label event listener
  yLabels.selectAll("text")
    .on("click", function() {

      // get value of selection
      var yValue = d3.select(this).attr("yValue");
      if (yValue !== chosenYAxis) {

        // original chosenYAxis ("obesity") is replaced by the selected y-axis label ("smokes" or "noHealthInsurance")
        chosenYAxis = yValue;
        console.log(chosenYAxis);

        // Update the y-scale based on the chosen y-axis label
        yLinearScale = yScale(data, chosenYAxis);

        // Update the y-axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Update circlesGroup based on the selected y-axis label
        circlesGroup = renderCircles(circlesGroup,circleTexts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update tooltip of each circle based on the chosen x- and y-axis labels
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          insuranceLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          insuranceLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "noHealthInsurance") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          insuranceLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
    });
});

// Descriptions
var descriptions = d3.select("#insights")
  .html("The data visualised here is based on the results of the 2014 American Community Survey (ACS) 1-year estimates.<br><br><b>Obesity Rate</b><br><i>Poverty</i> and <i>obesity</i> appear to be positively correlated. <i>Income</i> is naturally negatively correlated with <i>obesity</i>. <i>Age</i>, on the other hand, is not correlated with <i>obesity</i>.<br><br><b>Proportion of Smokers</b><br><i>Smoking</i> is positively correlated with <i>poverty</i> and negatively correlated with <i>income</i>. There is no obvious trends between <i>age</i> and the proportion of <i>smokers</i>.<br><br><b>People Without Health Insurance</b><br>There appears to be a positive correlation between <i>poverty</i> and <i>insurance coverage</i> and a negative correlation between <i>income</i> and <i>insurance coverage</i>. No trends can be observed between <i>insurance coverage</i> and <i>age</i>.");  


