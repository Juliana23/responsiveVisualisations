function TimeLine(options) {
	options = options || {};

	function my() {
		my.init(options);

		function resize() {
			var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2,
			height = parseInt(d3.select("#graph").style("height")) - my.margin() * 2;

			// Modification de la hauteur et de la largeur
			my.resize(height, width);

			// Redessine le graphe de maniere reponsive
			my.redraw();
		}

		d3.select(window).on('resize', resize);
	}

	my.init = function (options) {

		//On cree un nouveau noeud <svg>
		my.svg(d3.select("body")
				.append("svg")
				.attr("id", "graph"));
				
		// Initialisation de la taille du graphe
		my.margin(options.margin || 60);
		my.width(options.width || parseInt(d3.select("#graph").style("width")) - my.margin() * 2);
		my.height(options.height || parseInt(d3.select("#graph").style("height")) - my.margin() * 2);

		// Initialisation des donnees
		my.initData(options.data);
		
		// Initialisation de la map
		my.initMap(my.data());

		// Initialisation des axes
		my.initX(my.width(), my.data());
		my.initY(my.height(), my.data());
		my.xAxis(d3.svg.axis().scale(my.x()).orient("bottom"));
		my.yAxis(d3.svg.axis().scale(my.y()).orient("left"));

		// Initialisation de les lignes
		my.initLine();

		// Initialisation du tooltip
		my.initTooltip(my.width());
				
		// Initialisation du graphe
		my.initGraph(my.margin(), my.height(), my.width(), my.xAxis(), my.yAxis(), my.data(), my.line());
		
		// Initialisation de la ligne verticale
		my.initVerticalLine(my.graph(), my.height());
		
		// Initialisation du rectangle
		my.initRect(my.svg(), my.width(), my.height(), my.margin());
		
		/*
		 * On recupere la premiere et derniere
		 * valeur pour les afficher avec un cercle
		 * si la visualisation est trop petite
		 */        
		if(options.firstEndCircle){
			my.updateFirstEndCircle(my.graph(), my.firstRecord(), my.lastRecord());
		}
		
		// On met les evenements sur le graphe a jour
		my.updateMove(my.rect(), "mousemove", "mouseout", true);
		my.updateMove(my.rect(), "touchmove", "touchend", false);

		// Resize du graph
		my.resize(my.height(), my.width());
		
		// Redessine le graphe de maniere reponsive
		my.redraw();
		
		return my;
	};

	/*
	 * Fonctions d'initialisation
	 */

	my.initData = function(pData){
		var data = pData || [];
		var parseDate = d3.time.format("%Y-%m").parse;
		data.forEach(function (d) {
			d.date = parseDate(d.date);
			d.close = +d.close;
		});
		my.data(data);
		my.firstRecord(data[0]);
		my.lastRecord(data[data.length - 1]);
	};
	
	my.initMap = function(data){
		var map = {};
		data.forEach(function (d) {
			map[d.date] = d;
		});
		my.map(map);
	}

	my.initX = function(width, data){
		var x = d3.time.scale()
		.range([0, width])
		.nice(d3.time.year);
		x.domain(d3.extent(data, function (d) {
			return d.date;
		}));
		my.x(x);
	};

	my.initY = function(height, data){
		var y = d3.scale.linear()
		.range([height, 0])
		.nice();
		y.domain([0, d3.max(data, function (d) {
			return d.close;
		})]);
		my.y(y);
	};

	my.initLine = function(){
		var line = d3.svg.line()
		.x(function (d) {return x(d.date);})
		.y(function (d) {return y(d.close);});
		my.line(line);
	};

	my.initTooltip = function(width){
		var tooltip = d3.select("body")
		.append("div")  
		.attr("class", "tooltip")
		.attr("x", width - 300)
		.attr("y", 0)
		.style("opacity", 0);
		my.tooltip(tooltip);
	};

	my.initVerticalLine = function(graph, height){
		var verticalLine = graph.append("line")
		.attr("class", "verticalLine")
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",0)
		.attr("y2",height)
		.style("opacity", 0);
		my.verticalLine(verticalLine);
	}

	my.initGraph = function(margin, height, width, xAxis, yAxis, data, line){
		var graph = d3.select("#graph")
		.append("g");

		if(margin){
			graph.attr("transform", "translate(" + margin + "," + margin + ")");
		}

		/*
		 * On definit la visualisation principale
		 */
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
		var dataResampled = data.filter(function (d, i) {
			return i % Math.ceil(dataPerPixel) === 0;
		});

		graph.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);
		
		my.graph(graph);
	};
	
	my.initRect = function (container, width, height, margin) {
		// On cree un rectangle par dessus la visualisation
		var rect = container.append("rect")
		.attr("width", width + margin)
		.attr("height", height + margin)
		.style("opacity", 0)
		.attr("class", "onMouseMove");
		my.rect(rect);
	};

	/*
	 * Getters AND Setters
	 */

	my.svg = function (newSvg) {
		if (!arguments.length) {
			return svg;
		}
		svg = newSvg;
		return my;
	};

	my.tooltip = function (newTooltip) {
		if (!arguments.length) {
			return tooltip;
		}
		tooltip = newTooltip;
		return my;
	};

	my.verticalLine = function (newVerticalLine) {
		if (!arguments.length) {
			return verticalLine;
		}
		verticalLine = newVerticalLine;
		return my;
	};

	my.graph = function (newGraph) {
		if (!arguments.length) {
			return graph;
		}
		graph = newGraph;
		return my;
	};
	
	my.map = function (newMap) {
		if (!arguments.length) {
			return map;
		}
		map = newMap;
		return my;
	};

	my.data = function (newData) {
		if (!arguments.length) {
			return data;
		}
		data = newData;
		return my;
	};

	my.line = function (newLine) {
		if (!arguments.length) {
			return line;
		}
		line = newLine;
		return my;
	};

	my.width = function (newWidth) {
		if (!arguments.length) {
			return width;
		}
		width = newWidth;
		return my;
	};

	my.height = function (newHeight) {
		if (!arguments.length) {
			return height;
		}
		height = newHeight;
		return my;
	};

	my.x = function (newX) {
		if (!arguments.length) {
			return x;
		}
		x = newX;
		return my;
	};

	my.y = function (newY) {
		if (!arguments.length) {
			return y;
		}
		y = newY;
		return my;
	};

	my.xAxis = function (newXAxis) {
		if (!arguments.length) {
			return xAxis;
		}
		xAxis = newXAxis;
		return my;
	};

	my.yAxis = function (newYAxis) {
		if (!arguments.length) {
			return yAxis;
		}
		yAxis = newYAxis;
		return my;
	};

	my.margin = function (newMargin) {
		if (!arguments.length) {
			return margin;
		}
		margin = newMargin;
		return my;
	};

	my.lastRecord = function (newLastRecord) {
		if (!arguments.length) {
			return lastRecord;
		}
		lastRecord = newLastRecord;
		return my;
	};

	my.firstRecord = function (newFirstRecord) {
		if (!arguments.length) {
			return firstRecord;
		}
		firstRecord = newFirstRecord;
		return my;
	};
	
	my.rect = function (newRect) {
		if (!arguments.length) {
			return rect;
		}
		rect = newRect;
		return my;
	};
	
	my.updateArgsRect = function (width, height, margin) {
		if (!arguments.length) {
			return my.rect();
		}
		my.rect()
		.attr("width", width + margin)
		.attr("height", height + margin);
		
		return my.rect();
	};
	
	my.updateArgsVerticalLine = function (height) {
		if (!arguments.length) {
			return my.verticalLine();
		}
		my.verticalLine()
		.attr("y2",height)
		
		return my.verticalLine();
	};

	/*
	 * Methods
	 */
	 my.resize = function (height, width) {
		if (arguments.length) {
			my.height(height);
			my.width(width);
		}
		
		my.zoomOut();
		
		my.x().range([0, my.width()]);
		my.svg().attr("width", my.width());
		my.y().range([my.height(), 0]);
		my.svg().attr("height", my.height());
		
		my.updateArgsRect(my.width(), my.height(), my.margin());
		my.updateArgsVerticalLine(my.height());
		return my;
	};
	
	my.zoomOut = function() {
		// On enleve le zoom
		my.graph().attr("transform", "translate(" + my.margin() + "," + my.margin() + ")scale(" + 1 + ")");
		my.verticalLine().attr("transform", null);
		my.rect().attr("transform", null);
	}
	
	my.zoomIn = function() {
		// On met le zoom
		my.graph().attr("transform", "translate(" + (my.margin() + 20) + "," + my.margin() + ")scale(" + 2 + ")");
		my.verticalLine().attr("transform", "translate(" + 20 + ")");
		my.rect().attr("transform", "scale(" + 2 + ")");
		my.updateArgsRect(my.width(), my.height(), my.margin());
	}

	my.redraw = function () {
		//my.x().range([0, my.width()]);
		//my.y().range([my.height(), 0]);
		
		my.verticalLine().attr("height", my.height());

		if (my.width() < 300 && my.height() < 80) {
			my.graph().select('.x.axis').style("display", "none");
			my.graph().select('.y.axis').style("display", "none");

			my.graph().select(".first")
			.attr("transform", "translate(" + my.x()(my.firstRecord().date) +
					"," + my.y()(my.firstRecord().close) + ")")
					.style("display", "initial");

			my.graph().select(".last")
			.attr("transform", "translate(" + my.x()(my.lastRecord().date) +
					"," + my.y()(my.lastRecord().close) + ")")
					.style("display", "initial");
		}
		else {
			my.graph().select('.x.axis').style("display", "initial");
			my.graph().select('.y.axis').style("display", "initial");
			my.graph().select(".last").style("display", "none");
			my.graph().select(".first").style("display", "none");
		}
		
		// On redefinit la quantite d'information sur les axes X & Y
		my.yAxis().ticks(Math.max(my.height() / 100, 2));
		my.xAxis().ticks(Math.max(my.width() / 100, 2));
		
		if (my.width() < my.height()) {
			my.resize(my.height() / 2, my.width() / 2);
			my.zoomIn();
		}
		my.graph().select('.x.axis')
		.attr("transform", "translate(0," + my.height() + ")")
		.call(my.xAxis());

		my.graph().select('.y.axis')
		.call(my.yAxis());

		var dataPerPixel = my.data().length / my.width();
		var dataResampled = my.data().filter(function (d, i) {
			return i % Math.ceil(dataPerPixel) === 0;
		});

		my.graph().selectAll('.line').datum(dataResampled).attr("d", my.line());
	};

	my.updateFirstEndCircle = function(graph, firstRecord, lastRecord){
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
	};
	
	my.updateMove = function(container, event, eventEnd, onDesktop){
		var formatter = d3.time.format("%d/%m/%Y");

		container.on(event, function() {
			var verticalLine = my.verticalLine();
			var tooltip = my.tooltip();
			var map = my.map();
			var margin = my.margin();
			var height = my.height();
			var width = my.width();

			// Recuperation de la position X & Y
			var cursor;
			if(onDesktop){
				cursor = d3.mouse(this);
			}
			else{
				cursor = d3.touches(this)[0];
			}
			var cursor_x = parseInt(cursor[0]);
			var cursor_y = parseInt(cursor[1]);

			// Si la position de la souris est en dehors de la zone du graphique, 
			// on arrete le traitement
			if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
				return ;
			}

			// Grace a la fonction 'invert' on peut recuperer les valeurs
			// correspondant a notre position
			// Il faut soustraire la marge pour que la valeur soit correct.
			var selectedDate = x.invert(cursor_x - margin);
			var selectedClose = Number((y.invert(cursor_y - margin)).toFixed(2));

			// Positionnement de la barre verticale
			// en tenant compte de la marge
			verticalLine.attr("x1", cursor_x - margin);
			verticalLine.attr("x2", cursor_x - margin);
			verticalLine.style("opacity", 1);

			selectedDate.setHours(0,0,0,0);
			var entry = map[selectedDate];
			if (typeof entry === "undefined") {
				entry = {
						date: selectedDate,
						close: selectedClose
				};
			}

			// On affiche l'etiquette associee
			tooltip
			.style("opacity", .9);
			tooltip
			.style("left", ((onDesktop ? d3.event.pageX : cursor_x) + 20) + "px")    
			.style("top", ((onDesktop ? d3.event.pageY : cursor_y - 40) - 30) + "px")
			.html("<b>Date : </b>" + formatter(entry.date) + "<br>"
					+ "<b>Valeur : </b>" + entry.close + "<br>");
		})
		.on(eventEnd, function() {
			if(onDesktop){
				var cursor = d3.mouse(this);
				var cursor_x = parseInt(cursor[0]);
				var cursor_y = parseInt(cursor[1]);
				// Si la position de la souris est en dehors de la zone du graphique, 
				// on masque la ligne et le tooltip
				if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
					tooltip.style("opacity", 0);
					verticalLine.style("opacity", 0);
				}
			}
			else{
				tooltip.style("opacity", 0);
				verticalLine.style("opacity", 0);
			}
		});
	}
	
	return my;

};