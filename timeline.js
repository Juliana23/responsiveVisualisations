function D3_Timeline(){}

/** 
 * Fonction show : appelle la fonction load en lui passant le tsv
 *
 * @param data : les donnees
 */
D3_Timeline.prototype.show = function(data) {
	// data is file path
	if(typeof data === "string"){
		d3.tsv(data, function(error, dataTsv) {
			if (error) alert(error);
			D3_Timeline.load(dataTsv);
		});
	}
	// data is tsv
	else {
		D3_Timeline.load(data);
	}
}


/** 
 * Fonction load : ajoute les balises svg au conteneur pour afficher la vue
 *
 * @param tsv : fichier tsv 
 */
D3_Timeline.load = function(data) {
	//On cree un nouveau noeud <svg>
	//On configure le svg qui contiendra toute la figure
	var svg = d3.select("body").append("svg").attr("id", "graph");

	var margin = 60, width = parseInt(d3.select("#graph").style("width"))
	- margin * 2, height = parseInt(d3.select("#graph").style(
	"height"))
	- margin * 2;
	var margin = 60;
	var myChart = chart().height(parseInt(d3.select("#graph").style("height")) - margin * 2)
	.width(parseInt(d3.select("#graph").style("width")) - margin * 2);

	/*var width = myChart.width;
	var height = myChart.height;
	console.log(width);*/

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x = d3.time.scale().range([ 0, width ]);

	var y = d3.scale.linear().range([ height, 0 ]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom");

	var yAxis = d3.svg.axis().scale(y).orient("left");

	var line = d3.svg.line().x(function(d) {
		return x(d.date);
	}).y(function(d) {
		return y(d.close);
	});

	var graph = d3.select("#graph").attr("width", width + margin * 2).attr(
			"height", height + margin * 2).append("g").attr("transform",
					"translate(" + margin + "," + margin + ")");

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

	graph.append("g").attr("class", "x axis").attr("transform",
			"translate(0," + height + ")").call(xAxis);

	graph.append("g").attr("class", "y axis").call(yAxis)
	.append("text").attr("transform", "rotate(-90)").attr("y",
			6).attr("dy", ".71em").style("text-anchor", "end")
			.text("Points marqués");

	dataPerPixel = data.length / width;
	dataResampled = data.filter(function(d, i) {
		return i % Math.ceil(dataPerPixel) == 0;
	});

	graph.append("path").datum(dataResampled).attr("class", "line")
	.attr("d", line);

	var firstRecord = data[data.length - 1], lastRecord = data[0];

	var first = graph.append("g").attr("class", "first").style(
			"display", "none");

	first.append("text").attr("x", -8).attr("y", 4).attr("text-anchor",
	"end").text(firstRecord.close);
	first.append("circle").attr("r", 4);

	var last = graph.append("g").attr("class", "last").style("display",
	"none");

	last.append("text").attr("x", 8).attr("y", 4).text(lastRecord.close);
	last.append("circle").attr("r", 4);

	function resize() {

		var width = parseInt(d3.select("#graph").style("width"))
		- margin * 2, height = parseInt(d3.select("#graph")
				.style("height"))
				- margin * 2;

		x.range([ 0, width ]);
		y.range([ height, 0 ]);

		if (width < 300 && height < 80) {
			graph.select('.x.axis').style("display", "none");
			graph.select('.y.axis').style("display", "none");

			graph.select(".first").attr(
					"transform",
					"translate(" + x(firstRecord.date) + ","
					+ y(firstRecord.close) + ")").style(
							"display", "initial");

			graph.select(".last").attr(
					"transform",
					"translate(" + x(lastRecord.date) + ","
					+ y(lastRecord.close) + ")").style(
							"display", "initial");
		} else {
			graph.select('.x.axis').style("display", "initial");
			graph.select('.y.axis').style("display", "initial");
			graph.select(".last").style("display", "none");
			graph.select(".first").style("display", "none");
		}

		yAxis.ticks(Math.max(height / 50, 2));
		xAxis.ticks(Math.max(width / 100, 2));

		graph.attr("width", width + margin * 2).attr("height",
				height + margin * 2)

				graph.select('.x.axis').attr("transform",
						"translate(0," + height + ")").call(xAxis);

		graph.select('.y.axis').call(yAxis);

		dataPerPixel = data.length / width;
		dataResampled = data.filter(function(d, i) {
			return i % Math.ceil(dataPerPixel) == 0;
		});

		graph.selectAll('.line').datum(dataResampled).attr("d", line);
	}

	d3.select(window).on('resize', resize);
	resize();
}