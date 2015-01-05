function TimeLine(options) {
	options = options || {};
	
	function my() {
		my.init(options);
		
		function resize() {
			var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2, 
				height = parseInt(d3.select("#graph").style("height")) - my.margin() * 2;

			// Modification de la hauteur et de la largeur
			my.resize(height, width);
			
			my.x().range([ 0, my.width() ]);
			my.y().range([ my.height(), 0 ]);
			
			if (my.width() < 300 && my.height() < 80) {
				my.graph().select('.x.axis').style("display", "none");
				my.graph().select('.y.axis').style("display", "none");

				my.graph().select(".first")
						.attr("transform", "translate(" + my.x()(my.firstRecord().date) +
								"," + my.y()(my.firstRecord().close) + ")")
						.style("display", "initial");

				my.graph().select(".last")
						.attr("transform","translate(" + my.x()(my.lastRecord().date) +
								","+ my.y()(my.lastRecord().close) + ")")
						.style("display", "initial");
			} 
			else {
				my.graph().select('.x.axis').style("display", "initial");
				my.graph().select('.y.axis').style("display", "initial");
				my.graph().select(".last").style("display", "none");
				my.graph().select(".first").style("display", "none");
			}

			my.yAxis().ticks(Math.max(my.height() / 50, 2));
			my.xAxis().ticks(Math.max(my.width() / 100, 2));
			
			my.graph().select('.x.axis')
					.attr("transform", "translate(0," + my.height() + ")")
					.call(my.xAxis());

			my.graph().select('.y.axis')
					.call(my.yAxis());

			var dataPerPixel = my.data().length / my.width();
			var dataResampled = my.data().filter(function(d, i) {
				return i % Math.ceil(dataPerPixel) == 0;
			});

			my.graph().selectAll('.line').datum(dataResampled).attr("d", my.line());
		}

		d3.select(window).on('resize', resize);
	}
	
	my.init = function(options){

		//On cree un nouveau noeud <svg>
		var svg = d3.select("body").append("svg").attr("id", "graph");

		var parseDate = d3.time.format("%Y-%m").parse;
		
		var margin = options.margin || 60;
		var width = options.width || parseInt(d3.select("#graph").style("width")) - margin * 2; 
		var height = options.height || parseInt(d3.select("#graph").style("height")) - margin * 2;
		
		var data = options.data || [];

		var x = d3.time.scale()
		.range([ 0, width ])
		.nice(d3.time.year);

		var y = d3.scale.linear()
		.range([ height, 0 ])
		.nice();

		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var yAxis = d3.svg.axis().scale(y).orient("left");

		var line = d3.svg.line()
		.x(function(d) {
			return x(d.date);
		})
		.y(function(d) {
			return y(d.close);
		});
		
		var graph = d3.select("#graph")
		.append("g")
		.attr("transform", "translate(" + margin + "," + margin + ")");

		data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.close = +d.close;
		});

		x.domain(d3.extent(data, function(d) {
			return d.date;
		}));

		y.domain([ 0, d3.max(data, function(d) {
			return d.close;
		}) ]);

		graph.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		graph.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end");

		var dataPerPixel = data.length / width;
		var dataResampled = data.filter(function(d, i) {
			return i % Math.ceil(dataPerPixel) == 0;
		});

		graph.append("path")
		.datum(dataResampled)
		.attr("class", "line")
		.attr("d", line);
		
		var firstRecord = data[data.length - 1];
		var lastRecord = data[0];

		var first = graph.append("g")
							.attr("class", "first")
							.style("display", "none");

		first.append("text")
				.attr("x", -8)
				.attr("y", 4)
				.attr("text-anchor", "end")
				.text(firstRecord.close);
		first.append("circle").attr("r", 4);

		var last = graph.append("g")
							.attr("class", "last")
							.style("display", "none");

		last.append("text")
				.attr("x", 8)
				.attr("y", 4)
				.text(lastRecord.close);
		last.append("circle")
				.attr("r", 4);
		
		
		// Set des differentes composantes parametrables du graphe
		my.svg(svg);
		my.graph(graph);
		my.data(data);
		my.line(line);
		my.x(x);
		my.y(y);
		my.xAxis(xAxis);
		my.yAxis(yAxis);
		my.margin(margin);
		my.firstRecord(firstRecord);
		my.lastRecord(lastRecord);
		my.first(first);
		my.last(last);
		
		my.resize(height, width);
		
		return my;
	}
	
	/*
	 * Getters AND Setters
	 */
	
	my.svg = function(newSvg) {
		if (!arguments.length) {
			return svg;
		}
		svg = newSvg;
		return my;
	}
	
	my.graph = function(newGraph) {
		if (!arguments.length) {
			return graph;
		}
		graph = newGraph;
		return my;
	}
	
	my.data = function(newData) {
		if (!arguments.length) {
			return data;
		}
		data = newData;
		return my;
	}
	
	my.line = function(newLine) {
		if (!arguments.length) {
			return line;
		}
		line = newLine;
		return my;
	}

	my.width = function(newWidth) {
		if (!arguments.length) {
			return width;
		}
		width = newWidth;
		return my;
	};

	my.height = function(newHeight) {
		if (!arguments.length) {
			return height;
		}
		height = newHeight;
		return my;
	};
	
	my.x = function(newX) {
		if (!arguments.length) {
			return x;
		}
		x = newX;
		return my;
	}
	
	my.y = function(newY) {
		if (!arguments.length) {
			return y;
		}
		y = newY;
		return my;
	}
	
	my.xAxis = function(newXAxis) {
		if (!arguments.length) {
			return xAxis;
		}
		xAxis = newXAxis;
		return my;
	}
	
	my.yAxis = function(newYAxis) {
		if (!arguments.length) {
			return yAxis;
		}
		yAxis = newYAxis;
		return my;
	}
	
	my.margin = function(newMargin) {
		if (!arguments.length) {
			return margin;
		}
		margin = newMargin;
		return my;
	}
	
	my.lastRecord = function(newLastRecord) {
		if (!arguments.length) {
			return lastRecord;
		}
		lastRecord = newLastRecord;
		return my;
	}
	
	my.firstRecord = function(newFirstRecord) {
		if (!arguments.length) {
			return firstRecord;
		}
		firstRecord = newFirstRecord;
		return my;
	}
	
	my.last = function(newLast) {
		if (!arguments.length) {
			return margin;
		}
		last = newLast;
		return my;
	}
	
	my.first = function(newFirst) {
		if (!arguments.length) {
			return first;
		}
		first = newFirst;
		return my;
	}
	
	/*
	 * Methods
	 */
	
	my.resize = function(height, width){
		if (arguments.length) {
			my.height(height);
			my.width(width);
		}
		my.x().range([0, my.width()]);
		my.svg().attr("width", my.width());
		my.y().range([my.height(), 0]);
		my.svg().attr("height", my.height());
		return my;
	}
	return my;

};

var data = d3.tsv("./data/dataFemaleUs.tsv", function(error, data) {
				if (error) alert(error);
				var options = {
						height: 300,
						width: 500,
						margin: 60,
						data: data
				}
				var my = TimeLine(options);
				my();
				console.log(my.width() + " " + my.height());
			});