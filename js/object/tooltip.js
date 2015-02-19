/* 
 * Responsive Tooltip For d3js library

 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */

/**
 * Create a responsive tooltip
 * @param json object options :
 * g : graph
 * cls : css class for tooltip
 * autoresize : indicate if resize is automatically done
 */
function ResponsiveTooltip(options) {
    options = {
        g: options.g,
        data: options.data,
        cls: options.cls.concat(" responsive"),
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
        my.on("redraw", my.draw);
        my.on("hide", my.hide);
    };

    /**
     * Method to init properties for tooltip
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
     * @returns {object} container
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
     * Function to init tooltip
     * @return object tooltip
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
     * Init width
     * @return object width
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
     * Init gap
     * @return object gap
     */
    my.initRatio = function (container) {
        var height = container.clientHeight;
        var width = container.clientWidth;
        return {
            height: height - my.g().attr("height"),
            width: width - my.g().attr("width")
        };
    };

    /**
     * Get the current height of the tooltip
     * @return int the height of tooltip
     */
    my.getHeight = function () {
        var classes = my.cls().split(' ').join('.');
        var el = d3.select("." + classes).node();
        return el.clientHeight;
    };
    
    /**
     * Get the current height of the tooltip
     * @return int the height of tooltip
     */
    my.getWidth = function () {
        var classes = my.cls().split(' ').join('.');
        var el = d3.select("." + classes).node();
        return el.clientWidth;
    };

    /**
     * Function to know if the tooltip is drawn
     * @return boolean
     */
    my.getIsDrawn = function () {
        if (my.tooltip().style("display") !== "none") {
            return true;
        }
        return false;
    };
    
    /**
     * Get the axis container size
     * @returns json object
     */
    my.getGPosition = function () {
        var pos = d3.transform(my.g().attr("transform")).translate;
        return {
            x: pos[0],
            y: pos[1]
        };
    };

    /**
     * Get the tooltip position
     * @returns json object
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
     * Get the tooltip container size
     * @returns json object
     */
    my.getContainerSize = function () {
        var height = my.container().clientHeight;
        var width = my.container().clientWidth;
        return {
            height: height - my.gap().height,
            width: width - my.gap().width
        };
    };

    /**
     * Method to draw the tooltip
     */
    my.draw = function (data, position) {
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

        var tooltipPosition = my.getTooltipPosition(width, height, position);
        my.tooltip()
                .style("left", tooltipPosition.tooltipLeft + "px")
                .style("top", tooltipPosition.tooltipTop + "px");
    };

    /**
     * Method to hide the tooltip
     */
    my.hide = function () {
        my.tooltip().style("display", "none");
    };

    return my;
}
