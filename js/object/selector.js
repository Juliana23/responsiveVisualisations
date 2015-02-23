/**
 * <b>Responsive Selector For d3js library :</b><br/>
 * <br/>
 * Responive selector allows you to create selector to show details.
 * Selector element will be responsive and you don't need to take care to
 * the size and position of them. <br/>
 * To instantiate one, you need to set the following parameters into a json object :<br/>
 * <b>g</b> : g element used to draw selector (required)<br/>
 * <b>depth</b> : depth of visualization (default 1)<br/>
 * <b>layout</b> : layout treemap (required)<br/>
 * <b>parentsCls</b> : css class for parents nodes (default cell parent)<br/>
 * <b>childrenCls</b> : css class for children nodes (required)<br/>
 * <b>node</b> : current node (required)<br/>
 * <b>root</b> : root node of data (required)<br/>
 * <b>autoresize</b>  : indicate if resize is automatically done (default false)<br/>
 * <br/>
 * <b>Example:</b><br/>
 * var selector = new ResponsiveSelector({<br/>
 *      &nbsp;&nbsp;&nbsp;g: g,<br/>
 *      &nbsp;&nbsp;&nbsp;layout: my.treemap(),<br/>
 *      &nbsp;&nbsp;&nbsp;parentsCls: "cell parent",<br/>
 *      &nbsp;&nbsp;&nbsp;childrenCls: "cell child",<br/>
 *      &nbsp;&nbsp;&nbsp;node: node,<br/>
 *      &nbsp;&nbsp;&nbsp;root: root,<br/>
 *      &nbsp;&nbsp;&nbsp;autoresize: false,<br/>
 *  })();<br/>
 *  <br/>
 * @class ResponsiveSelector
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveSelector(options) {
    options = {
		/**
         * g element used to draw selector<br/>
         * Read with : selector.g()<br/>
         * Write with : selector.g(newValue)<br/>
         * 
         * @attribute g
         * @public
         * @required
         * @type Object
         */
        g: options.g,
        /**
         * Depth of current parents node<br/>
         * Read with : selector.depth()<br/>
         * Write with : selector.depth(newValue)<br/>
         * 
         * @attribute depth
         * @public
         * @required
         * @type Integer
         */
        depth: options.depth || 1,
        /**
         * Layout to get data<br/>
         * Read with : selector.layout()<br/>
         * Write with : selector.layout(newValue)<br/>
         * 
         * @attribute layout
         * @public
         * @required
         * @type Object
         */
        layout : options.layout,
        /**
         * ParentCls class to apply on parent nodes<br/>
         * Read with : selector.parentsCls()<br/>
         * Write with : selector.parentsCls(newValue)<br/>
         * 
         * @attribute parentsCls
         * @public
         * @required
         * @type String
         */
        parentsCls: options.parentsCls || "cell parent",
        /**
         * ChildrenCls class to apply on children nodes<br/>
         * Read with : selector.childrenCls()<br/>
         * Write with : selector.childrenCls(newValue)<br/>
         * 
         * @attribute childrenCls
         * @public
         * @required
         * @type String
         */
        childrenCls: options.childrenCls,
        /**
         * Node element used to draw selector<br/>
         * Read with : selector.node()<br/>
         * Write with : selector.node(newValue)<br/>
         * 
         * @attribute node
         * @public
         * @required
         * @type Object
         */
        node: options.node,
        /**
         * Root element used to draw selector<br/>
         * Read with : selector.root()<br/>
         * Write with : selector.root(newValue)<br/>
         * 
         * @attribute root
         * @public
         * @required
         * @type Object
         */
        root: options.root,
        /**
         * Indicate if resize is automatically done<br/>
         * Read with : selector.autoresize()<br/>
         * Write with : selector.autoresize(newValue)<br/>
         * 
         * @attribute autoresize
         * @public
         * @type Boolean
         * @default false
         */
        autoresize: options.autoresize || false,
        /**
         * List of events attached<br/>
         * Read with : selector.events()<br/>
         * 
         * @attribute events
         * @private
         * @type Object
         * @readonly
         */
        events: {}
    };

    /**
     * ResponsiveTooltip Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);

        // Create d3js selector properties
        my.initProperties();

        // Add events to current object
        my.addDefaultEvents();

        // Add resize event
        if (my.autoresize()) {
        	$$ResponsiveUtil.addResizeEvent(my.redraw);
        }

        return my;
    }

    /**
     * Method to attach custom event
     * 
     * @method on
     * @public
     * @param {Object} event event to add
     * @param {Function} func function to call on event triggered
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
     * 
     * @method trigger
     * @public
     * @param {Object} event event to trigger
     * @param {Object} args arguments to apply to the function called
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
     * Method to remove function on event
     * 
     * @method remove
     * @public
     * @param {Object} event event to clear
     * @param {Function} func function to remove
     */
    my.remove = function (event, func) {
        if (my.events()[event].indexOf(func) !== -1) {
            // Remove function on the event
            my.events()[event].remove(func);
        }
    };

    /**
     * Add default events to current object
     * 
     * @method addDefaultEvents
     * @private
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
     * This method init properties for selector
     * 
     * @method initProperties
     * @private
     */
    my.initProperties = function () {
        var container = my.initContainer();
        var parents = my.initData();
        var gap = my.initRatio(container);

        var properties = {
            parents: parents,
            container: container,
            gap: gap
        };
        // Generate getters and setters for properties
        $$ResponsiveUtil.generateAccessors(my, properties);
    };
    
    /**
     * Retrieve the parent container of g element
     * 
     * @method initContainer
     * @private
     * @return {HTMLElement} parent container of g element
     */
    my.initContainer = function () {
        // Set id to g element in order to select it
        if(!my.g().node().id){
            my.g().node().id = my.id;
        }
        var el = document.getElementById(my.g().node().id);
        return el.parentNode;
    };
    
    /**
     * Initialize gap : the difference between container size and current graph size
     * 
     * @method initRatio
     * @private
     * @param {Object} container the g container
     * @return {Object} gap
     */
    my.initRatio = function (container) {
        var height = container.clientHeight || container.getBoundingClientRect().height;
        var width = container.clientWidth || container.getBoundingClientRect().width;
        
        return {
            height: height - my.g().attr("height"),
            width: width - my.g().attr("width")
        };
    };
    
    /**
     * Initialize data to put element allParents on children
     * 
     * @method initData
     * @private
     * @return {Object} data created by the function
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
            var reg = new RegExp("[^A-Za-zàéèù]","g");
            var id = d.name.replace(reg, "") + "_" + (d.parent ? d.parent.name.replace(reg, "") : "root");
            d["id"] = id;
        });
        
        return parents;
    };
    
    /**
     * Method to init first parents outline
     * 
     * @method drawFirstParents
     * @public
     */
    my.drawFirstParents = function () {
    	// Class of parents
        var classes = my.parentsCls().split(' ').join('.');
        
        // Parents container
        my.g().selectAll("." + classes)
                .data(my.parents())
                .enter().append("g")
                .attr("class", my.parentsCls())
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

        // Parents rectangles
        my.g().selectAll("." + classes)
                .append("rect")
                .attr("id", function (d) {
                    d.id = d.id;
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

        // Parents texts
        my.g().selectAll("." + classes)
                .append("text")
                .attr("class", "textFirstParent")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.name;
                })
                .attr("x", function (d) {
                	w = this.getComputedTextLength();
                    return d.dx - (w/2);
                })
                .attr("y", function (d) {
                    return d.dy - 5;
                })
                .style("display", function (d) {
                    if (d.depth === my.depth()) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                })
                .style("opacity", function (d) {
                    w = this.getComputedTextLength();
                    return (d.x + d.dx) - d.x > w ? 1 : 0;
                });
    };

    /**
     * Method to draw title of first parent
     * 
     * @method drawTitleFirstParents
     * @public
     */
    my.drawTitleFirstParents = function () {
    	var cSize = my.getContainerSize();
        var titleParent = my.g()
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
                    return (cSize.width / 2);
                })
                .attr("y", function () {
                    return - (my.gap().height / 4);
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
     * Method to update first parents outline
     * 
     * @method updateFirstParents
     * @public
     */
    my.updateFirstParents = function () {    	
    	// Class of parents
    	var classes = my.parentsCls().split(' ').join('.');
    	
    	// Parents container
    	my.g().selectAll("." + classes)
    	.attr("transform", function (d) {
    		return "translate(" + d.x + "," + d.y + ")";
    	});

    	// Parents rectangles
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

    	// Parents texts
    	my.g().selectAll("." + classes + " text")
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
    	})
    	.attr("x", function (d) {
    		w = this.getComputedTextLength();
            return d.dx - (w/2);
    	})
    	.attr("y", function (d) {
    		return d.dy - 5;
    	})
    	.style("opacity", function (d) {
    		w = this.getComputedTextLength();
    		return (d.x + d.dx) - d.x > w ? 1 : 0;
    	});
    };

    /**
     * Method to update first parents title
     * 
     * @method updateTitleFirstParents
     * @public
     */
    my.updateTitleFirstParents = function () {
    	var cSize = my.getContainerSize();
        d3.selectAll(".titleParent text")
        		.attr("x", function () {
                    return (cSize.width / 2);
                })
                .attr("y", function () {
                    return - (my.gap().height / 4);
                })
                .style("display", function (d) {
                    if (d === my.node()) {
                        return "";
                    }
                    else {
                        return "none";
                    }
                });
    };

    /**
     * Method to update attribute depth, node
     * 
     * @method update
     * @param {Object} node node to update
     * @public
     */
    my.update = function (node) {
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
     * Get the container size
     * 
     * @method getContainerSize
     * @public
     * @return {Object} size into json object {height: h, width: w}
     */
    my.getContainerSize = function () {
        var height = my.container().clientHeight || my.container().getBoundingClientRect().height;
        var width = my.container().clientWidth || my.container().getBoundingClientRect().width;

        return {
            height: height - my.gap().height,
            width: width - my.gap().width
        };
    };
    
    /**
     * Method to draw the outline
     * 
     * @method drawOutline
     * @param {Object} node node to draw the outline
     * @param {String} nameText text for the outline
     * @pram {String} nameClassText class to apply
     * @public
     */
    my.drawOutline = function(node, nameText, nameClassText){
		var pathinfo = [];
		var nodeId;
		
		if(node.children){
			nodeId = node.id;
		}
		else{
			nodeId = node.parent.id;
		}
		
		d3.selectAll(".titleParent text")
		.style("display", "none");
		
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
		
		// Draw the title
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
     * Method to draw the selector
     * 
     * @method draw
     * @public
     */
    my.draw = function () {
		my.trigger("drawTitleFirstParents");
		my.trigger("drawFirstParents");
    };
    
    /**
     * Method to draw the outline of node
     * 
     * @method drawOnNode
     * @param {Object} node node to draw the outline
     * @public
     */
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
     * Method to redraw the selector
     * on a changed node
     * 
     * @method redraw
     * @param {Object} node node to draw the selector
     * @public
     */
    my.redraw = function (node) {
    	my.trigger("hide");
    	my.update(node);
    	my.trigger("updateTitleFirstParents");
		my.trigger("updateFirstParents");
    };

    /**
     * Method to hide all on selector
     * 
     * @method hide
     * @public
     */
    my.hide = function () {    	
    	my.g().selectAll(".textFirstParent")
		.style("display", "none");
    	
    	my.g().selectAll(".textOnNode")
		.style("display", "none");
    };
    
    /**
     * Method to hide all on node
     * 
     * @method hideOnNode
     * @public
     */
    my.hideOnNode = function () {    	
    	my.g().selectAll(".textOnNode")
		.style("display", "none");
    };

    /**
     * Method called on window resize event
     * 
     * @method hide
     * @public
     */
    my.resize = function () {
        my.redraw();
    };

    return my;
}