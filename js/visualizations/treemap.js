function TreeMap(options) {
	options = options || {};

	function my() {
		my.init(options);

		/*
		 * Fonction qui est appelee lors d'un resize de l'ecran
		 */
		function resize() {
			// On redefinit les tailles
			var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2,
			height = parseInt(d3.select("#graph").style("height")) - my.margin() * 2;

			// Modification de la hauteur et de la largeur
			my.resize(height, width);

			// Redessine la visualisation de maniere reponsive
			my.redraw();
		}

		d3.select(window).on('resize', resize);
	}

	my.init = function (options) {
		//On cree un nouveau noeud <svg>
		my.margin(options.margin || 60);

		my.svg(d3.select("body").append("svg").attr("id", "graph")
				.attr("class", "treemap")
				.attr("width", window.innerWidth)
				.attr("height", window.innerHeight));

		// Initialisation de la taille du graphe
		my.width(options.width || parseInt(d3.select("#graph").style("width")) - my.margin() * 2);
		my.height(options.height || parseInt(d3.select("#graph").style("height")) - my.margin() * 2);

		my.initX(my.width());
		my.initY(my.height());

		my.treemap(d3.layout.treemap()
				.round(false)
				.size([my.width(), my.height()])
				.sticky(true)
				.value(function(d) { return d.size; }));

		my.color(d3.scale.category20c());
		
		// Initialisation du tooltip
        my.initTooltip(my.width());

		// Initialisation des donnees
		my.initData(options.data);

		// Initialisation des cellules
		my.initGraph(my.margin(), my.parents(), my.children(), my.node(), my.root(), my.color());
		
		// On met les evenements sur le graphe a jour
        my.updateMove(my.svg().selectAll(".cell"), "mouseover", "mouseout", true);
        my.updateMove(my.svg().selectAll(".cell"), "touchmove", "touchend", false);

		// Resize de la visualisation
		//my.resize(my.height(), my.width());

		// Redessine le graphe de maniere responsive
		//my.redraw();

		return my;
	};

	/*******************************
	 * Fonctions d'initialisation
	 ********************************/

	/*
	 * Initialisation des donnees
	 */
	my.initData = function (pData) {
		var data = pData || [];
		my.node(data);
		my.root(data);
		my.children(my.treemap().nodes(my.root())
				.filter(function(d) { return !d.children; }));

		my.parents(my.treemap().nodes(my.root())
				.filter(function(d) { return d.children; }));

		my.data(data);
	};

	/*
	 * Initialisation des abscisses
	 */
	my.initX = function (width) {
		var x = d3.scale.linear()
		.range([0, width]);
		my.x(x);
	};

	/*
	 * Initialisation des ordonnees
	 */
	my.initY = function (height) {
		var y = d3.scale.linear()
		.range([0, height]);
		my.y(y);
	};
	
	 /*
     * Initialisation de l'etiquette
     */
    my.initTooltip = function (width) {
        var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .attr("x", width)
                .attr("y", 0)
                .style("opacity", 0);
        my.tooltip(tooltip);
    };

	/*
	 * Initialisation du graphe
	 */
	my.initGraph = function (margin, parents, children, node, root, color) {
		var map = {};
		var graph = d3.select("#graph")
		.append("g")
		.attr("class", "focus");

		if (margin) {
			graph.attr("transform", "translate(" + margin + "," + margin + ")");
		}

		graph.selectAll(".cell.child")
		.data(children)
		.enter().append("g")
		.attr("class", "cell child")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.on("click", function(d) { return my.zoom(my.node() == d.parent ? my.root() : d.parent); });

		graph.selectAll(".cell.child")
		.append("rect")
		.attr("width", function(d) { return d.dx - 1; })
		.attr("height", function(d) { return d.dy - 1; })
		.style("fill", function(d) { return color(d.parent.name); });

//		graph.selectAll(".cell.child")
//		.append("text")
//		.attr("x", function(d) { return d.dx / 2; })
//		.attr("y", function(d) { return d.dy / 2; })
//		.attr("dy", ".35em")
//		.attr("text-anchor", "middle")
//		.text(function(d) {
//				return d.parent.name;
//		})
//		.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
		
		my.graph(graph);
	};

	/************************
	 * Getters AND Setters
	 ************************/

	my.svg = function (newSvg) {
		if (!arguments.length) {
			return svg;
		}
		svg = newSvg;
		return my;
	};

	my.graph = function (newGraph) {
		if (!arguments.length) {
			return graph;
		}
		graph = newGraph;
		return my;
	};

	my.node = function (newNode) {
		if (!arguments.length) {
			return node;
		}
		node = newNode;
		return my;
	};

	my.parents = function (newParents) {
		if (!arguments.length) {
			return parents;
		}
		parents = newParents;
		return my;
	};

	my.children = function (newChildren) {
		if (!arguments.length) {
			return children;
		}
		children = newChildren;
		return my;
	};

	my.root = function (newRoot) {
		if (!arguments.length) {
			return root;
		}
		root = newRoot;
		return my;
	};

	my.treemap = function (newTreeMap){
		if (!arguments.length) {
			return treemap;
		}
		treemap = newTreeMap;
		return my;
	};

	my.cell = function (newCell){
		if (!arguments.length) {
			return treemap;
		}
		cell = newCell;
		return my;
	};

	my.color = function (newColor){
		if (!arguments.length) {
			return color;
		}
		color = newColor;
		return my;
	};
	
	my.tooltip = function (newTooltip) {
        if (!arguments.length) {
            return tooltip;
        }
        tooltip = newTooltip;
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

	my.margin = function (newMargin) {
		if (!arguments.length) {
			return margin;
		}
		margin = newMargin;
		return my;
	};

	/************************
	 * Methods
	 ************************/

	 my.size = function (d) {
		return d.size;
	};

	my.count = function (d) {
		return 1;
	};

	my.zoom = function (d) {
		my.node(d);
		my.redraw();
	};

	/*
	 * Cette methode applique les redimensions
	 * de la visualisation
	 */
	my.resize = function (height, width) {
		if (arguments.length) {
			my.height(height);
			my.width(width);
		}
		return my;
	};

	/*
	 * Cette methode redessine le graphe
	 */
	my.redraw = function () {
		my.graph().selectAll("g.cell")
		.style("display", "none");
		my.graph().selectAll("g.cell")
		// Si la liste des parents du noeud d courant 
        // contient le parent sur lequel on est alors on l'affiche
		.filter(function(d) {
			return getAllParents(d).indexOf(my.node()) !== -1;
		})
		.style("display", "");
		
		my.x().range([0, my.width()]);
		my.y().range([0, my.height()]);

		// Mise a jour le layout avec la taille
		// de mise en page redefinie
		// sticky a true optimise la mise en page des noeuds
		my.treemap()
		.round(false)
		.size([my.width(), my.height()])
		.sticky(true)
		.value(function(d) { return d.size; });

		my.children(my.treemap().nodes(my.node())
				.filter(function(d) { return !d.children; }));

		// Redefinition de la taille du svg
		my.svg()
		.attr("width", window.innerWidth - (2 * my.margin()))
		.attr("height", window.innerHeight);

		// Redefinition de la position du graphe
		my.graph()
		.attr("transform", "translate(" + my.margin() + "," + my.margin() + ")");

		var kx = my.width() / my.node().dx;
		var ky = my.height() / my.node().dy;
		my.x().domain([my.node().x, my.node().x + my.node().dx]);
		my.y().domain([my.node().y, my.node().y + my.node().dy]);

		var t = d3.selectAll(".cell").transition()
		.attr("transform", function(d) { return "translate(" + my.x()(d.x) + "," + my.y()(d.y) + ")"; });

		t.select("rect")
		.attr("width", function(d) { return kx * d.dx - 1; })
		.attr("height", function(d) { return ky * d.dy - 1; });

		t.select("text")
		.attr("x", function(d) { return kx * d.dx / 2; })
		.attr("y", function(d) { return ky * d.dy / 2; })
		.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
	};
	
	   /*
     * Cette methode applique les etiquettes
     * lorsqu'on se deplace sur la courbe
     */
    my.updateMove = function (container, event, eventEnd, onDesktop) {
    	var width = my.width();
    	var height = my.height();
    	var margin = my.margin();
    	container.on(event, function (d) {
    		d3.select("path").remove();
    		var listChildren = [];
    		// Highlight representant le parent
    		my.graph().selectAll("g.cell")
    		// Si la liste des parents du noeud n courant 
            // contient le parent sur lequel on est alors on l'affiche
            .filter(function(n) {
            	var containParent = getAllParents(n).indexOf(d.parent);
            	if(containParent !== -1){
            		listChildren.push(n);
            	}
                return containParent === -1;
            })
            .style("opacity", "0.2");

    		// Encadrement representant le parent
    		var pathinfo = getOutline(listChildren);

    		var d3line = d3.svg.line()
    		.x(function(d){return d.x;})
    		.y(function(d){return d.y;})
    		.interpolate("linear"); 
    		
    		// Dessin du contour
    		my.svg().append("svg:path")
    		.attr("d", d3line(pathinfo))
    		.style("stroke-width", 1)
    		.style("stroke", "black")
    		.style("fill", "none")
    		.attr("transform", "translate(" + margin + "," + margin + ")");
    		
//    		var pathinfo = getArea(listChildren);
//    		console.log(pathinfo);
//    		my.svg().append("rect")
//    		.attr("class", "test")
//    		.attr("width", pathinfo.width)
//    		.attr("height", pathinfo.height)
//    		.attr("transform", function(d) { return "translate(" + my.x()(pathinfo.x) + "," + my.y()(pathinfo.y) + ")"; });
    		
    		// Recuperation de la position X & Y
//    		var cursor;
//    		var cursor_x;
//    		if (onDesktop) {
//    			cursor = d3.mouse(this);
//    			cursor_x = d3.mouse(this)[0];
//    		}
//    		else {
//    			cursor = d3.touches(this)[0];
//    		}
//    		var cursor_x = parseInt(cursor[0]);
//    		var cursor_y = parseInt(cursor[1]);
//    		
//    		var children = d.parent.children;
//    		var html = "<ul>";
//    		children.forEach(function(child){
//    			html += "<li>" + child.name + "</li>";
//    		});
//    		html += "</ul>";
//    		    		
//    		// On affiche l'etiquette associee
//			my.tooltip()
//			.style("opacity", .9);
//			my.tooltip()
//			.style("left", (onDesktop ? ((d3.event.pageX + 50 < width) ? d3.event.pageX + 50
//								: (d3.event.pageX - 150 < margin) ?  d3.event.pageX - 10 : d3.event.pageX - 150)
//										: ((cursor_x + 50 < width) ? cursor_x + 50 
//													: (cursor_x - 150 < margin) ? cursor_x - 10 : cursor_x - 150)) + "px")    
//			.style("top", ((onDesktop ? d3.event.pageY : cursor_y) - 50) + "px")
//			.html(html);
        })
        .on(eventEnd, function () {
        	if (onDesktop) {
                var cursor = d3.mouse(this);
                var cursor_x = parseInt(cursor[0]);
                var cursor_y = parseInt(cursor[1]);
                // Si la position de la souris est en dehors de la zone du graphique, 
                // on masque la ligne et le tooltip
                if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
                    my.tooltip().style("opacity", 0);
                    d3.select("circle").style("opacity", 0);
                }
            }
            else {
                my.tooltip().style("opacity", 0);
                d3.select("circle").style("opacity", 0);
            }
        	
        	// Suppression de highlight
        	my.graph().selectAll("g.cell")
        	.style("opacity", "1");
        	
        	// Suppression du contour
        	d3.select("path").remove();
        });
    };
	return my;

}
;