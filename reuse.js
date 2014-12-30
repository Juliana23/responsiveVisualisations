/*function chart() {
	var width = 720, // default width
	height = 80; // default height

	function my() {
		// generate chart here, using `width` and `height`
	}

	my.width = function(value) {
		if (!arguments.length) return width;
		width = value;
		return my;
	};

	my.height = function(value) {
		if (!arguments.length) return height;
		height = value;
		return my;
	};

	return my;
}*/

function chart(options) {
	options = options || {};
	
	//On cree un nouveau noeud <svg>
	var svg = d3.select("body").append("svg").attr("id", "graph");

	var parseDate = d3.time.format("%Y-%m").parse;
	
	var margin = 60, 
	width = parseInt(d3.select("#graph").style("width")) - margin * 2, 
	height = parseInt(d3.select("#graph").style("height")) - margin * 2;

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
	
	function my() {
		var graph = d3.select("#graph")
		.attr("width", width + margin * 2)
		.attr("height", height + margin * 2)
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

		dataPerPixel = data.length / width;
		dataResampled = data.filter(function(d, i) {
			return i % Math.ceil(dataPerPixel) == 0;
		});

		graph.append("path")
		.datum(dataResampled)
		.attr("class", "line")
		.attr("d", line);
		
		function resize() {
			var width = parseInt(d3.select("#graph").style("width")) - margin * 2, 
				height = parseInt(d3.select("#graph").style("height")) - margin * 2;

			x.range([ 0, width ]);
			y.range([ height, 0 ]);
	
			graph.select('.x.axis').style("display", "initial");
			graph.select('.y.axis').style("display", "initial");
			graph.select(".last").style("display", "none");
			graph.select(".first").style("display", "none");

			yAxis.ticks(Math.max(height / 50, 2));
			xAxis.ticks(Math.max(width / 100, 2));

			graph.attr("width", width + margin * 2)
					.attr("height",height + margin * 2)

			graph.select('.x.axis')
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

			graph.select('.y.axis')
					.call(yAxis);

			dataPerPixel = data.length / width;
			dataResampled = data.filter(function(d, i) {
				return i % Math.ceil(dataPerPixel) == 0;
			});

			graph.selectAll('.line').datum(dataResampled).attr("d", line);
		}

		d3.select(window).on('resize', resize);
	}

	my.width = function(newWidth) {
		if (!arguments.length) {
			return width;
		}
		width = newWidth;
		x.range([0, width]);
		svg.attr("width", width);
		return my;
	};

	my.height = function(newHeight) {
		if (!arguments.length) {
			return height;
		}
		height = newHeight;
		y.range([height, 0]);
		svg.attr("height", height);
		return my;
	};
	
	//my.width(options.width || 600);
	//my.height(options.height || 80);

	return my;

};

var data = d3.tsv("./dataFemaleUs.tsv", function(error, data) {
				if (error) alert(error);
				var options = {
						data: data
				}
				var my = chart(options);
				my.width(100);
				my.height(100);
				my();
				console.log(my.width() + " " + my.height());
				
			});