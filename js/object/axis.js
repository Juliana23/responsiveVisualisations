/**
 * <b>Responsive Axis For d3js library :</b><br/>
 * <br/>
 * Responive axis allows you to create axis for timeline, line chart, ...
 * Those axis will be responsive and you don't need to take care to
 * the size of them. <br/>
 * To instanciate one, you need to set the following parameters into a json object :<br/>
 * <b>g</b> : g element used to draw chart (required)<br/>
 * <b>orientation</b> : top, bottom, left, right (default bottom)<br/>
 * <b>datatype</b> : type of data to display on axis<br/>
 * <b>domain</b> : array of values to display on axis (required)<br/>
 * <b>cls</b> : css class for axis<br/>
 * <b>autoresize</b>  : indicate if resize is automatically done (default false)<br/>
 * <b>fixedHeight</b> : indicate if the size of y axis is not resizable (default false)<br/>
 * <br/>
 * <b>Example:</b><br/>
 *  var axis = new ResponsiveAxis({<br/>
 *      &nbsp;&nbsp;&nbsp;g: graph,<br/>
 *      &nbsp;&nbsp;&nbsp;orientation: $$ResponsiveConstants._BOTTOM_,<br/>
 *      &nbsp;&nbsp;&nbsp;datatype: "year",<br/>
 *      &nbsp;&nbsp;&nbsp;cls: "x axis",<br/>
 *      &nbsp;&nbsp;&nbsp;domain: d3.extent(data, function (d) {<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return d.date;<br/>
 *      &nbsp;&nbsp;&nbsp;}),<br/>
 *      &nbsp;&nbsp;&nbsp;autoresize: false<br/>
 *  )();<br/>
 * <br/>
 * @class ResponsiveAxis
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveAxis(options) {
    
    options = {
        /**
         * g element used to draw chart<br/>
         * Read with : axis.g()<br/>
         * Write with : axis.g(newValue)<br/>
         * 
         * @attribute g
         * @public
         * @required
         * @type Object
         */
        g: options.g,
        /**
         * Size of current axis in px<br/>
         * Read with : axis.size()<br/>
         * Write with : axis.size(newValue)<br/>
         * 
         * @attribute size
         * @private
         * @type Integer
         */
        size: 0,
        /**
         * Orientation of the axis<br/>
         * Enable values : top, bottom, left, right<br/>
         * Read with : axis.orientation()<br/>
         * Write with : axis.orientation(newValue)<br/>
         * 
         * @attribute orientation
         * @public
         * @type String
         * @default bottom
         */
        orientation: options.orientation || $$ResponsiveConstants._BOTTOM_,
        /**
         * Type of data to display on axis<br/>
         * Enable values : year, month, day<br/>
         * Read with : axis.datatype()<br/>
         * Write with : axis.datatype(newValue)<br/>
         * 
         * @attribute datatype
         * @public
         * @type String
         */
        datatype: options.datatype,
        /**
         * Array of values to display on axis<br/>
         * Read with : axis.domain()<br/>
         * Write with : axis.domain(newValue)<br/>
         * 
         * @attribute domain
         * @public
         * @required
         * @type Array
         */
        domain: options.domain,
        /**
         * Css class to apply on axis<br/>
         * Read with : axis.cls()<br/>
         * Write with : axis.cls(newValue)<br/>
         * 
         * @attribute cls
         * @public
         * @type String
         */
        cls: options.cls ? options.cls.concat(" responsive") : "responsive",
        /**
         * Indicate if resize is automatically done<br/>
         * Read with : axis.autoresize()<br/>
         * Write with : axis.autoresize(newValue)<br/>
         * 
         * @attribute autoresize
         * @public
         * @type Boolean
         * @default false
         */
        autoresize: options.autoresize || false,
        /**
         * Indicate if the size of y axis is not resizable<br/>
         * Read with : axis.fixedHeight()<br/>
         * Write with : axis.fixedHeight(newValue)<br/>
         * 
         * @attribute fixedHeight
         * @public
         * @type Boolean
         * @default false
         */
        fixedHeight: options.fixedHeight || false,
        /**
         * List of events attached<br/>
         * Read with : axis.events()<br/>
         * 
         * @attribute events
         * @private
         * @type Object
         * @readonly
         */
        events: {}
    };

    /**
     * ResponsiveAxis Constructor
     *
     * @method my
     * @public
     * @constructor
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
     * 
     * @method on
     * @public
     * @param {Object} event event to add
     * @param {Function} func function to call on event triggered
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
    	if(my.events()[event].indexOf(func) !== -1){
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
    };
    
    /**
     * This method init properties for axis
     * 
     * @method initProperties
     * @private
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
     * Initialize data to display on axis
     * 
     * @method initContainer
     * @private
     * @return {Object} data created by the function
     */
    my.initData = function () {
        var data;

        // Init scale
        if (my.datatype() === $$ResponsiveConstants._YEAR_
                || my.datatype() === $$ResponsiveConstants._MONTH_
                || my.datatype() === $$ResponsiveConstants._DAY_) {
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
     * Initialize axis
     * 
     * @method initAxis
     * @private
     * @param {Object} data the data returned by initData function
     * @return {Object} axis created by the function
     */
    my.initAxis = function (data) {
        var axis = d3.svg.axis().scale(data).orient(my.orientation());
        return axis;
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
     * This method allows to update gap proportion (height and width)
     * 
     * @method updateRatio
     * @public
     * @param {Boolean} updateHeight indicate if need to update height value of gap
     * @param {Integer} value value to add to gap
     * @param {Integer} redraw indicate if axis need to be redraw
     * @return {Object} gap into json object {heigh: h, width: w}
     */
    my.updateRatio = function (updateHeight, value, redraw) {
        if(updateHeight){
            my.gap().height = my.gap().height + value;
        }
        else {
            my.gap().width = my.gap().width + value;
        }
        
        if(redraw){
            my.draw();
        }
    };
    
    /**
     * This method recalculates the height of gap
     * (used for axis that have fixed height)
     * 
     * @method updateHeightRatio
     * @private
     */
    my.updateHeightRatio = function () {
    	var height = my.container().clientHeight || my.container().getBoundingClientRect().height;
        my.gap().height = height - my.g().attr("height");
    };

    /**
     * This method update range of axis
     * 
     * @method updateHeightRatio
     * @private
     */
    my.updateRange = function () {
        // Horizontal Axis
        if (my.orientation() === $$ResponsiveConstants._BOTTOM_
                || my.orientation() === $$ResponsiveConstants._TOP_) {
            my.data().range([0, my.size()]);
        }
        // Vertical Axis
        else {
            my.data().range([my.size(), 0]);
        }
    };

    /**
     * This method updates axis size with the size sets in parameter
     * If parameter is not set, the axis is resize to the complete of container
     * 
     * @method updateHeightRatio
     * @public
     * @param {Object} cSize json size of container {height: h, width: w}
     */
    my.updateSize = function (cSize) {
        if(!cSize){
            cSize = my.getContainerSize();
        }
        // Horizontal Axis
        if (my.orientation() === $$ResponsiveConstants._BOTTOM_
                || my.orientation() === $$ResponsiveConstants._TOP_) {
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
     * 
     * @method updateAxisTicks
     * @private
     */
    my.updateAxisTicks = function () {
        var size = $$ResponsiveUtil.getHeight();
        // Horizontal
        if (my.orientation() === $$ResponsiveConstants._BOTTOM_
                || my.orientation() === $$ResponsiveConstants._TOP_) {
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
     * Method that draws axis into g :<br/>
     * Updates :<br/>
     *  - the size of axis (automatically recalculated)
     *  - the range
     *  - the quantity of information to display
     * 
     * @method draw
     * @public
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

        if (my.orientation() === $$ResponsiveConstants._BOTTOM_) {
            g.attr("transform", "translate(0," + cSize.height + ")");
        }
        else if (my.orientation() === $$ResponsiveConstants._LEFT_) {
            g.attr("transform", "rotate(0)");
        }
        if (my.orientation() === $$ResponsiveConstants._RIGHT_) {
            g.attr("transform", "rotate(-90) translate(" + cSize.width + ", 0)");
        }
        
        g.call(my.axis());
    };

    return my;
}