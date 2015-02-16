/* 
 * Responsive Brush For d3js library
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */

/**
 * Create a responsive brush
 * @param json object options :
 * svg : the svg to add brush
 * area : area
 * areaSelector : the d3js selector to get the area
 * cX : container x ResponiveAxis
 * cY : container y ResponiveAxis
 * size : size of axis in px
 * marginTop : the margin top to apply under the main graph
 */
function ResponsiveBrush(options) {
    options = {
        svg: options.svg,
        area: options.area,
        areaSelector: options.areaSelector,
        cX: options.cX,
        cY: options.cY,
        height: options.height || 50,
        margin: options.margin || {top: 0, right: 0, bottom: 0, left: 0},
        autoresize: options.autoresize || false,
        events: {}
    };
    
    /**
     * Constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);
        
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
     * Init graph
     * @returns {object} grapph
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
     * Init brush
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
     * Method that redraws the brush
     */
    my.draw = function() {
        my.graph().attr("transform", "translate(" + my.margin().left + ", " + (my.cY().size() + my.height() + my.margin().top) + ")");
        my.graph().select('.brushx')
                .attr("transform", "translate(0," + my.height() + ")")
                .call(my.x().axis());
        my.x().trigger("redraw");
    };
    
    /**
     * Brushed function
     */
    my.brushed = function() {
        my.cX().data().domain(my.brush().empty() ? my.x().data().domain() : my.brush().extent());
        my.mainGraph().select(my.areaSelector()).attr("d", my.area());
        my.mainGraph().select("." + my.cX().cls().split(' ').join('.')).call(my.cX().axis());
    };
    
    return my;
}