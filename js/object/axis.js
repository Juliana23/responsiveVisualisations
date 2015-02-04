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
 * orientation : top, bottom, left, right
 * size : size of axis in px
 * datatype : type of data to display on axis
 * domain : array of values to display on axis
 * cls : css class for axis
 */
function ResponsiveAxis(options) {
    options = {
        g : options.g,
        size: 0,
        orientation : options.orientation || _BOTTOM_,
        datatype : options.datatype,
        domain : options.domain,
        cls : options.cls,
        window: options.window
    };
    
    /**
     * Constructor
     */
    function my(){
        // Create getters and setters for options
        generateAccessors(my, options);

        my.updateSize();
        
        // Create d3js axis properties
        my.initProperties();
        my.updateRange();
        
        // Add axis to g
        my.draw();
        
        // Add resize event
        d3.select("#graph").on('change', function(){
        	alert("lala");
        	my.resize();
        });
        
        return my;
    }
    /**
     * This method init properties for axis
     */
    my.initProperties = function(){
        var data = my.initData();
        var axis = my.initAxis(data);
        
        var properties = {
            data : data,
            axis : axis
        };
        // Generate getters and setters for properties
        generateAccessors(my, properties);
    };
    
    /**
     * Init data to display on axis
     * @return object data
     */
    my.initData = function(){
        var data;
        
        // Init scale
        if(my.datatype() === _YEAR_
                || my.datatype() === _MONTH_
                || my.datatype() === _DAY_){
            data = d3.time.scale().nice(d3.time[my.datatype()]);
        }
        else {
            data = d3.scale.linear().nice();
        }
        
        // Init domain
        if(my.domain()){
            data = data.domain(my.domain());
        }
        
        return data;
    };
    
    /**
     * Init axis
     * @param object data
     * @return object axis
     */
    my.initAxis = function(data){
        var axis = d3.svg.axis().scale(data).orient(my.orientation());
        return axis;
    };
    
    /**
     * This method update range of axis
     */
    my.updateRange = function () {
        // Horizontal Axis
        if (my.orientation() === _BOTTOM_
                || my.orientation() === _TOP_) {
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
     */
    my.updateSize = function () {
        var cSize = my.getContainerSize();
        // Horizontal Axis
        if (my.orientation() === _BOTTOM_
                || my.orientation() === _TOP_) {
            my.size(cSize.width);
        }
        // Vertical Axis
        else {
            my.size(cSize.height);
        }
    };
    
    /**
     * Get the axis container size
     * @returns json object
     */
    my.getContainerSize = function () {
		return {
        	height : my.g().attr("height"),
        	width : my.g().attr("width")
        };
    };
    
    /**
     * Draw axis on g
     */
    my.draw = function(){
        var g = my.g().append("g");
        
        // Add css class
        if(my.cls()){
            g.attr("class", my.cls());
        }
        
        // Transform axis
        var cSize = my.getContainerSize();
        if(my.orientation() === _BOTTOM_){
            g.attr("transform", "translate(0," + cSize.height + ")");
        }
        else if(my.orientation() === _LEFT_){
//            g.attr("transform", "rotate(0)");
        }
        if(my.orientation() === _RIGHT_){
            g.attr("transform", "rotate(-90) translate(" + cSize.width + ", 0)");
        }
        g.call(my.axis());
    };
    
    /**
     * Method called on window resize event
     */
    my.resize = function(){
        my.updateSize();
        my.updateRange();
    };
    
    return my;
}