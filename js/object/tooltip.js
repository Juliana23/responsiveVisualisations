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
        var tooltip = my.initTooltip(width);

        var properties = {
            tooltip: tooltip,
            container: container,
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

        if (((widthScreen > $$ResponsiveUtil._XSMIN_ && widthScreen < $$ResponsiveUtil._XSMAX_)
                || (widthScreen > $$ResponsiveUtil._SMMIN_ && widthScreen < $$ResponsiveUtil._SMMAX_))
                && isMobile) {
            width = $$ResponsiveUtil._XSWIDTH_;
        }
        else {
            width = $$ResponsiveUtil._SMWIDTH_;
        }
        return width;
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
     * Get the tooltip position
     * @returns json object
     */
    my.getTooltipPosition = function (width, height, position) {
        var e = window.event;
        var xMin;
        var xMax;
        var yMin;
        var yMax;

        var tooltipTop;
        var tooltipLeft;

        if (position) {
            xMin = position.xMin - my.width() - 50;
            xMax = position.xMax + 50;
            yMin = position.yMin;
            yMax = position.yMax;
        }
        else {
        	var cursor = $$ResponsiveUtil.getCursorPosition();
        	var posX = cursor.x;
            var posY = cursor.y;
            
            xMin = posX - my.width() - 50;
            xMax = posX + 50;
            yMin = posY;
            yMax = posY;
        }

        // Reset tooltip position
        var tooltipHeight = my.getHeight();

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
     * Get the graph container size
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