/**
 * <b>Responsive Brush For d3js library :</b><br/>
 * <br/>
 * Responive brush allows you to create brush for timeline, line chart, ...
 * Brush system allows you to zoom and navigate into your chart.
 * Brush element will be responsive and you don't need to take care to
 * the size of them. <br/>
 * To instantiate one, you need to set the following parameters into a json object :<br/>
 * <b>svg</b> : svg element (required)<br/>
 * <b>area</b> : area element used to draw chart (required)<br/>
 * <b>areaSelector</b> : d3js selector to retrieve area (required)<br/>
 * <b>cX</b> : x axis of main chart (required)<br/>
 * <b>cY</b> : y axis of main chart (required)<br/>
 * <b>height</b> : height of the brush element (default 50)<br/>
 * <b>margin</b> : margin to apply to brush element (default {top: 0, right: 0, bottom: 0, left: 0})<br/>
 * <b>autoresize</b>  : indicate if resize is automatically done (default false)<br/>
 * <br/>
 * <b>Example:</b><br/>
 * var brush = new ResponsiveBrush({<br/>
 *      &nbsp;&nbsp;&nbsp;svg: svg,<br/>
 *      &nbsp;&nbsp;&nbsp;area: area,<br/>
 *      &nbsp;&nbsp;&nbsp;areaSelector: ".area",<br/>
 *      &nbsp;&nbsp;&nbsp;cX: aResponsiveAxis,<br/>
 *      &nbsp;&nbsp;&nbsp;cY: aResponsiveAxis,<br/>
 *      &nbsp;&nbsp;&nbsp;margin: {<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;top: 50,<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left: 60<br/>
 *      &nbsp;&nbsp;&nbsp;}<br/>
 *  })();<br/>
 *  <br/>
 * @class ResponsiveBrush
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveBrush(options) {
    options = {
        /**
         * Main svg element<br/>
         * Read with : brush.svg()<br/>
         * Write with : brush.svg(newValue)<br/>
         * 
         * @attribute g
         * @public
         * @required
         * @type Object
         */
        svg: options.svg,
        /**
         * Area element used to draw chart<br/>
         * Read with : brush.area()<br/>
         * Write with : brush.area(newValue)<br/>
         * 
         * @attribute area
         * @public
         * @required
         * @type Object
         */
        area: options.area,
        /**
         * d3js selector to retrieve area<br/>
         * Read with : brush.areaSelector()<br/>
         * Write with : brush.areaSelector(newValue)<br/>
         * 
         * @attribute areaSelector
         * @public
         * @required
         * @type Object
         */
        areaSelector: options.areaSelector,
        /**
         * x axis of main chart<br/>
         * Read with : brush.cX()<br/>
         * Write with : brush.cX(newValue)<br/>
         * 
         * @attribute cX
         * @public
         * @required
         * @type ResponsiveAxis
         */
        cX: options.cX,
        /**
         * y axis of main chart<br/>
         * Read with : brush.cY()<br/>
         * Write with : brush.cY(newValue)<br/>
         * 
         * @attribute cY
         * @public
         * @required
         * @type ResponsiveAxis
         */
        cY: options.cY,
        /**
         * Meight of the brush element<br/>
         * Read with : brush.height()<br/>
         * Write with : brush.height(newValue)<br/>
         * 
         * @attribute height
         * @public
         * @type Integer
         * @default 50
         */
        height: options.height || 50,
        /**
         * Margin to apply to brush element<br/>
         * Read with : brush.margin()<br/>
         * Write with : brush.margin(newValue)<br/>
         * 
         * @attribute margin
         * @public
         * @type Object
         * @default {top: 0, right: 0, bottom: 0, left: 0}
         */
        margin: options.margin || {top: 0, right: 0, bottom: 0, left: 0},
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
        events: {}
    };
    
    /**
     * ResponsiveBrush Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);
        
        // Need to update the ratio for container axis
        my.cX().updateRatio(true, my.height() + my.margin().top, true);
        my.cY().updateRatio(true, my.height() + my.margin().top, true);
        
        // Create d3js brush properties
        my.initProperties();
        
        // Construct the brush slider
        my.constructSlider();
        
        // Add events to current object
        my.addDefaultEvents();
        
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
     * @param {Object} event event event to clear
     * @param {Function} func function function to remove
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
        
        // Init Graph
        var graph = my.initGraph();
        
        // Init x axis
        var x = new ResponsiveAxis({
            g: graph,
            cls: "brushx axis",
            orientation: my.cX().orientation(),
            datatype: my.cX().datatype(),
            domain: my.cX().domain(),
            autoresize: false,
            fixedHeight: true
        })();
        
        // Init y axis
        var y = new ResponsiveAxis({
            g: graph,
            cls: "brushy axis",
            orientation: my.cY().orientation(),
            datatype: my.cY().datatype(),
            domain: my.cY().domain(),
            autoresize: false,
            fixedHeight: true
        })();
        
        // Init brush
        var brush = my.initBrush(x);
        
        var properties = {
            mainGraph: my.cX().g(),
            graph: graph,
            x: x,
            y: y,
            brush: brush
        };
        
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, properties);
    };
    
    /**
     * Initialize g element to draw brush
     * 
     * @method initGraph
     * @private
     * @return {Object} g element create
     */
    my.initGraph = function() {
        var graph = my.svg().append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + my.margin().left + ", " + (my.cY().size() + my.height() + my.margin().top) + ")")
                .attr("height", my.height())
                .attr("width", my.cX().size());
        return graph;
    };
    
    /**
     * Initialize brush
     * 
     * @method initBrush 
     * @private
     * @param ResponsiveAxis x
     * @returns {object} brush
     */
    my.initBrush = function(x) {
        var brush = d3.svg.brush()
                .x(x.data())
                .on("brush",
                        function () {
                            my.brushed();
                        }
                );
        return brush;
    };
    
    /**
     * Construct the brush slider
     * 
     * @method constructSlider 
     * @private
     */
    my.constructSlider = function() {
        my.graph().append("g")
                .attr("class", "brush")
                .call(my.brush())
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", my.height() + 7);
    };
    
    /**
     * Method that draws the brush :<br/>
     * Update his size automatically
     * 
     * @method draw
     * @public
     */
    my.draw = function() {
        my.graph().attr("transform", "translate(" + my.margin().left + ", " + (my.cY().size() + my.height() + my.margin().top) + ")");
        my.graph().select('.brushx')
                .attr("transform", "translate(0," + my.height() + ")")
                .call(my.x().axis());
        my.x().trigger("redraw");
    };
    
    /**
     * Method that brushes<br/>
     * Update the domain of main chart
     * 
     * @method brushed
     * @private
     */
    my.brushed = function() {
        my.cX().data().domain(my.brush().empty() ? my.x().data().domain() : my.brush().extent());
        my.mainGraph().select(my.areaSelector()).attr("d", my.area());
        my.mainGraph().select("." + my.cX().cls().split(' ').join('.')).call(my.cX().axis());
    };
    
    return my;
}