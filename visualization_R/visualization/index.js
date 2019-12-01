var forecast_click = true
svg_width = 600
svg_height = 500
margin = {top: 30, right: 20, bottom: 20, left: 30}
width = svg_width - margin.right - margin.left
height = svg_height - margin.top - margin.bottom

json_file = 'result.json'
default_condition = 'Atrial Fibrillation'
default_state = 'AK'
data_array = []
var filtered_array = []


state_abbreviations = {"alabama": "AL", "alaska":"AK", "arizona":"AZ", "arkansas": "AR", "california":"CA",
"colorado":"CO", "connecticut":"CT", "delaware":"DE", "florida":"FL", "georgia":"GA", "hawaii":"HI", "idado":"ID",
"illinois":"IL", "indiana":"IN", "iowa":"IA","kansas":"KS", "kentucky":"KY", "louisiana":"LA", "maine":"ME",
"maryland":"MD", "massachusetts":"MA", "michigan": "MI", "minnesota":"MN", "mississippi": "MS", "missouri": "MO",
"montana":"MT", "nebraska":"NE", "nevada":"NV", "new hampshire": "NH", "new jersey":"NJ", "new mexico":"NM",
"new york":"NY", "north carolina":"NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon":"OR",
"pennsylvania":"PA", "rhode island":"RI", "south carolina":"SC", "south dakota":"SD", "tennessee":"TN",
"texas":"TX", "utah":"UT", "vermont":"VT", "virginia":"VA", "washington":"WA", "west viriginia":"WV", "wisconsin":"WI",
"wyoming":"WY"}

var svg = d3.select("#graph")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr("transform", "translate(" + margin.left + "," + margin.top  + ")")

var parseTime = d3.timeParse("%Y");
var bisectDate = d3.bisector(function(d) { return d.year; }).left;

var x = d3.scaleTime().range([margin.left + margin.right, width - margin.left - margin.right]);
var y = d3.scaleLinear().range([height - margin.bottom * 2, margin.top * 2]);

var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft(y).ticks(5).tickFormat(function(d) {return d; }).scale(y)

var ci_area = d3.area()
  .x(function(d) {return x(d.year) })
  .y0(function(d) { return y(d.CI_right) })
  .y1(function(d) {return y(d.CI_left) });

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function make_x_gridlines(num_ticks) {
    return d3.axisBottom(x)
        .ticks(num_ticks)
}

// gridlines in y axis function
function make_y_gridlines(num_ticks) {
    return d3.axisLeft(y)
        .ticks(num_ticks)
}

function load_data(data) {
   data.forEach(function(d) {
      d.year = parseTime(d.year);
      d.value = parseFloat(d.value) / 1000.0;

      d.CI_left = parseFloat(d.CI_left) / 1000.0;
      d.CI_right = parseFloat(d.CI_right) / 1000.0;
      data_array.push(d)
    });
}

create_line = function() {
  var d3_line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });
  return d3_line
}

d3.json("result.json", function(error, data) {
    if (error) throw error;

    load_data(data)
    filtered_array = data_array.filter(function(d) {
      return d.State == default_state && d.Condition == default_condition && d.year.getFullYear() != 2018
    })

    x.domain(d3.extent(filtered_array, function(d) { return d.year; }));
    y.domain([d3.min(data_array, function(d) { return d.value; }), d3.max(data_array, function(d) { return d.value; })]);
    cost_line = create_line()


    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(-40," + (height - 50) + ")")
        .call(xAxis);


    g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(10, -10)")
        .call(yAxis)
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -140)
        .attr("y", -40)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Cost In Thousands of Dollars");

    svg.append("path")
        .datum(filtered_array)
        .attr("fill", "#cce5df")
        .attr("stroke", "None")
        .attr("class", "CI")
        .attr("d", ci_area);

    svg.append("path")
        .datum(filtered_array)
        .attr("class", "line")
        .attr("d", cost_line);

    d3.select("#graph_title").remove();
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .attr("id", "graph_title")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Medical Pricing For " + document.getElementById('condition').value +
              " in " + document.getElementById('state_name').value);

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    // svg.append("rect")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .attr("class", "overlay")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .on("mouseover", function() { focus.style("display", null); })
    //     .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);

    // svg.append("g")
    //     .attr("class", "grid")
    //     .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom)+ ")")
    //     .call(make_x_gridlines(filtered_array.length)
    //         .tickSize(-height)
    //         .tickFormat("")
    //     )

    // svg.append("g")
    //     .attr("class", "grid")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top+ ")")
    //     .call(make_y_gridlines(6)
    //         .tickSize(-width + margin.right + margin.left)
    //         .tickFormat("")
    //     )

    // function mousemove() {
    //   var x0 = x.invert(d3.mouse(this)[0])
    //   i = bisectDate(data_array, x0, 1)
    //       d0 = data_array[i - 1],
    //       d1 = data_array[i]

    //       d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    //   focus.attr("transform", "translate(" + x(d.year) + "," + 0 + ")");
    //   focus.select("circle").attr("transform", "translate(" + 0 + "," + y(d.value) + ")")
    //   focus.select("text").text(function() { return "$" + d.value; })
    //        .attr("transform", "translate(" + 0 + "," + y(d.value) + ")");
    //   focus.select(".x-hover-line").attr("y2", height).attr("y1", 0);
    //   focus.select(".y-hover-line").attr("x2", width + width);
    // }
});


