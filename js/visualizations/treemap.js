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
        if(!my.isMobile()){
        	my.updateMove(my.svg().selectAll(".cell.child"), "mouseover", "mouseout", true);
        }
        else{
        	my.updateMove(my.svg().selectAll(".cell.child"), "touchend", "", false);
        }

		// Resize de la visualisation
		my.resize(my.height(), my.width());

		// Redessine le graphe de maniere responsive
		my.redraw();
		
		// On met l'evenement si on clique
		// en dehors de la visualisation
		// pour faire un zoom out sur le root
		d3.select(window)
		.on("click", function() {
			var xClicked = d3.event.x;
			var yClicked = d3.event.y;
			if(xClicked < my.margin() 
					|| yClicked < my.margin()
					|| xClicked > window.innerWidth - my.margin()
					|| yClicked > window.innerHeight - my.margin()){
				my.zoom(my.root()); 
			}
		});
		
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
		
		my.parents().forEach(function(d) {
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
                .style("display", "none");
        my.tooltip(tooltip);
    };

	/*
	 * Initialisation du graphe
	 */
	my.initGraph = function (margin, parents, children, node, root, color) {
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
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		graph.selectAll(".cell.child")
		.append("rect")
		.attr("width", function(d) { return d.dx - 1; })
		.attr("height", function(d) { return d.dy - 1; })
		.style("fill", function(d) { return color(d.parent.name); })
		.style("stroke", function(d) { return color(d.parent.name); })
		.style("stroke-opacity", "0.3");
		
		if(my.isMobile()){
			graph.selectAll(".cell.child").each(function(d,i){
				// install handlers with hammer
			    Hammer(this, {
			      prevent_default: true,
			      no_mouseevents: true
			    }).on("doubletap", function(event){
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
					return my.zoom(my.node() == d.parent ? my.root() : depth, node, d); 
			    });
			});
		}
		else {
			graph.selectAll(".cell.child")
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
				return my.zoom(my.node() == d.parent ? my.root() : depth, node, d); 
			});	
		}
		
		my.graph(graph);
		my.drawFirstParents(parents);
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
	
	my.leaf = function (newLeaf){
		if (!arguments.length) {
			return leaf;
		}
		leaf = newLeaf;
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
	
	my.pathinfo = function (newPathinfo) {
		if (!arguments.length) {
			return pathinfo;
		}
		pathinfo = newPathinfo;
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

	my.zoom = function (d, nodeOutline, leaf) {
		my.leaf(leaf);
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
		d3.selectAll(".textParent").remove();
		d3.selectAll(".textChild").remove();
		d3.selectAll(".numText").remove();
		
		my.graph().selectAll(".textFirstParent")
		.style("display", "none");
		
		// Suppression de highlight
    	my.graph().selectAll("g.cell.child")
    	.style("opacity", "1");
	}
	
	my.hide = function(){
		// On cache le tooltip
    	my.tooltip().style("display", "none");
    	
		// On cache toutes les cellules
		my.graph().selectAll("g.cell.child")
		.style("display", "none");
	}

	/*
	 * Cette methode redessine le graphe
	 */
	my.redraw = function () {
		my.remove();
		my.hide();
		
		my.graph().selectAll(".cell.child text").remove();
		
		// On affiche les enfants
		my.graph().selectAll("g.cell.child")
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
			.filter(function(d){
				return d.parent === my.node();
			})
			.append("text")
			.attr("x", function(d) { return d.dx / 2; })
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) {
					return d.name;
			})
			.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
			
			// Noeud sur lequel on a clique
			if(my.nodeOutline()){
				// On encadre l'enfant clique
	    		if(my.nodeOutline().children){
	    			my.drawOutline(my.nodeOutline(), my.nodeOutline().name, "textChild");
	    			// Highlight representant le parent
		    		my.graph().selectAll("g.cell.child")
		    		// Si la liste des parents du noeud n courant 
		            // contient le parent sur lequel on est alors on l'affiche
		            .filter(function(n) {
		            	var containParent = n.allParents.indexOf(my.nodeOutline());
		                return containParent === -1;
		            })
		            .style("opacity", "0.2");
	    		}
	    		else{
	    			// Highlight
		    		my.graph().selectAll("g.cell.child")
		    		// Si la liste des parents du noeud n courant 
		            // contient le parent sur lequel on est alors on l'affiche
		            .filter(function(n) {
		                return n != my.nodeOutline();
		            })
		            .style("opacity", "0.2");
	    		}
			}
			my.updateFirstParents(my.node().depth + 1, my.node());
			if(my.leaf()){
    			my.startUpdateMove(my.leaf());
    		}
		}
		else{
			my.updateFirstParents(1);
		}
		my.updateChildren();
	};
	
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

		t.select("textChild")
		.attr("x", function(d) { return kx * d.dx / 2; })
		.attr("y", function(d) { return ky * d.dy / 2; })
		.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
	};
	
	my.drawFirstParents = function(parents){
		var graph = my.graph();
		
		// Parents
		var parents = graph.selectAll(".cell.parent")
		.data(parents)
		.enter().append("g")
		.attr("class", "cell parent")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		
		graph.selectAll(".cell.parent")
		.append("rect")
		.attr("id", function(d){
			d.id = d.name + "_" + (d.parent ? d.parent.name : "root");
			return d.id;
		})
		.attr("width", function(d) { return d.dx - 1; })
		.attr("height", function(d) { return d.dy - 1; })
		.style("stroke", "black")
		.style("fill", "none")
		.style("stroke-width", "border")
		.style("display", function(d){
			if(d.depth === 1){
				return "";
			}
			else{
				return "none";
			}
		});
		
		graph.selectAll(".cell.parent")
		.append("text")
		.attr("class", "textFirstParent")
		.attr("text-anchor", "middle")
		.text(function(d){
			return d.name;
		})
		.attr("x", function(d) { return d.dx - (d.name.length * 5); })
		.attr("y", function(d) { return d.dy - 5; })
		.style("opacity", function(d) { 
			w = this.getComputedTextLength(); 
			return (d.x + d.dx) - d.x > w ? 1 : 0; 
		})
		.style("display", function(d){
			if(d.depth === 1){
				return "";
			}
			else{
				return "none";
			}
		});
		
	};
	
	my.updateFirstParents = function (depth, node) {
        // Redefinition des rectangles
        var kx = my.width() / my.node().dx;
        var ky = my.height() / my.node().dy;
        my.x().domain([my.node().x, my.node().x + my.node().dx]);
        my.y().domain([my.node().y, my.node().y + my.node().dy]);

        var t = d3.selectAll(".cell.parent").transition()
                .attr("transform", function (d) {
                    return "translate(" + my.x()(d.x) + "," + my.y()(d.y) + ")";
                });

        d3.selectAll(".cell.parent rect")
                .attr("width", function (d) {
                    return kx * d.dx - 1;
                })
                .attr("height", function (d) {
                    return ky * d.dy - 1;
                })
                .style("display", function (d) {
                    if (node) {
                        if(d.allParents){
                            if(d.allParents.indexOf(node) !== -1
                                && d.children && d.depth === depth){
                                return "";
                            }
                            else{
                                return "none";
                            }
                        }
                        else{
                            return "none";
                        }
                    }
                    else{
                        if (d.depth === depth) {
                            return "";
                        }
                        else {
                            return "none";
                        }
                    }
                });

        my.graph().selectAll(".textFirstParent")
        .attr("x", function (d) {
        	return kx * d.dx - (d.name.length * 5);
        })
        .attr("y", function (d) {
        	return ky * d.dy - 5;
        })
        .style("display", function (d) {
        	if (node) {
        		if(d.allParents){
        			if(d.allParents.indexOf(node) !== -1
        					&& d.children && d.depth === depth){
        				return "";
        			}
        			else{
        				return "none";
        			}
        		}
        		else{
        			return "none";
        		}
        	}
        	else{
        		if (d.depth === depth) {
        			return "";
        		}
        		else {
        			return "none";
        		}
        	}
        })
        .style("opacity", function (d) {
        	w = this.getComputedTextLength();
        	return (d.x + d.dx) - d.x > w ? 1 : 0;
        });
    };
			
	/*
     * Cette methode encadre et affiche le nom
     * du parent de node passe en parametre
     */
	my.drawOutline = function(node, nameText, nameClassText){
		// Encadrement representant le parent
		var pathinfo = [];
		var nodeId;
		
		if(node.children){
			nodeId = node.id;
		}
		else{
			nodeId = node.parent.id;
			firstParent = node.parent;
		}
		
		my.graph().select("#" + nodeId)
		.attr("width", function(d) { 
			pathinfo.push({
				x: d.x,
				y: d.y
			})
			pathinfo.push({
				x: d.x + d.dx,
				y: d.y
			})
			pathinfo.push({
				x: d.x + d.dx,
				y: d.y + d.dy
			})
			pathinfo.push({
				x: d.x,
				y: d.y + d.dy
			})
			return d.dx - 1; 
		})
		.attr("height", function(d) { return d.dy - 1; })
		.style("display", "");
		
		// Affichage du titre
		var translationX;
		var translationY;
		translationX = margin + (pathinfo[0].x + ((pathinfo[1].x - pathinfo[0].x) / 2));
		translationY = margin + (pathinfo[0].y + ((pathinfo[1].y - pathinfo[0].y) / 2)) - 3;
		
		my.svg().append("svg:text")
		.attr("class", nameClassText)
		.attr("text-anchor", "middle")
		.text(nameText)
		.attr("transform", "translate(" + translationX + "," + translationY + ")")
		.style("opacity", function() { 
			w = this.getComputedTextLength(); 
			return pathinfo[1].x - pathinfo[0].x > w ? 1 : 0; 
		});
		
		my.pathinfo(pathinfo);
	};
	
	/*
     * Cette methode affiche une etiquette
     */
	my.drawTooltip = function(node){
		var pathinfo = my.pathinfo();
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
                        	console.log("icicicic");
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
        
        var widthScreen = getWidth();
        var isMobile = my.isMobile();
        // On redefinit le tooltip en fonction du device
        if((widthScreen > 321 && widthScreen < 1024) && isMobile){
        	if(pathinfo[0].x > 180){
                my.tooltip()
                        .style("left", (pathinfo[0].x - 180 + my.margin() - 20) + "px")
            }
            else {
                my.tooltip()
                        .style("left", (pathinfo[1].x + my.margin() + 20) + "px")
            }
        }
        else{
        	if(pathinfo[0].x > 100){
                my.tooltip()
                        .style("left", (pathinfo[0].x - my.margin()) + "px")
            }
            else {
                my.tooltip()
                        .style("left", (pathinfo[1].x + my.margin() + 20) + "px")
            }
        }
        
        my.tooltip().style("display", "");
        my.tooltip().html(html);
	}
	
	/*
     * Cette methode applique les etiquettes
     * lorsqu'on se deplace sur la visualisation
     */
    my.updateMove = function (container, event, eventEnd, onDesktop) {
    	container.on(event, function (d) {
    		// Cas SmartPhone, Tablette, ...
    		if(my.isMobile()){
    			// Si le tooltip est affiche
    			if(my.tooltip().style("display") !== "none"){
    				var opacity = my.graph().selectAll("g.cell.child") .filter(function(n) {
        				return n.allParents.indexOf(d.parent) !== -1;
        			}).style("opacity");
    				// Si le noeud sur lequel on a clique n'appartient
    				// pas au bloc de noeud qui etait selectionne
        			if(opacity != 1){
        				my.endUpdateMove();
        			}
    			}
    		}
    			
    		my.startUpdateMove(d);
        })
        .on(eventEnd, function () {
        	// Evenement utilise uniquement sur PC
        	my.endUpdateMove();
        });
    };
    
    my.startUpdateMove = function(d){
		// Suppression du contour et du texte
		my.remove();
		var listChildren = [];
		// Highlight representant le parent
		my.graph().selectAll("g.cell.child")
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
		my.drawOutline(d, d.parent.name, "textParent");
		
		// On dessine le tooltip seulement si
		// on n'est pas sur le zoom
		if(my.node() === my.root()){
			my.drawTooltip(d);
		}
		else{
			if(d.parent !== my.node()){
				my.graph().selectAll("g.cell.child text")
				.filter(function(n){
					return listChildren.indexOf(n) !== -1;
				})
				.style("display", "none");

				my.drawTooltip(d);
			}
		}
    };
    
    my.endUpdateMove = function(){
		my.tooltip().style("display", "none");
		
		// Suppression de highlight
		my.graph().selectAll("g.cell.child")
		.style("opacity", "1");
		
		// Suppression du contour et du texte
		d3.selectAll(".numText").remove();
		d3.select(".textParent").remove();
		
		// On redessine les premiers parents
		if(my.node() === my.root()){
			my.updateFirstParents(1);
		}
		else{
			my.updateFirstParents(my.node().depth + 1, my.node());
		}
	};
	
	return my;

}
;