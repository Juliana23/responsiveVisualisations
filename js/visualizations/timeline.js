function TimeLine(options) {
    options = options || {};

    function my() {
        my.init(options);

        /*
         * Fonction qui est appelee lors d'un resize de l'ecran
         */
        function resize() {
            if (parseInt(d3.select("#graph").style("height")) < 200) {
                my.brushHeight(0);
            }
            else if (parseInt(d3.select("#graph").style("height")) < 400) {
                my.brushHeight(30);
            }
            else {
                my.brushHeight(50);
            }

            // On redefinit les tailles
            var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2,
                    height = parseInt(d3.select("#graph").style("height")) - my.brushHeight() - options.brush.marginTop - my.margin() * 2;

            // Modification de la hauteur et de la largeur
            my.resize(height, width);

            // Redessine le graphe de maniere reponsive
            my.redraw();
        }

        // Add resize event
        $$ResponsiveUtil.addResizeEvent(resize);
    }

    my.init = function (options) {
    	my.isMobile($$ResponsiveUtil.mobile());
        //On cree un nouveau noeud <svg>
        my.margin(options.margin || 60);
        my.svg(d3.select("body").append("svg").attr("id", "graph")
        		.attr("class", "timeline")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight));
        my.svg().append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", window.innerWidth - (2 * my.margin()))
                .attr("height", window.innerHeight);

        // Initialisation de la taille du graphe
        my.width(options.width || parseInt(d3.select("#graph").style("width")) - my.margin() * 2);
        my.height(options.height || parseInt(d3.select("#graph").style("height")) - my.margin() * 2);

        // Initialisation des donnees
        my.initData(options.data, options.formatDate);

        // Initialisation du brush
        my.initBrush(options.brush || {});

        // Initialisation du graphe
        my.initGraph(my.margin(), my.height(), my.width(), my.data());

        // Initialisation du rectangle
        my.initRect(my.svg(), my.width(), my.height(), my.margin());

        /*
         * On recupere la premiere et derniere
         * valeur pour les afficher avec un cercle
         * si la visualisation est trop petite
         */
        if (options.firstEndCircle) {
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

    /*******************************
     * Fonctions d'initialisation
     ********************************/

    /*
     * Initialisation des donnees
     */
    my.initData = function (pData, formatDate) {
        var data = pData || [];
        var parseDate = formatDate != null ? d3.time.format(formatDate).parse : d3.time.format("%Y-%m").parse;
        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });
        my.data(data);
        my.firstRecord(data[0]);
        my.lastRecord(data[data.length - 1]);
    };

    /*
     * Initialisation du graphe
     */
    my.initGraph = function (margin, height, width, data) {
        var graph = d3.select("#graph")
                .append("g")
                .attr("height", my.height())
                .attr("width", my.width())
                .attr("class", "focus");

        if (margin) {
            graph.attr("transform", "translate(" + margin + "," + margin + ")");
        }

        // Initialisation du tooltip
        my.tooltip(new ResponsiveTooltip({
        	g : graph,
        	cls: "fixed_tooltip"
        })());
        
        // Initialisation des axes
        // Axes des x
        my.x(new ResponsiveAxis({
            g: graph,
            orientation: $$ResponsiveUtil._BOTTOM_,
            datatype: "year",
            cls: "x axis",
            domain: d3.extent(data, function (d) {
                return d.date;
            }),
            autosize: false
        })());
        // Axes des y
        my.y(new ResponsiveAxis({
            g: graph,
            orientation: $$ResponsiveUtil._LEFT_,
            cls: "y axis",
            domain: [0, d3.max(data, function (d) {
                    return d.close;
                })],
            autosize: false
        })());
        
        /*
         * On definit la visualisation principale
         */

        // Definition un zone
        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return my.x()(d.date);
                })
                .y0(my.height())
                .y1(function (d) {
                    return my.y()(d.close);
                });
        my.area(area);

        var dataPerPixel = data.length / width;
        var dataResampled = data.filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        graph.append("path")
                .datum(dataResampled)
                .attr("class", "area")
                .attr("d", area);
        
        graph.append("circle")
	        .attr("class", "y")
	        .style("fill", "none")
	        .style("stroke", "blue")
	        .style("opacity", 0)
	        .attr("r", 4);
	        

        my.graph(graph);
    };

    /*
     * Initialisation du rectangle qui aura
     * les evenements mousemove et touchmove
     */
    my.initRect = function (container, width, height, margin) {
        // On cree un rectangle par dessus la visualisation
        var rect = container.append("rect")
                .attr("width", width - margin)
                .attr("height", height)
                .attr("transform", "translate(" + margin + "," + margin + ")")
                .style("opacity", 0)
                .attr("class", "onMouseMove");
        my.rect(rect);
    };

    /*
     * Initialisation du brush
     */
    my.initBrush = function (brushOpts) {
        my.initContext(brushOpts);
    };

    /*
     * Initialisation du context qui aura
     * la visualisation plus petite
     */
    my.initContext = function (brushOpts) {
    	// Height
        my.brushHeight(brushOpts.height);
        // Revu de la taille du graph original
        my.height(my.height() - my.brushHeight() - my.margin());
        var context = my.svg().append("g")
        		.attr("height", my.brushHeight())
                .attr("width", my.width())
                .attr("class", "context")
                .attr("transform", "translate(" + my.margin() + "," + (my.height() + my.margin() + options.brush.marginTop) + ")");
        
        if (!brushOpts) {
            return;
        }
        
        // Axes des x
        my.brushX(new ResponsiveAxis({
            g: context,
            orientation: $$ResponsiveUtil._BOTTOM_,
            datatype: "year",
            cls: "x axis",
            domain: d3.extent(data, function (d) {
                return d.date;
            }),
            autosize: false
        })());
        // Axes des y
        my.brushY(new ResponsiveAxis({
            g: context,
            orientation: $$ResponsiveUtil._LEFT_,
            cls: "y axis",
            domain: [0, d3.max(data, function (d) {
                    return d.close;
                })],
            autosize: false
        })());

        // Definition du brush 
        var brush = d3.svg.brush()
                .x(my.brushX())
                .on("brush",
                        function () {
                            my.brushed();
                        }
                );
        my.brush(brush);
        
     // Definition un zone
        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return my.brushX()(d.date);
                })
                .y0(my.brushHeight())
                .y1(function (d) {
                    return my.brushY()(d.close);
                });
        my.brushArea(area);

        var dataPerPixel = data.length / width;
        var dataResampled = data.filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        context.append("path")
                .datum(dataResampled)
                .attr("class", "area")
                .attr("d", area);
        
