/**
 * <b>Responsive Tooltip For d3js library :</b><br/>
 * <br/>
 * Responive tooltip allows you to create tooltip to show details.
 * Tooltip element will be responsive and you don't need to take care to
 * the size and position of them. <br/>
 * To instantiate one, you need to set the following parameters into a json object :<br/>
 * <b>g</b> : g element used to draw tooltip (required)<br/>
 * <b>cls</b> : css class for axis<br/>
 * <b>autoresize</b>  : indicate if resize is automatically done (default false)<br/>
 * <br/>
 * <b>Example:</b><br/>
 * var tooltip = new ResponsiveTooltip({<br/>
 *      &nbsp;&nbsp;&nbsp;g: g,<br/>
 *      &nbsp;&nbsp;&nbsp;cls: "fixed_tooltip",<br/>
 *  })();<br/>
 *  <br/>
 * @class ResponsiveTooltip
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveTooltip(options) {
    options = {
        /**
         * g element used to draw tooltip<br/>
         * Read with : tooltip.g()<br/>
         * Write with : tooltip.g(newValue)<br/>
         * 
         * @attribute g
         * @public
         * @required
         * @type Object
         */
        g: options.g,
        data: options.data,
        /**
         * Css class to apply on tooltip<br/>
         * Read with : tooltip.cls()<br/>
         * Write with : tooltip.cls(newValue)<br/>
         * 
         * @attribute cls
         * @public
         * @type String
         */
        cls: options.cls.concat(" responsive"),
        /**
         * Indicate if resize is automatically done<br/>
         * Read with : tooltip.autoresize()<br/>
         * Write with : tooltip.autoresize(newValue)<br/>
         * 
         * @attribute autoresize
         * @public
         * @type Boolean
         * @default false
         */
        autoresize: options.autoresize || false,
        /**
         * List of events attached <br/>
         * Read with : tooltip.events()<br/>
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
    	if (arguments) {
            // Get the event triggered
            var event = Array.prototype.shift.apply(arguments);
            arguments = Array.prototype.slice.call(arguments);
            // Flatten arguments
            var argumentsMerged = [];
            var indice = 0;
            for (var i = 0; i < arguments.length; i++) {
            	if(typeof(arguments[i]) === "object" && arguments[i].lenght > 0){
            		for(var j = 0; j < arguments[i].length; j++){
                		argumentsMerged[indice] = arguments[i][j];
                		indice++;
                	}
            	}
            	else{
            		argumentsMerged = arguments;
            	}
            }
            if (my.events()[event]) {
                for (var i = 0; i < my.events()[event].length; i++) {
                    // Call the function related to the event
                    my.events()[event][i].apply(my.events()[event][i], argumentsMerged);
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
        my.on("redraw", my.draw);
        my.on("hide", my.hide);
    };

    /**
     * This method init properties for tooltip
     * 
     * @method initProperties
     * @private
     */
    my.initProperties = function () {
        var width = my.initWidth();
        var container = my.initContainer();
        var gap = my.initRatio(container);
        var tooltip = my.initTooltip(width);
        
        var properties = {
            tooltip : tooltip,
            container : container,
            gap : gap,
            width : width
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
        if (!my.g().node().id) {
            my.g().node().id = my.id;
        }
        var el = document.getElementById(my.g().node().id);
        return el.parentNode;
    };
    
    /**
     * Initialize container for tooltip
     * 
     * @method initTooltip
     * @private
     * @param {String} width width of tooltip
     * @return {Object} tooltip container created
     */
    my.initTooltip = function (width) {
        var tooltip = d3.select("body")
                .append("div")
                .attr("class", my.cls())
                .attr("x", width)
                .attr("y", 0)
                .style("display", "none");

        return tooltip;
    };


    /**
     * Initialize width container for tooltip
     * 
     * @method initWidth
     * @private
     * @return {String} tooltip width
     */
    my.initWidth = function () {
        var isMobile = $$ResponsiveUtil.mobile();
        var widthScreen = $$ResponsiveUtil.getWidth();
        var width;
        var regex = /([0-9]*)/;

        if (((widthScreen > $$ResponsiveConstants._XSMIN_() && widthScreen < $$ResponsiveConstants._XSMAX_())
                || (widthScreen > $$ResponsiveConstants._SMMIN_() && widthScreen < $$ResponsiveConstants._SMMAX_()))
                && isMobile) {
            width = $$ResponsiveConstants._XSWIDTH_();
        }
        else {
            width = $$ResponsiveConstants._SMWIDTH_();
        }
        width = width.match(regex)[0];
        return width;
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
     * Get the container tooltip height
     * 
     * @method getHeight
     * @private
     * @return {String} height of clientHeight tooltip container
     */
    my.getHeight = function () {
        var classes = my.cls().split(' ').join('.');
        var el = d3.select("." + classes).node();
        return el.clientHeight || el.getBoundingClientRect().height;
    };
    
    /**
     * Get the container tooltip width
     * 
     * @method getWidth
     * @private
     * @return {String} width of clientWidth tooltip container
     */
    my.getWidth = function () {
        var classes = my.cls().split(' ').join('.');
        var el = d3.select("." + classes).node();
        return el.clientWidth || el.getBoundingClientRect().width;
    };

    /**
     * Get if the tooltip is drawn
     * 
     * @method getIsDrawn
     * @private
     * @return {Boolean} true if the tooltip is drawn
     */
    my.getIsDrawn = function () {
        if (my.tooltip().style("display") !== "none") {
            return true;
        }
        return false;
    };
    
    /**
     * Get the container g position
     * 
     * @method getGPosition
     * @private
     * @return {Object} position into json object {x: vx, y: vy}
     */
    my.getGPosition = function () {
        var pos = d3.transform(my.g().attr("transform")).translate;
        return {
            x: pos[0],
            y: pos[1]
        };
    };

    /**
     * Get the container tooltip position
     * 
     * @method getTooltipPosition
     * @private
     * @param {String} width width of g 
     * @param {String} height height of g
     * @return {Object} position into json object {tooltipLeft: tl, tooltipTop: tp}
     */
    my.getTooltipPosition = function (width, height) {
        var xMin;
        var xMax;
        var yMin;
        var yMax;
        var tooltipTop;
        var tooltipLeft;
        var gPosition = my.getGPosition();
        var tooltipHeight = my.getHeight();
        var tooltipWidth = my.width();

    	var cursor = $$ResponsiveUtil.getCursorPosition();
    	var posX = cursor.x;
        var posY = cursor.y;
        xMin = posX - tooltipWidth - gPosition.x - 50;
        xMax = posX + gPosition.x + 50;
        yMin = posY;
        yMax = posY;

        // Reset tooltip position

        // Check if the tooltip can be displayed center to the cursor
        if (height - yMin >= tooltipHeight / 2 && yMin >= tooltipHeight / 2) {
            tooltipTop = (yMin - tooltipHeight / 2);
        }
        // Check if the tooltip can be displayed under the cursor 
        else if (yMin <= tooltipHeight / 2 && tooltipHeight <= height - yMin) {
            tooltipTop = yMin;
        }
        // Check if the tooltip can be displayed upper the cursor
        else if (yMin > tooltipHeight) {
            tooltipTop = (yMin - tooltipHeight);
        }
        // Default case : displayed the tooltip to 0
        else {
            tooltipTop = 0;
        }
        
        // Check if the tooltip height can be in visualization
        if(tooltipHeight > height){
        	var nbColumn = 1;
        	while(tooltipHeight > height){
        		nbColumn++;
        		tooltipHeight = tooltipHeight / 2;
        	}
        	var classes = my.cls().split(' ').join('.');
        	d3.select("." + classes)
        	.style("-webkit-column-count", nbColumn)
        	.style("-moz-column-count", nbColumn)
        	.style("column-count", nbColumn);
        	
        	tooltipWidth = my.getWidth();
        	xMin = posX - tooltipWidth - gPosition.x - 50;
        	tooltipTop = 0;
        }

        // Reset tooltip position
        if (xMin > 0) {
            tooltipLeft = xMin;
        }
        else {
            tooltipLeft = xMax;
        }

        return {
            tooltipTop: tooltipTop,
            tooltipLeft: tooltipLeft
        };
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
     * Method that draws tooltip :<br/>
     * Updates :<br/>
     *  - the data of tooltip
     *  - the tooltip position (automatically recalculated)
     * 
     * @method draw
     * @public
     * @param {String} data content of tooltip
     */
    my.draw = function (data) {
        my.data(data);
        // Get container size to give a tooltip position
        var cSize = my.getContainerSize();
        var height = cSize.height;
        var width = cSize.width;
    	
        my.tooltip().style("display", "");
        my.tooltip().html(my.data());
        
        var classes = my.cls().split(' ').join('.');
        d3.select("." + classes)
    	.style("-webkit-column-count", 1)
    	.style("-moz-column-count", 1)
    	.style("column-count", 1);
        
        var tooltipPosition = my.getTooltipPosition(width, height);
        my.tooltip()
                .style("left", tooltipPosition.tooltipLeft + "px")
                .style("top", tooltipPosition.tooltipTop + "px");
    };

    /**
     * Method to hide tooltip object
     * @method hide
     * @public
     */
    my.hide = function () {
        my.tooltip().style("display", "none");
    };

    return my;
}