merge_data = function(us_data, topo_data) {
  var topo_length = topo_data.length
  var us_length = us_data.length

  for(var topo_idx = 0; topo_idx < topo_length; topo_idx ++) {
    var topo_state_name = topo_data[topo_idx].properties.name.toLowerCase()
    var abbreviation = state_abbreviations[topo_state_name]
    var matched_price = -1

    for(var idx = 0; idx < us_length; idx ++) {
      var state_name = us_data[idx].State
      var prediction_price = us_data[idx].value
      if(abbreviation == state_name) {
        matched_price = prediction_price
        break;
      }
    }
    topo_data[topo_idx].properties.price = matched_price
  }
}

function draw_us_map() {

  var us_data = data_array.filter(function(d) {
    return d.Condition == default_condition && d.year.getFullYear() == 2018
  })

  d3.json("states-10m.json", function(error, data) {
    if (error) throw error;

    var svg = d3.select("#us_map")
      .append('svg')
      .attr("id", "pred_map")
      .attr("width", svg_width)
      .attr("height", svg_height)
      .attr("transform", "translate(60, 60)")

    var map_projection = d3.geoAlbersUsa()
              .translate([svg_width / 2.5 + 50, svg_height / 2.5])
                        .scale([800]);
    var path = d3.geoPath()
          .projection(map_projection)

    var topo_json_features = topojson.feature(data, data.objects.states).features
    merge_data(us_data, topo_json_features)

    var min_price = d3.min(topo_json_features, function(d) {
      return d.properties.price
    })

    var max_price = d3.max(topo_json_features, function(d) {
      return d.properties.price
    })

    var color_scale = d3.scaleQuantize()
            .domain([Math.round(min_price), Math.round(max_price)])
            .range(['#feedde','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#8c2d04'])
            // .range(["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c",
              // "#fc4e2a", "#e31a1c", "#bd0026", "#800026"])

    var map_tip = d3.tip()
      .attr('class', 'map_tip')
      .offset([4, 0])
      .html(function(d) {
        if(d.properties.price == -1) {
          return "State: " + d.properties.name + "<br>"
            + "Price: NA"
        }
        return "State: " + d.properties.name + "<br>"
            + "Price: $" +  Math.round(d.properties.price * 1000)
    })

    svg.call(map_tip)

    svg.selectAll("path")
       .data(topo_json_features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("fill", function(d) {
          if(d.properties.price == -1) {
            return "gray";
          }
          return color_scale(d.properties.price)
       })
       .on('mouseover', map_tip.show)
       .on('mouseout', map_tip.hide)
       .on('click', function(d) {
          var state_name = d.properties.name.toLowerCase()
          var state_abb = state_abbreviations[state_name]
          default_state = state_abb
          forecast_click = true
          map_tip.hide()

          document.getElementById('update_button').innerHTML = 'Hide Forecast'
          document.getElementById('update_button').style.color = "white"
          document.getElementById('update_button').style['background-color'] = "purple"
          document.getElementById('state_name').value = d.properties.name
          d3.select("#pred_map").remove()
          showForecast()
       })

    svg.append("path")
      .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state_borders")
      .attr("d", path);

    svg.append("text")
        .attr("x", (width / 1.75))
        .attr("y", margin.top - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Predicted Price For " + document.getElementById('condition').value + " in USA");

  })
}

function showForecast() {
  if (forecast_click == false) {
    var new_entry = state_abbreviations[document.getElementById('state_name').value.toLowerCase()]
    var new_condition = document.getElementById('condition').value
    if (new_entry != default_state || new_condition != default_condition) {
      d3.select("#pred_map").remove()
      forecast_click = true
    }
  }

  if (forecast_click){
    document.getElementById('update_button').innerHTML = 'Hide Forecast'
    document.getElementById('update_button').style.color = "white"
    document.getElementById('update_button').style['background-color'] = "purple"

    default_condition = document.getElementById('condition').value
    default_state = state_abbreviations[document.getElementById('state_name').value.toLowerCase()]

    filtered_array = data_array.filter(function(d) {
      return d.State == default_state && d.Condition == default_condition
    })

    draw_us_map()
    forecast_click = false
  }
  else {
    document.getElementById('update_button').innerHTML = 'Show Forecast'
    document.getElementById('update_button').style.color = "black"
    document.getElementById('update_button').style['background-color'] = "white"

    filtered_array = data_array.filter(function(d) {
      return d.State == default_state && d.Condition == default_condition && d.year.getFullYear() != 2018
    })

    d3.select("#pred_map").remove()
    forecast_click = true
  }

  // Scale the range of the data again
  new_x = d3.extent(filtered_array, function(d) { return d.year; })
  new_y = [d3.min(data_array, function(d) { return d.value; }), d3.max(data_array, function(d) { return d.value; })];

  // solution will be appending a new item consisting of year and cost from the predicted model
  // then the domains of the axes will be scaled on the new data that includes this value
  x.domain(new_x);
  y.domain(new_y);

  svg.select(".x") // change the x axis
  .transition()
  .duration(500)
  .call(xAxis);

  svg.select(".y") // change the y axis
            .transition()
            .duration(500)
            .call(yAxis);

  svg.select(".grid")
            .transition()
            .duration(500)
            .call(make_y_gridlines(0)
                  .tickSize(-width + margin.right + margin.left)
                  .tickFormat(""))
            .call(make_x_gridlines(6)
                  .tickSize(-height)
                  .tickFormat(""))

  svg.select(".line")   // change the line
            .datum(filtered_array)
            .transition()
            .duration(500)
            .attr("d", create_line())

  svg.select(".CI")   // add the CI
            .datum(filtered_array)
            .attr("fill", "grey")
            .transition()
            .duration(500)
            .attr("d", ci_area)

  d3.select("#graph_title").remove();
  svg.append("text")
        .attr("x", (width / 2))
        .attr("y", margin.top)
        .attr("id", "graph_title")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Medical Pricing For " + document.getElementById('condition').value +
              " in " + document.getElementById('state_name').value);

}