//        context.append("g")
//                .attr("class", "x axis")
//                .attr("transform", "translate(0," + my.brushHeight() + ")")
//                .call(my.brushXAxis());

//        context.append("g")
//                .attr("class", "x brush")
//                .call(my.brush())
//                .selectAll("rect")
//                .attr("y", -6)
//                .attr("height", my.brushHeight() + 7);

        my.context(context);
    };

    /************************
     * Getters AND Setters
     ************************/

    my.isMobile = function (newIsMobile) {
		if (!arguments.length) {
			return isMobile;
		}
		isMobile = newIsMobile;
		return my;
	};
	
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
                .attr("width", width)
                .attr("height", height);

        return my.rect();
    };

    my.area = function (newArea) {
        if (!arguments.length) {
            return area;
        }
        area = newArea;
        return my;
    };

    /*
     * Setters et Getters du Brush
     */

    my.brush = function (newBrush) {
        if (!arguments.length) {
            return brush;
        }
        brush = newBrush;
        return my;
    };

    my.brushHeight = function (newBrushHeight) {
        if (!arguments.length) {
            return brushHeight;
        }
        brushHeight = newBrushHeight;
        return my;
    };

    my.brushX = function (newBrushX) {
        if (!arguments.length) {
            return brushX;
        }
        brushX = newBrushX;
        return my;
    };

    my.brushY = function (newBrushY) {
        if (!arguments.length) {
            return brushY;
        }
        brushY = newBrushY;
        return my;
    };

    my.brushXAxis = function (newBrushXAxis) {
        if (!arguments.length) {
            return brushXAxis;
        }
        brushXAxis = newBrushXAxis;
        return my;
    };

    my.brushYAxis = function (newBrushYAxis) {
        if (!arguments.length) {
            return brushYAxis;
        }
        brushYAxis = newBrushYAxis;
        return my;
    };

    my.focus = function (newFocus) {
        if (!arguments.length) {
            return focus;
        }
        focus = newFocus;
        return my;
    };

    my.context = function (newContext) {
        if (!arguments.length) {
            return context;
        }
        context = newContext;
        return my;
    };

    my.brushArea = function (newBrushArea) {
        if (!arguments.length) {
            return brushArea;
        }
        brushArea = newBrushArea;
        return my;
    };

    /************************
     * Methods
     ************************/
    
    /*
     * Cette methode applique les redimensions
     * de la visualisation
     */
    my.resize = function (height, width) {
        if (arguments.length) {
            my.height(height);
            my.width(width);
        }

        // On met a jour les axes et le svg
        my.svg().attr("width", my.width());
        if(my.height() > 0){
            my.svg().attr("height", my.height());
        }

        // On met a jour le rectangle qui a les evenement mousemove
        // et touchmove
        my.updateArgsRect(my.width(), my.height(), my.margin());
        return my;
    };

    /*
     * Cette methode redessine le graphe
     */
    my.redraw = function () {
        my.svg().select("rect")
                .attr("width", window.innerWidth - (2 * my.margin()))
                .attr("height", window.innerHeight);

        var dataPerPixel = my.data().length / my.width();
        var dataResampled = my.data().filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        my.area().y0(my.height());
        my.graph().select('.area').datum(dataResampled).attr("d", my.area());

        // Resize du brush
//        my.brushX().range([0, my.width()]);
//        my.brushY().range([my.brushHeight(), 0]);
//        my.brushXAxis().ticks(Math.max(my.width() / 100, 2));
//        my.context().attr("transform", "translate(" + my.margin() + "," + (my.height() + my.margin() + options.brush.marginTop) + ")");
//        my.context().select('.x.axis')
//                .attr("transform", "translate(0," + my.brushHeight() + ")")
//                .call(my.brushXAxis());
        my.brushArea().y0(my.brushHeight());
        my.context().select('.area').datum(dataResampled).attr("d", my.brushArea());
    };

    /*
     * Cette methode met a jour les cercles 
     * de la premiere et derniere valeur
     */
    my.updateFirstEndCircle = function (graph, firstRecord, lastRecord) {
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
    
    /*
     * Cette methode affiche une etiquette
     * associe au bloc clique et met des numeros 
     * dans les cellules pour les associer aux
     * etiquettes
     */
	my.drawTooltip = function(data, pathinfo){
		//var pathinfo = my.pathinfo();
        var html = "<ol>";
        var i = 1;
        var name = "";
        for(key in data){
            html += "<li>";
            html += key;
            html += ": ";
            html += data[key];
            html += "</li>";
            i++;
        }
        html += "</ol>";
        
        my.tooltip().trigger("redraw", html);
	}

    /*
     * Cette methode applique les etiquettes
     * lorsqu'on se deplace sur la courbe
     */
    my.updateMove = function (container, event, eventEnd, onDesktop) {
    	var width = my.width();
    	var height = my.height();
    	var margin = my.margin();
    	var formatter = d3.time.format("%d/%m/%Y");
    	var bisectDate = d3.bisector(function(d) { return d.date; }).left;
    	container.on(event, function () {
    		// Recuperation de la position X & Y
    		var cursor;
    		var cursor_x;
    		if (onDesktop) {
    			cursor = d3.mouse(this);
    			cursor_x = d3.mouse(this)[0];
    		}
    		else {
    			cursor = d3.touches(this)[0];
    		}
    		var cursor_x = parseInt(cursor[0]);
    		var cursor_y = parseInt(cursor[1]);
    		
    		var x0 = x.invert(d3.mouse(this)[0]),
    		i = bisectDate(my.data(), x0, 1),
    		d0 = my.data()[i - 1],
    		d1 = my.data()[i],
    		d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    		    		
    		my.graph().select("circle.y")
    		.style("opacity", 1)
    		.attr("transform",
    				"translate(" + x(d.date) + "," +
    				y(d.close) + ")");

    		// On affiche l'etiquette associee
    		var data = {
    				Date: formatter(d.date),
    				Valeur: d.close
    		}
    		var pathinfo = [
    		                {
    		                	x: x(d.date) - 50,
    		                	y: y(d.close)
    		                },
    		                {
    		                	x: x(d.date) + 50,
    		                	y: y(d.close)
    		                }
    		                ];
    		my.drawTooltip(data, pathinfo);
        })
        .on(eventEnd, function () {
            if (onDesktop) {
                var cursor = d3.mouse(this);
                var cursor_x = parseInt(cursor[0]);
                var cursor_y = parseInt(cursor[1]);
                // Si la position de la souris est en dehors de la zone du graphique, 
                // on masque la ligne et le tooltip
                if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
                   
                	my.tooltip().trigger("hide");
                    
                	d3.select("circle").style("opacity", 0);
                }
            }
            else {
            	my.tooltip().trigger("hide");
            	
                d3.select("circle").style("opacity", 0);
            }
        });
    };

    /*
     * Methods du Brush
     */
    my.brushed = function () {
        my.x().domain(my.brush().empty() ? my.brushX().domain() : my.brush().extent());
        my.graph().select(".area").attr("d", my.area());
        my.graph().select(".x.axis").call(my.xAxis());
    };

    return my;

}
;