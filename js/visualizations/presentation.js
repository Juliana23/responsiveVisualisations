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
		
		$$ResponsiveUtil.addResizeEvent(resize);
		
		window.parent.onkeyup = function (e) {
			if(e.keyCode === 39){
				my.changeToNextChild();
			}
			else if(e.keyCode === 37){
				my.changeToPreviousChild();
			}
	    }
	}

	my.init = function (options) {
		my.isMobile($$ResponsiveUtil.mobile());
		
		//On cree un nouveau noeud <svg>
		my.margin(options.margin || 60);

		my.svg(d3.select("body").append("svg").attr("id", "graph")
				.attr("class", "treemap responsive")
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
		
		// Initialisation des donnees
		my.initData(options.data);

		// Initialisation des cellules
		my.initGraph(my.margin(), my.parents(), my.children(), my.node(), my.root(), my.color());
		
		// On met les evenements sur le graphe a jour
		// Initialisation des evenements
        my.event(new ResponsiveEvent({
        	object : d3.selectAll(".cell.child").each(function(d,i){
				Hammer(this, {
					prevent_default: true,
					no_mouseevents: true
				})
			}),
        	events : [
        		{"name": "mouseover", "func": my.onMoveMouse, "extend": false},
        		{"name": "touchend", "func": my.onMoveTouch, "extend": false},
        		{"name": "mouseout", "func": my.endMove, "extend": false},
        		{"name": "dblclick", "func": my.eventZoomIn, "extend": true}
        		//{"name": "doubletap", "func": my.eventZoomIn, "extend": false}
        	]
        })());

		new ResponsiveEvent({
			object : d3.select(window).each(function(d,i){
				Hammer(this, {
					prevent_default: true,
					no_mouseevents: true
				})
			}),
        	events : [
        		{"name": "click", "func": my.mouseEndEvent, "extend": false},
        		{"name": "dblclick", "func": my.mouseZoom, "extend": false},
        		{"name": "doubletap", "func": my.touchZoom, "extend": false},
        		{"name": "tap", "func": my.touchEndEvent, "extend": false},
        		{"name": "swiperight", "func": my.changeToPreviousChild, "extend": false},
        		{"name": "swipeleft", "func": my.changeToNextChild, "extend": false}
        	]
        })();
		
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
		
		my.nodes(my.treemap().nodes(my.root()));
		
		my.children(my.treemap().nodes(my.root())
				.filter(function(d) { return !d.children; }));

		my.parents(my.treemap().nodes(my.root())
				.filter(function(d) { return d.children; }));
		
		my.children().forEach(function(d) {
        	var allParents = $$ResponsiveTreeUtil.getAllParents(d);
        	d["allParents"] = allParents;
        });
		
		my.parents().forEach(function(d) {
        	var allParents = $$ResponsiveTreeUtil.getAllParents(d);
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
	 * Initialisation du graphe
	 */
	my.initGraph = function (margin, parents, children, node, root, color) {
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
        
        // Initialisation de l'objet selector
        my.selector(new ResponsiveSelector({
        	g : graph,
            depth: 1,
            layout : my.treemap(),
            parentsCls: "cell parent",
            childrenCls: "cell child",
            node: node,
            root: root,
            autoresize: false
        })());
		
		// Initiliasation des cellules
		graph.selectAll(".cell.child")
		.data(children)
		.enter().append("g")
		.attr("class", "cell child")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		
		graph.selectAll(".cell.child")
		.append("rect")
		.attr("width", function(d) { return d.dx - 1; })
		.attr("height", function(d) { return d.dy - 1; })
		.style("fill", function(d) { return color(d.parent.name); })
		.style("stroke", function(d) { return color(d.parent.name); })
		.style("stroke-opacity", "0.3");
		
		$.get( my.root().url)
		.done(function(data){
			graph.selectAll(".cell.child")
			.append('foreignObject')
			.attr("class", "content")
			.attr("width", function(d) { return d.dx - 1; })
			.attr("height", function(d) { return d.dy - 1; })
			.each(function(d) { 
				var slide = d.slide;
				if(slide){
					var section = "#" + d.slide;
					var content =  $($.parseHTML(data)).filter(section)[0]; 
					$(this).html(content);
				}
			})
			.style("display", "none");
		});
		
		my.graph(graph);
		
		my.selector().trigger("draw");
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
	
	my.zoomIn = function (newZoomIn) {
		if (!arguments.length) {
			return zoomIn;
		}
		zoomIn = newZoomIn;
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
	
	/*
	 * Noeud courant
	 */
	my.node = function (newNode) {
		if (!arguments.length) {
			return node;
		}
		node = newNode;
		return my;
	};

	/*
	 * Noeud parent 
	 */
	my.root = function (newRoot) {
		if (!arguments.length) {
			return root;
		}
		root = newRoot;
		return my;
	};
	
	my.nodes = function (newNodes) {
		if (!arguments.length) {
			return nodes;
		}
		nodes = newNodes;
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
	
	/*
	 * Noeud qu'on souhaite encadrer
	 */
	my.nodeOutline = function (newNodeOutline){
		if (!arguments.length) {
			return nodeOutline;
		}
		nodeOutline = newNodeOutline;
		return my;
	};
	
	/*
	 * Noeud feuille
	 */
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
    
    my.selector = function (newSelector) {
        if (!arguments.length) {
            return selector;
        }
        selector = newSelector;
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
	
	my.pathinfo = function (newPathinfo) {
		if (!arguments.length) {
			return pathinfo;
		}
		pathinfo = newPathinfo;
		return my;
	};
	
	my.event = function (newEventOn) {
		if (!arguments.length) {
			return eventOn;
		}
		eventOn = newEventOn;
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
		d3.selectAll(".numText").remove();
		
		// Suppression de highlight
    	my.graph().selectAll("g.cell.child")
    	.style("opacity", "1");
    	
    	my.selector().trigger("hide");
	}
	
	my.hide = function(){
		// On cache le tooltip
		my.tooltip().trigger("hide");
    	
		// On cache toutes les cellules
		my.graph().selectAll("g.cell.child")
		.style("display", "none");
	}

	/*
	 * Cette methode redessine le graphe
	 */
	my.redraw = function () {
		var depth;
		var node;
		my.remove();
		my.hide();
		
		my.graph().selectAll(".cell.child text").remove();
		my.graph().selectAll(".cell.child")
		.select(".content")
		.style("display", "none");
		
		if(my.node().children){
			// On affiche les enfants
			my.graph().selectAll("g.cell.child")
			// Si la liste des parents du noeud d courant 
	        // contient le parent sur lequel on est alors on l'affiche
			.filter(function(d) {
				return d.allParents.indexOf(my.node()) !== -1;
			})
			.style("display", "");
		}
		else{
			my.graph().selectAll("g.cell.child")
			// Si la liste des parents du noeud d courant 
	        // contient le parent sur lequel on est alors on l'affiche
			.filter(function(d) {
				return d === my.node();
			})
			.style("display", "");
		}
		
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
		
		my.selector().trigger("redraw", my.node());		
		my.updateChildren();
	};
	
	/*
	 * Cette methode met les cellules a la
	 * bonne dimension
	 */
	my.updateChildren = function(){
		// Redefinition des rectangles
		var kx = my.width() / my.node().dx;
		var ky = my.height() / my.node().dy;
		my.x().domain([my.node().x, my.node().x + my.node().dx]);
		my.y().domain([my.node().y, my.node().y + my.node().dy]);

		var t = d3.selectAll(".cell.child").transition()
		.attr("transform", function(d) { return "translate(" + my.x()(d.x) + "," + my.y()(d.y) + ")"; });

		t.select("rect")
		.attr("width", function(d) { return kx * d.dx - 1; })
		.attr("height", function(d) { return ky * d.dy - 1; });
		
		// Affichage des enfants si on zoom
		if(my.node() !== my.root() && my.node().children){
			my.graph().selectAll(".cell.child")
			.filter(function(d){
				return d.parent === my.node();
			})
			.select(".content")
			.attr("width", function(d) { return d.dx - 1; })
			.attr("height", function(d) { return d.dy - 1; })
			.style("display", "");
			
			if(my.nodeOutline()){
				my.selector().trigger("drawOnNode", my.nodeOutline());
			}
		}
		else{
			my.graph().selectAll(".cell.child")
			.filter(function(d){
				return d === my.node();
			})
			.select(".content")
			.attr("width", function(d) { return d.dx - 1; })
			.attr("height", function(d) { return d.dy - 1; })
			.style("display", "");
		}
	};
	
	/*
	 * Cette methode selectionne le noeud
	 * frere precedent
	 */
	my.changeToPreviousChild = function (){
//		var parent = my.node().parent;
//		if(parent.children){
//			var children = parent.children;
//			var i = 0;
//			var child = children[i];
//			var nextChild = child;
//			while(i < children.length && child !== my.node()){
//				i++;
//				child = children[i];
//			}
//			i--;
//			if(child === my.node() && i >= 0){
//				nextChild = children[i];
//			}
//			my.node(nextChild);
//			my.redraw();
//			my.endUpdateMove();
//		}
		var page = my.node().page;
		if(page){
			var nextPage = parseInt(page) - 1;
			var nextNode = my.node();
			my.nodes().forEach(function(node){
				if(node.page == nextPage){
					nextNode = node;
				}
			});
			my.node(nextNode);
			my.redraw();
			my.endUpdateMove();
		}
	};
	
	/*
	 * Cette methode selectionne le noeud
	 * frere suivant
	 */
	my.changeToNextChild = function (){
//		console.log(my.node());
//		console.log(my.node().children);
//		if(my.node().children && my.node().children.length !== 1){
//			my.zoom(my.node().children[0]); 
//		}
//		else{
//			var parent = my.node().parent;
//			if(parent){
//				var children = parent.children;
//				var i = 0;
//				var child = children[i];
//				var nextChild = child;
//				while(i < children.length && child !== my.node()){
//					i++;
//					child = children[i];
//				}
//				i++;
//				if(child === my.node() && i < children.length){
//					nextChild = children[i];
//					my.node(nextChild);
//					my.redraw();
//					my.endUpdateMove();
//				}
//				else{
//					var nextChild = my.getNextChild(my.node().parent);
//					console.log(nextChild);
//					if(nextChild !== ""){
//						my.zoom(nextChild);
//					}
//					else{
//						my.zoom(my.node().parent);
//					}
//				}
//			}
//		}
		var page = my.node().page;
		if(page){
			var nextPage = parseInt(page) + 1;
			var nextNode = my.node();
			my.nodes().forEach(function(node){
				if(node.page == nextPage){
					nextNode = node;
				}
			});
			my.node(nextNode);
			my.redraw();
			my.endUpdateMove();
		}
	};
	
	/*
	 * Methode pour recuperer le noeud suivant de node
	 */
	my.getNextChild = function (node){
		var parent = node.parent;
		var nextChild = "";
		if(parent){
			var children = parent.children;
			var i = 0;
			var child = children[i];
			nextChild = child;
			while(i < children.length && child !== node){
				i++;
				child = children[i];
			}
			i++;
			if(child === node && i < children.length){
				nextChild = children[i];
			}
		}
		return nextChild;
	};
	
	/*
     * Cette methode affiche une etiquette
     * associe au bloc clique et met des numeros 
     * dans les cellules pour les associer aux
     * etiquettes
     */
	my.drawTooltip = function(node){
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
            textcolor = $$ResponsiveTreeUtil.needLightColor(bgcolor) ? "#FFF" : "#000";
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
        
        my.tooltip().trigger("redraw", html);
	}
    
    my.onMoveMouse = function (node) {
    	my.startUpdateMove(node);
    };
    
    my.onMoveTouch = function (node) {
		// Si le tooltip est affiche
		if(my.tooltip().getIsDrawn()){
			var opacity = my.graph().selectAll("g.cell.child") .filter(function(n) {
				return n.allParents.indexOf(node.parent) !== -1;
			}).style("opacity");
			// Si le noeud sur lequel on a clique n'appartient
			// pas au bloc de noeud qui etait selectionne
			if(opacity != 1){
				my.endUpdateMove();
			}
		}
		my.startUpdateMove(node);
    };
    
    my.endMove = function () {
    	my.endUpdateMove();
    };
    
    /*
     * Cette methode affiche l'etiquette
     * et met en avant le bloc clique avec
     * l'eclairage
     */
    my.startUpdateMove = function(d){
		// Suppression du contour et du texte
		my.remove();
		var listChildren = [];
		// Highlight representant le parent
		my.graph().selectAll("g.cell.child")//.transition().duration(500)
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
		//my.drawOutline(d, d.parent.name, "textParent");
		my.selector().trigger("drawOnNode", d.parent);
		
		// On dessine le tooltip seulement si
		// on n'est pas sur le zoom
		if(my.node() === my.root()){
			my.drawTooltip(d);
		}
		else{
			if(d.parent !== my.node() && my.node().children){
				my.graph().selectAll("g.cell.child text")
				.filter(function(n){
					return listChildren.indexOf(n) !== -1;
				})
				.style("display", "none");

				my.drawTooltip(d);
			}
		}
    };
    
    /*
     * Cette methode est la fin de l'evenement
     * pour revenir a l'etat initial
     */
    my.endUpdateMove = function(){
		my.tooltip().trigger("hide");
		// Suppression de highlight
		my.graph().selectAll("g.cell.child")
		.style("opacity", "1");
		
		// Suppression du contour et du texte
		d3.selectAll(".numText").remove();
		
		// On redessine les premiers parents
		my.selector().trigger("redraw");
	};
	
	my.eventZoomIn = function(node){
		var depth;
		var nodeInt;
		// On ne descend pas en profondeur si
		// le noeud a des enfants
		if(node.parent.depth !== 1){
			depth = node.parent.parent;
			nodeInt = node.parent;
		}
		else{
			depth = node.parent;
			nodeInt = node;
		}
		my.zoom(node === node.parent ? root : depth, nodeInt); 
	};
	
	my.mouseZoom = function() {
		if($$ResponsiveUtil.isPositionOutsideContainer(my.margin())){
			my.zoom(my.root()); 
		}
	};
	
	my.mouseEndEvent = function() {
		if($$ResponsiveUtil.isPositionOutsideContainer(my.margin())){
			my.endUpdateMove();
		}
	};
	
	my.touchZoom = function() {
		if($$ResponsiveUtil.isPositionOutsideContainer(my.margin())){
			my.zoom(my.root()); 
		}
	};
	
	my.touchEndEvent = function() {
		if($$ResponsiveUtil.isPositionOutsideContainer(my.margin())){
			my.endUpdateMove();
		}
	};
	
	return my;

}
;