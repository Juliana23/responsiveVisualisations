function TimeLine(options) {
    options = options || {};

    function my() {
        my.init(options);

        function resize() {
            
            var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2,
                    height = parseInt(d3.select("#graph").style("height")) - my.margin() * 2;

            // Modification de la hauteur et de la largeur
            my.resize(height, width);

            // Mise a jour des donnees
            my.updateData();

            my.x().range([0, my.width()]);
            my.y().range([my.height(), 0]);

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

            my.yAxis().ticks(Math.max(my.height() / 50, 2));
            my.xAxis().ticks(Math.max(my.width() / 100, 2));

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
        }

        d3.select(window).on('resize', resize);
    }

    my.init = function (options) {

        //On cree un nouveau noeud <svg>
        var svg = d3.select("body").append("svg").attr("id", "graph");

        var parseDate = d3.time.format("%Y-%m").parse;

        var margin = options.margin || 60;
        var width = options.width || parseInt(d3.select("#graph").style("width")) - margin * 2;
        var height = options.height || parseInt(d3.select("#graph").style("height")) - margin * 2;

        var data = options.data || [];

        var x = d3.time.scale()
                .range([0, width])
                .nice(d3.time.year);

        var y = d3.scale.linear()
                .range([height, 0])
                .nice();

        var xAxis = d3.svg.axis().scale(x).orient("bottom");

        var yAxis = d3.svg.axis().scale(y).orient("left");

        var zoom = d3.behavior.zoom()
                .x(x)
                //.translate( [x, y] )
                .scaleExtent([1, 4])
                .on("zoom", my.zoomed);

        var line = d3.svg.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.close);
                });

        // Define 'div' for tooltips
        var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

        var graph = d3.select("#graph")
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin + ")");

        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });

        x.domain(d3.extent(data, function (d) {
            return d.date;
        }));

        y.domain([0, d3.max(data, function (d) {
            return d.close;
        })]);

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
                .datum(dataResampled)
                .attr("class", "line")
                .attr("d", line);

        /*
		 * On recupere la premiere et derniere
		 * valeur pour les afficher avec un cercle
		 * si la visualisation est trop petite
		 */
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
        my.parseDate(parseDate);
        my.svg(svg);
        my.div(div);
        my.graph(graph);
        my.data(data);
        my.line(line);
        my.x(x);
        my.y(y);
        my.height(height);
        my.width(width);
        my.xAxis(xAxis);
        my.yAxis(yAxis);
        my.margin(margin);
        my.zoom(zoom);
        my.firstRecord(firstRecord);
        my.lastRecord(lastRecord);
        my.first(first);
        my.last(last);
        
        my.updateData();
        my.resize(height, width);
        
        return my;
    };

    /*
     * Getters AND Setters
     */

    my.parseDate = function (newParseDate) {
        if (!arguments.length) {
            return parseDate;
        }
        parseDate = newParseDate;
        return my;
    };
    
    my.svg = function (newSvg) {
        if (!arguments.length) {
            return svg;
        }
        svg = newSvg;
        return my;
    };

    my.div = function (newDiv) {
        if (!arguments.length) {
            return div;
        }
        div = newDiv;
        return my;
    };

    my.graph = function (newGraph) {
        if (!arguments.length) {
            return graph;
        }
        graph = newGraph;
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

    my.zoom = function (newZoom) {
        if (!arguments.length) {
            return zoom;
        }
        zoom = newZoom;
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

    my.last = function (newLast) {
        if (!arguments.length) {
            return margin;
        }
        last = newLast;
        return my;
    };

    my.first = function (newFirst) {
        if (!arguments.length) {
            return first;
        }
        first = newFirst;
        return my;
    };

    /*
     * Methods
     */

    my.resize = function (height, width) {
        if (arguments.length) {
            my.height(height);
            my.width(width);
        }
        my.x().range([0, my.width()]);
        my.svg().attr("width", my.width());
        my.y().range([my.height(), 0]);
        my.svg().attr("height", my.height());

        // Creation d'une fonction scale pour mettre a l'echelle les cercles
        // Pour la taille des cercles
        var scale = d3.scale.linear()
                .domain([0, d3.max(data, function (d) {
                    return d.close;
                })])
                .range([0, 50]);
        
        // On supprime tous les cercles
        d3.selectAll("circle").remove();
        
        // On affiche tous les cercles visibles ou non
        my.graph()
                .selectAll("dot")
                .data(my.data())
                .enter()
                .append("circle")
                .attr("r", function (d) {
                    return scale(d.average);
                })
                .attr("tooltip", function (d) {
                    return "X : " + d.date.getFullYear() + "</b><br/>Y : " + parseInt(d.average) + ")";
                })
                .attr("cx", function (d) {
                    return x(d.date);
                }).attr("cy", function (d) {
                    return y(d.average);
                })
                .style("fill", "blue")
                .style("visibility", function(d) {
                    return d.visible ? "visible" : "hidden";
                })
                .style("opacity", "0.8");

        // On supprime tous les cercles non visibles
        d3.selectAll("circle").filter(function(d) { return !d.visible; }).remove();
        
        // On affiche l'etiquette
        d3.selectAll("circle").each(function(d, i){
            var circle = d3.select(this);
            circle.on("mouseover", function(d) {		
                    div.transition()
                            .duration(500)	
                            .style("opacity", 0);
                    div.transition()
                            .duration(200)	
                            .style("opacity", .9);	
                    div.html(circle.attr("tooltip"))	 
                            .style("left", (d3.event.pageX) + "px")			 
                            .style("top", (d3.event.pageY - 28) + "px");
            });
        });
           
        // Une fois avoir mis en place les cercles
        // On applique le zoom
        d3.selectAll("circle").on("click", my.zoomed);
        return my;
    };
    
    my.zoomed = function () {
    	var xClicked = d3.select(this).attr("cx");
    	my.filterData(xClicked);
    	dataFilter = [];
    	console.log(data);
    	data.forEach(function(d) {
    		if(d.onZoom){
    			dataFilter.push(d);
    		}
    	});
    	
    	my.graph().select(".x.axis").call(my.xAxis());
    	my.graph().select(".line").attr("d", my.line());
    	 //my.graph().select(".line").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");     
    };
    
    /*
     * Cette methode permet de filtrer les donnees pour
     * zoomer sur celles-ci. On recupere les donnees du step
     * ou le clic a ete fait
     */
    my.filterData = function (xClicked) {
    	var nbData = parseInt(my.width() / 100);
    	// Nombre de donnees par tranche
        var step = parseInt(data.length / nbData);
        // Nombre de tranche sur le graphe
        var nbStep = parseInt(data.length / step);
        // Numero du step de xClicked
        var numStepX = parseInt(xClicked / step);
    	var count = 0;
    	var num = 1;

    	console.log(numStepX + " --- " + xClicked + " --- " + nbStep);
        // On parcourt les donnees
        data.forEach(function(d) {
        	// Si la donnee est dans la step ou le clic a ete fait
        	if(count < step && num === numStepX){
        		d.onZoom = true;
        		count += 1;
        	}
        	else {
        		if(count === step){
        			count = 1;
        			num += 1;
        		}
        		d.onZoom = false;
        		count += 1;
        	}
        });
        return my;
    };
    
    /*
     * Cette methode permet de modifier le nombre de donnees
     * a afficher en fonction de la taille de l'ecran
     */
    my.updateData = function() {
        var nbData = parseInt(my.width() / 100);
        var step = parseInt(data.length / nbData);
        
        var count = 0;
        var sum = 0;
        var averageNode = null;
        
        // On parcourt les donnees
        data.forEach(function(d) {
            if(count === step){
            	// On met la moyenne au noeud du milieu
                averageNode.average = sum / step;
                d.visible = false;
                d.average = d.close;
                sum = d.close;
                count = 1;
            }
            else if(count === parseInt(step / 2)){
            	// On est au milieu du step
            	// On met en place un noeud qui sera affiche en un point
                averageNode = d;
                averageNode.visible = true;
                averageNode.average = averageNode.close;
                sum += averageNode.close;
                count += 1;
            }
            else {
                d.visible = false;
                d.average = d.close;
                sum += d.close;
                count += 1;
            }
        });
        
        return my;
    };
    
    return my;

};

var data = d3.tsv("./data/dataFemaleUs.tsv", function (error, data) {
    if (error)
        alert(error);
    var options = {
        height: window.innerHeight - 120,
        width: window.innerWidth - 120,
        margin: 60,
        data: data
    };
    var my = TimeLine(options);
    my();
});

//var data = d3.csv("./data/pollution.csv", function(error, data) {
//	if (error) alert(error);
//	var dataFilter = [];
//	var dataInt = {};
//	data.forEach(function(d) { 
//		if(d["COU"] === "FRA"){
//			dataInt = {
//					date: parseInt(d["Annee"]),
//					close: d["Value"]
//			}
//			console.log(dataInt["date"]);
//			dataFilter.push(dataInt);
//		}
//	});
//	var options = {
//			height: 300,
//			width: 500,
//			margin: 60,
//			data: dataFilter
//	}
//	var my = TimeLine(options);
//	my();
//});