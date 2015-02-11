/* 
 * Responsive Selector For d3js library
 
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */

/**
 * Create a responsive selector
 * @param json object options :
 * g : graph
 * cls : css class for tooltip
 * autoresize : indicate if resize is automatically done
 */
function ResponsiveSelector(options) {
    options = {
        g: options.g,
        titlePosition: options.titlePosition || 0,
        depth: options.depth || 1,
        layout : options.layout,
        parentsCls: options.parentsCls,
        childrenCls: options.childrenCls,
        node: options.node,
        root: options.root,
        autoresize: options.autoresize || false,
        events: {}
    };

    /**
     * Constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);

        // Create d3js tooltip properties
        my.initProperties();

        // Add events to current object
        my.addDefaultEvents();

        // Add resize event
        if (my.autoresize()) {
            addResizeEvent(my.resize);
        }

        return my;
    }

    /**
     * Method to attach custom event
     * @param the event to add
     * @param the function to call on event triggered
     */
    my.on = function (event, func) {
        if (!my.events()[event]) {
            my.events()[event] = [];
        }
        // Attach several function on the same event
        my.events()[event].push(func);
    };

    /**
     * Method to trigger event 
     * @param the event to trigger
     * @param the args to apply to the function called
     */
    my.trigger = function () {
        if(arguments){
            // Get the event triggered
            var event = Array.prototype.shift.apply(arguments);
            if(my.events()[event]){
            	for(var i = 0; i < my.events()[event].length; i++){
                    // Call the function related to the event
                    my.events()[event][i].apply(my.events()[event][i], arguments);
            	}
            }
        }
    };

    /**
     * Method to remove event on function
     * @param the event to clear
     * @param the function to remove
     */
    my.remove = function (event, func) {
        if (my.events()[event].indexOf(func) !== -1) {
            // Remove function on the event
            my.events()[event].remove(func);
        }
    };

    /**
     * Add default events to current object
     */
    my.addDefaultEvents = function () {
    	my.on("draw", my.draw);
    	my.on("drawOnNode", my.drawOnNode);
    	my.on("redraw", my.redraw);
        my.on("drawFirstParents", my.drawFirstParents);
        my.on("drawTitleFirstParents", my.drawTitleFirstParents);
        my.on("updateFirstParents", my.updateFirstParents);
        my.on("updateTitleFirstParents", my.updateTitleFirstParents);
        my.on("updateNode", my.updateNode);
        my.on("hide", my.hide);
        my.on("hideOnNode", my.hideOnNode);
    };

    /**
     * Method to init properties for tooltip
     */
    my.initProperties = function () {
        var container = my.initContainer();
        var parents = my.initData();

        var properties = {
            parents: parents,
            container: container
        };
        // Generate getters and setters for properties
        $$ResponsiveUtil.generateAccessors(my, properties);
    };
    
    /**
     * Retrieve the g element
     * @returns {object} container
     */
    my.initContainer = function () {
        // Set id to g element in order to select it
        if(!my.g().node().id){
            my.g().node().id = my.id;
        }
        var el = document.getElementById(my.g().node().id);
        return el;
    };
    
    /**
     * Init parents of data and put
     * element allParents on children 
     * if it doesn't exist
     * @returns {object} parents
     */
    my.initData = function() {
    	var classes = my.childrenCls().split(' ').join('.');
    	d3.selectAll("." + classes)
    		.each(function(d){
    			if(!d.hasOwnProperty("allParents")){
    				var allParents = $$ResponsiveTreeUtil.getAllParents(d);
    	        	d["allParents"] = allParents;
    			}
    		});
        var parents = my.layout().nodes(my.root())
                .filter(function (d) {
                    return d.children;
                });

        parents.forEach(function (d) {
            var allParents = $$ResponsiveTreeUtil.getAllParents(d);
            d["allParents"] = allParents;
        });
        
        return parents;
    };
    
    /**
     * Method to init first parents outline
     */
    my.drawFirstParents = function () {
        var classes = my.parentsCls().split(' ').join('.');
        // Parents
        my.g().selectAll("." + classes)
                .data(my.parents())
                .enter().append("g")
                .attr("class", my.parentsCls())
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

        my.g().selectAll("." + classes)
                .append("rect")
                .attr("id", function (d) {
                    d.id = d.name + "_" + (d.parent ? d.parent.name : "root");
                    return d.id;
                })
                .attr("width", function (d) {
                    return d.dx - 1;
                })
                .attr("height", function (d) {
                    return d.dy - 1;
                })
                .style("stroke", "black")
                .style("fill", "none")
                .style("stroke-width", "border")
                .style("display", function (d) {
                    if (d.depth === my.depth()) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                });

        my.g().selectAll("." + classes)
                .append("text")
                .attr("class", "textFirstParent")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.name;
                })
                .attr("x", function (d) {
                    return d.dx - (d.name.length * 5);
                })
                .attr("y", function (d) {
                    return d.dy - 5;
                })
                .style("opacity", function (d) {
                    w = this.getComputedTextLength();
                    return (d.x + d.dx) - d.x > w ? 1 : 0;
                })
                .style("display", function (d) {
                    if (d.depth === my.depth()) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                });
    };

    /**
     * Method to update first parents outline
     * and names
     * @param depth
     * @param node
     */
    my.updateFirstParents = function (x, y) {    	
    	 var classes = my.parentsCls().split(' ').join('.');
         // Parents
         my.g().selectAll("." + classes)
                 .attr("transform", function (d) {
                     return "translate(" + d.x + "," + d.y + ")";
                 });

         my.g().selectAll("." + classes + " rect")
		         .attr("width", function (d) {
		        	 return d.dx - 1;
		         })
		         .attr("height", function (d) {
		        	 return d.dy - 1;
		         })
                 .style("display", function (d) {
                     if (my.node()) {
                         if (d.allParents) {
                             if (d.allParents.indexOf(my.node()) !== -1
                                     && d.children && d.depth === my.depth()) {
                                 return "";
                             }
                         }
                     }
                     else {
                         if (d.depth === my.depth()) {
                             return "";
                         }
                     }
                     return "none";
                 });

         my.g().selectAll("." + classes + " text")
         		.attr("x", function (d) {
                    return d.dx - (d.name.length * 5);
                })
                .attr("y", function (d) {
                    return d.dy - 5;
                })
                 .style("opacity", function (d) {
                     w = this.getComputedTextLength();
                     return (d.x + d.dx) - d.x > w ? 1 : 0;
                 })
                 .style("display", function (d) {
                     if (my.node()) {
                         if (d.allParents) {
                             if (d.allParents.indexOf(my.node()) !== -1
                                     && d.children && d.depth === my.depth()) {
                                 return "";
                             }
                         }
                     }
                     else {
                         if (d.depth === my.depth()) {
                             return "";
                         }
                     }
                     return "none";
                 });
    };

    /**
     * Method to draw title of first parents
     */
    my.drawTitleFirstParents = function () {
        var titleParent = d3.select(my.container())
                .append("g")
                .attr("class", "title");

        titleParent.selectAll(".titleParent")
                .data(my.parents())
                .enter().append("g")
                .attr("class", "titleParent");

        titleParent.selectAll(".titleParent")
                .append("text")
                .attr("class", "textTitleParent")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.name;
                })
                .attr("x", function () {
                    return my.container().getBoundingClientRect().width / 2;
                })
                .attr("y", function () {
                    return - my.titlePosition();
                })
                .style("display", function (d) {
                    if (d.depth === 0) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                });
    };

    /**
     * Method to update first parents title
     * @param node
     */
    my.updateTitleFirstParents = function () {
        d3.selectAll(".titleParent text")
                .style("display", function (d) {
                    if (d === my.node()) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                });
    };

    my.update = function (node) {
    	var cSize = my.getContainerSize();
    	if(node){
    		my.node(node);
    	}
        
        var depth;
    	if(my.node() !== my.root()){
    		depth = my.node().depth + 1;
    	}
    	else{
    		depth = 1;
    	}
        my.depth(depth);
    };
    
    /**
     * Get the axis container size
     * @returns json object
     */
    my.getContainerSize = function () {
        var height = d3.select(my.container()).attr("height");
        var width = d3.select(my.container()).attr("width");
        return {
            height: (height ? height : my.container().clientHeight),
            width: (width ? width : my.container().clientWidth)
        };
    };
    
    /**
     * Method to draw the outline
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
		}
		
		my.g().select("#" + nodeId)
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
		translationX = (pathinfo[0].x + ((pathinfo[1].x - pathinfo[0].x) / 2));
		translationY = (pathinfo[0].y + ((pathinfo[1].y - pathinfo[0].y) / 2)) - 3;
		
		my.g().append("text")
		.attr("class", nameClassText)
		.attr("text-anchor", "middle")
		.text(nameText)
		.attr("transform", "translate(" + translationX + "," + translationY + ")")
		.style("opacity", function() { 
			w = this.getComputedTextLength(); 
			return pathinfo[1].x - pathinfo[0].x > w ? 1 : 0; 
		});
	};

    /**
     * Method to draw the tooltip
     */
    my.draw = function () {
		my.trigger("drawTitleFirstParents");
		my.trigger("drawFirstParents");
    };
    
    /**
     * Method to draw the tooltip
     */
    my.redraw = function (node) {
    	my.trigger("hideOnNode");
    	my.update(node);
    	my.trigger("updateTitleFirstParents");
		my.trigger("updateFirstParents");
    };
    
    my.drawOnNode = function (node) {
    	my.trigger("hideOnNode");
    	var classes = my.childrenCls().split(' ').join('.');
    	if(node){
    		if(node.children){
    			my.drawOutline(node, node.name, "textOnNode");
	    		my.g().selectAll("." + classes)
	            .filter(function(n) {
	            	var containParent = n.allParents.indexOf(node);
	                return containParent === -1;
	            })
	            .style("opacity", "0.2");
	    		
//				if(my.leaf()){
//	    			my.startUpdateMove(my.leaf());
//	    		}
    		}
    		else{
	    		my.g().selectAll("." + classes)
	            .filter(function(n) {
	                return n != node;
	            })
	            .style("opacity", "0.2");
    		}
		}
    };

    /**
     * Method to hide
     */
    my.hide = function () {
    	//d3.selectAll(".textParent").remove();
    	
    	my.g().selectAll(".textFirstParent")
		.style("display", "none");
    };
    
    my.hideOnNode = function () {
    	//d3.selectAll(".textParent").remove();
    	
    	my.g().selectAll(".textOnNode")
		.style("display", "none");
    };

    /**
     * Method called on window resize event
     */
    my.resize = function () {
        //my.draw();
    };

    return my;
}