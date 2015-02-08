/* 
 * Responsive Axis For d3js library

 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */

/**
 * Create a responsive axis
 * @param json object options :
 * g : graph
 * size : size of axis in px
 * orientation : top, bottom, left, right
 * datatype : type of data to display on axis
 * domain : array of values to display on axis
 * cls : css class for axis
 * autoresize : indicate if resize is automatically done
 */
function ResponsiveAxis(options) {
    options = {
        g: options.g,
        size: 0,
        orientation: options.orientation || $$ResponsiveUtil._BOTTOM_,
        datatype: options.datatype,
        domain: options.domain,
        cls: options.cls ? options.cls.concat(" responsive") : "responsive",
        autoresize: options.autoresize || false,
        fixedHeight: options.fixedHeight || false,
        events: {}
    };

    /**
     * Constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);

        // Create d3js axis properties
        my.initProperties();

        my.updateSize();
        my.updateRange();
        
        // Add events to current object
        my.addDefaultEvents();

        // Add axis to g
        my.draw();
        
        // Add resize event
        if(my.autoresize()){
            $$ResponsiveUtil.addResizeEvent(my.draw);
        }

        return my;
    }
    
    /**
     * Method to attach custom event
     * @param the event to add
     * @param the function to call on event triggered
     */
    my.on = function (event, func) {
    	if(!my.events()[event]){
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
    	if(my.events()[event].indexOf(func) !== -1){
    		// Remove function on the event
            my.events()[event].remove(func);
    	}
    };
    
    /**
     * Add default events to current object
     */
    my.addDefaultEvents = function () {
        my.on("redraw", my.draw);
    };
    
    /**
     * This method init properties for axis
     */
    my.initProperties = function () {
        var data = my.initData();
        var axis = my.initAxis(data);
        var container = my.initContainer();
        var gap = my.initRatio(container);

        var properties = {
            data: data,
            axis: axis,
            container: container,
            gap: gap
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
        if(!my.g().node().id){
            my.g().node().id = my.id;
        }
        var el = document.getElementById(my.g().node().id);
        return el.parentNode;
    };

    /**
     * Init data to display on axis
     * @return object data
     */
    my.initData = function () {
        var data;

        // Init scale
        if (my.datatype() === $$ResponsiveUtil._YEAR_
                || my.datatype() === $$ResponsiveUtil._MONTH_
                || my.datatype() === $$ResponsiveUtil._DAY_) {
            data = d3.time.scale().nice(d3.time[my.datatype()]);
        }
        else {
            data = d3.scale.linear().nice();
        }

        // Init domain
        if (my.domain()) {
            data = data.domain(my.domain());
        }

        return data;
    };

    /**
     * Init axis
     * @param object data
     * @return object axis
     */
    my.initAxis = function (data) {
        var axis = d3.svg.axis().scale(data).orient(my.orientation());
        return axis;
    };

    /**
     * Init gap
     * @return object gap
     */
    my.initRatio = function (container) {
        var height = d3.select(container).attr("height");
        var width = d3.select(container).attr("width");
        console.log("==============================");
        console.log(height);
        console.log(my.g().attr("height"));
        var gap = {
            height: (height ? height : container.clientHeight) - my.g().attr("height"),
            width: (width ? width : container.clientWidth) - my.g().attr("width")
        };
        return gap;
    };
    
    /**
     * Update gap
     */
    my.updateHeightRatio = function () {
        var height = d3.select(my.container()).attr("height");
        my.gap().height = (height ? height : my.container().clientHeight) - my.g().attr("height");
    };

    /**
     * This method update range of axis
     */
    my.updateRange = function () {
        // Horizontal Axis
        if (my.orientation() === $$ResponsiveUtil._BOTTOM_
                || my.orientation() === $$ResponsiveUtil._TOP_) {
            my.data().range([0, my.size()]);
        }
        // Vertical Axis
        else {
            my.data().range([my.size(), 0]);
        }
    };

    /**
     * This method update axis size
     * in function of container size
     * @param json size of container
     */
    my.updateSize = function (cSize) {
        if(!cSize){
            cSize = my.getContainerSize();
        }
        // Horizontal Axis
        if (my.orientation() === $$ResponsiveUtil._BOTTOM_
                || my.orientation() === $$ResponsiveUtil._TOP_) {
            my.size(cSize.width);
        }
        // Vertical Axis
        else {
            my.size(cSize.height);
        }
    };
    
    /**
     * This method update the quantity of information
     * display on the axis
     */
    my.updateAxisTicks = function () {
        var size = $$ResponsiveUtil.getHeight();
        // Horizontal
        if (my.orientation() === $$ResponsiveUtil._BOTTOM_
                || my.orientation() === $$ResponsiveUtil._TOP_) {
            size = $$ResponsiveUtil.getWidth();
        }
        
        if (size > 768) {
            my.axis().ticks(Math.max(my.size() / 100, 2));
        }
        else if (size <= 768) {
            my.axis().ticks(Math.max(my.size() / 150, 2));
        }
        else if (size <= 480) {
            my.axis().ticks(Math.max(my.size() / 200, 2));
        }
        else if (size <= 320) {
            my.axis().ticks(Math.max(my.size() / 300, 2));
        }
    };

    /**
     * Get the axis container size
     * @returns json object
     */
    my.getContainerSize = function () {
        var height = d3.select(my.container()).attr("height");
        var width = d3.select(my.container()).attr("width");
        return {
            height: (height ? height : my.container().clientHeight) - my.gap().height,
            width: (width ? width : my.container().clientWidth) - my.gap().width
        };
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
     * Draw axis on g
     */
    my.draw = function () {
        // Reset Sizes
        if(my.fixedHeight()){
            my.updateHeightRatio();
        }
        
        var cSize = my.getContainerSize();
        my.updateSize(cSize);
        my.updateRange();
        
        // Get container
        var classes = my.cls().split(' ').join('.');
        var g = d3.select("." + classes);
        if (g[0][0] === null) {
            g = my.g().append("g");

            // Add css class
            if (my.cls()) {
                g.attr("class", my.cls());
            }
        }

        // Transform axis
        my.g().attr("width", cSize.width);
        my.g().attr("height", cSize.height);
        my.updateAxisTicks();

        if (my.orientation() === $$ResponsiveUtil._BOTTOM_) {
            g.attr("transform", "translate(0," + cSize.height + ")");
        }
        else if (my.orientation() === $$ResponsiveUtil._LEFT_) {
            g.attr("transform", "rotate(0)");
        }
        if (my.orientation() === $$ResponsiveUtil._RIGHT_) {
            g.attr("transform", "rotate(-90) translate(" + cSize.width + ", 0)");
        }
        
        g.call(my.axis());
    };

    return my;
}