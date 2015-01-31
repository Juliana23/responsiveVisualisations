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

		var timer = window.setTimeout(function() {}, 0);
		d3.select(window).on('resize', function() {
	        window.clearTimeout(timer);
	        timer = window.setTimeout(function() {
	        	resize();
	        }, 500);
	    });
	}

	my.init = function (options) {
		my.isMobile(isMobile());
		
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
		my.resize(my.height(), my.width());

		// Redessine le graphe de maniere responsive
		my.redraw();

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
		
		my.children().forEach(function(d) {
        	var allParents = getAllParents(d);
        	d["allParents"] = allParents;
        });
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
                .attr("class", "fixed-tooltip")
                .attr("x", width)
                .attr("y", 0)
                .style("visibility", "hidden")
                .style("display", "none");
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
		.on("click", function(d) {
			var depth;
			var node;
			// On ne descend pas en profondeur si
			// le noeud a des enfants
			if(d.parent.depth != 1){
				depth = d.parent.parent;
				node = d.parent;
			}
			else{
				depth = d.parent;
				node = d;
			}
			return my.zoom(my.node() == d.parent ? my.root() : depth, node); });

		graph.selectAll(".cell.child")
		.append("rect")
		.attr("width", function(d) { return d.dx - 1; })
		.attr("height", function(d) { return d.dy - 1; })
		.style("fill", function(d) { return color(d.parent.name); });
		
		my.graph(graph);
		my.drawFirstParents();
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
	
	my.nodeOutline = function (newNodeOutline){
		if (!arguments.length) {
			return nodeOutline;
		}
		nodeOutline = newNodeOutline;
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

	my.zoom = function (d, nodeOutline) {
		my.node(d);
		my.nodeOutline(nodeOutline);
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
	
	my.remove = function(){
		// Suppression du contour et du texte
		d3.selectAll(".outlineParent").remove();
		d3.selectAll(".outlineFirstParent").remove();
		d3.selectAll(".outlineChild").remove();
		d3.selectAll(".textParent").remove();
		d3.selectAll(".textFirstParent").remove();
		d3.selectAll(".textChild").remove();
		d3.selectAll(".numText").remove();
		
		// Suppression de highlight
    	my.graph().selectAll("g.cell")
    	.style("opacity", "1");
    	
    	// Suppression du contour et du texte
    	d3.select("path").remove();
	}
	
	my.hide = function(){
		// On cache le tooltip
    	my.tooltip().style("visibility", "hidden")
    	.style("display", "none");
    	
		// On cache toutes les cellules
		my.graph().selectAll("g.cell")
		.style("display", "none");
	}

	/*
	 * Cette methode redessine le graphe
	 */
	my.redraw = function () {
		my.remove();
		my.hide();
		
		// On affiche les enfants
		my.graph().selectAll("g.cell")
		// Si la liste des parents du noeud d courant 
        // contient le parent sur lequel on est alors on l'affiche
		.filter(function(d) {
			return d.allParents.indexOf(my.node()) !== -1;
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
		
		// Affichage des enfants si on zoom
		if(my.node() != my.root()){
			my.graph().selectAll(".cell.child")
			.append("text")
			.attr("x", function(d) { return d.dx / 2; })
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) {
					return d.name;
			})
			.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
			
			if(my.nodeOutline()){
				// On encadre l'enfant clique
				var listChildren = [];
	    		my.graph().selectAll("g.cell")
	            .each(function(n) {
	            	var containParent = n.allParents.indexOf(my.nodeOutline());
	            	if(containParent !== -1){
	            		listChildren.push(n);
	            	}
	            });
	    		
	    		if(my.nodeOutline().children){
	    			my.drawOutline(my.nodeOutline(), listChildren, my.nodeOutline().name, "outlineChild", "textChild", false);
	    			// Highlight representant le parent
		    		my.graph().selectAll("g.cell")
		    		// Si la liste des parents du noeud n courant 
		            // contient le parent sur lequel on est alors on l'affiche
		            .filter(function(n) {
		            	var containParent = n.allParents.indexOf(my.nodeOutline());
		                return containParent === -1;
		            })
		            .style("opacity", "0.2");
	    		}
	    		else{
	    			// Highlight representant le parent
		    		my.graph().selectAll("g.cell")
		    		// Si la liste des parents du noeud n courant 
		            // contient le parent sur lequel on est alors on l'affiche
		            .filter(function(n) {
		                return n != my.nodeOutline();
		            })
		            .style("opacity", "0.2");
	    		}
			}
		}
		else{
			my.graph().selectAll(".cell.child text").remove();
			// On redessine les parents
	    	my.drawFirstParents();
		}

		// Redefinition des rectangles
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
	
	my.drawFirstParents = function(){
		// Affichage des premiers parents
		my.parents().forEach(function(parent){
			if(parent.depth === 1){
				var listChildren = [];
	    		my.graph().selectAll("g.cell")
	            .each(function(n) {
	            	var containParent = n.allParents.indexOf(parent);
	            	if(containParent !== -1){
	            		listChildren.push(n);
	            	}
	            });
	    		my.drawOutline(parent, listChildren, parent.name, "outlineFirstParent", "textFirstParent", true);
			}
		});
	};
	
	/*
     * Cette methode encadre et affiche le nom
     * du parent de node passe en parametre
     * et ajoute le tooltip
     */
	my.drawOutline = function(node, children, nameText, nameClassPath, nameClassText, onBottomRight){
		// Encadrement representant le parent
		var pathinfo = getOutline(children);

		var d3line = d3.svg.line()
		.x(function(d){return d.x;})
		.y(function(d){return d.y;})
		.interpolate("linear"); 
		
		// Dessin du contour
		my.svg().append("svg:path")
		.attr("class", nameClassPath)
		.attr("d", d3line(pathinfo))
		.style("stroke-width", 1)
		.style("stroke", "black")
		.style("fill", "none")
		.attr("transform", "translate(" + margin + "," + margin + ")");

		// Affichage du titre
		var translationX;
		var translationY;
		if(onBottomRight){
			translationX = margin + pathinfo[3].x + (nameText.length * 4) + 5;
			translationY = margin + pathinfo[3].y - 5;
		}
		else{
			translationX = margin + (pathinfo[0].x + ((pathinfo[1].x - pathinfo[0].x) / 2));
			translationY = margin + (pathinfo[0].y + ((pathinfo[1].y - pathinfo[0].y) / 2)) - 3;
		}
		my.svg().append("svg:text")
		.attr("class", nameClassText)
		.attr("text-anchor", "middle")
		.text(nameText)
		.attr("transform", "translate(" + translationX + "," + translationY + ")")
		.style("opacity", function() { 
			w = this.getComputedTextLength(); 
			return pathinfo[1].x - pathinfo[0].x > w ? 1 : 0; 
		});
		
		return pathinfo;
	};
	
	/*
     * Cette methode affiche une etiquette
     */
	my.drawTooltip = function(node, pathinfo){
		var children = node.parent.children;
        var html = "<ol>";
        var i = 1;
        var name = "";
        var bgcolor = "";
        var textcolor = "";
        children.forEach(function (child) {
        	var opacity = child != node ? "0.5" : "";
            child.ord = i;
            name = child.children ? child.name : child.parent.name;
            bgcolor = color(name);
            textcolor = needLightColor(bgcolor) ? "#FFF" : "#000";
            html += "<li style='background-color : " + bgcolor + "; color:" + textcolor + "; opacity : " + opacity + "'>";
            html += child.name;
            html += "</li>";
            i++;
        });
        html += "</ol>";
        
        my.graph().selectAll(".cell.child")
                    .append("text")
                    .attr("class", "numText")
                    .attr("x", function (d) {
                        return d.dx / 2;
                    })
                    .attr("y", function (d) {
                        return d.dy / 2;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .style("cursor", "default")
                    .text(function (d) {
                        if(children.indexOf(d) !== -1){
                            return d.ord;
                        }
                    })
                    .style("font-size", function (d) {
                        return 0.50 * Math.sqrt(d.dx * d.dy) + 'px';
                    })
                    .style("opacity", function(d){
                    	if(d != node){
                    		return "0.2";
                    	}
                    });
        
        if(!my.isMobile()){
        	my.updateMove(my.svg().selectAll(".cell text"), "mouseover", "mouseout", true);
        }

        // On affiche l'etiquette associee
        if(my.height() - pathinfo[0].y > (my.margin() + i * 10)){
        	my.tooltip()
            .style("top", pathinfo[0].y + my.margin() + "px")
        }
        else if(my.height() > (my.margin() + i * 10)){
        	my.tooltip()
            .style("top", my.margin() + my.height() - (my.margin() + i * 10) + "px")
        }
        else{
        	my.tooltip()
            .style("top", 0 + "px")
        }
        if(pathinfo[0].x > 100){
            my.tooltip()
                    .style("left", (pathinfo[0].x - my.margin()) + "px")
        }
        else {
            my.tooltip()
                    .style("left", (pathinfo[1].x + my.margin() + 20) + "px")
        }
        my.tooltip()
        .style("visibility", "visible")
        .style("display", "");
        my.tooltip()
                .html(html);
	}
	
	/*
     * Cette methode applique les etiquettes
     * lorsqu'on se deplace sur la courbe
     */
    my.updateMove = function (container, event, eventEnd, onDesktop) {
    	var width = my.width();
    	var height = my.height();
    	var margin = my.margin();
    	
    	container.on(event, function (d) {
    		// Suppression du contour et du texte
    		my.remove();
    		
    		var listChildren = [];
    		// Highlight representant le parent
    		my.graph().selectAll("g.cell")
    		// Si la liste des parents du noeud n courant 
            // contient le parent sur lequel on est alors on l'affiche
            .filter(function(n) {
            	var containParent = n.allParents.indexOf(d.parent);
            	if(containParent !== -1){
            		listChildren.push(n);
            	}
                return containParent === -1;
            })
            .style("opacity", "0.2");
    		
    		// Information sur le parent du noeud courant
    		var pathinfo = my.drawOutline(d, listChildren, d.parent.name, "outlineParent", "textParent", false);
    		
    		// On dessine le tooltip seulement si
    		// on n'est pas sur le zoom
    		if(my.node() === my.root()){
    			my.drawTooltip(d, pathinfo);
    		}
        })
        .on(eventEnd, function () {
        	my.tooltip().style("visibility", "hidden")
        	.style("display", "none");
        	
        	// Suppression de highlight
        	my.graph().selectAll("g.cell")
        	.style("opacity", "1");
        	
        	// Suppression du contour et du texte
        	d3.selectAll(".numText").remove();
        	d3.select("path").remove();
        	d3.select(".textParent").remove();
        	
        	// On redessine les premiers parents
        	if(my.node() === my.root()){
            	my.drawFirstParents();
        	}
        	
        });
    };
	return my;

}
;