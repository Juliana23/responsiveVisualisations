/* 
 * Responsive Event For d3js library
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */

/**
 * Create a responsive event
 * @param json object options :
 * object : object to apply events
 * events : events possible on object
 */
function ResponsiveEvent(options) {
    options = {
        object: options.object,
        events: options.events
    };
    
    mapEvents = {
    		"mousedown" : "touchstart",
    		"mousemove" : "touchmove",
    		"mouseout" : "touchend",
    		"click" : "tap",
    		"doublclick" : "doubltap",
    };

    /**
     * Constructor
     */
    function my() {
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);

        // Create d3js event properties
        my.initProperties();

        return my;
    }
    
    /**
     * Method to init event
     */
    my.initProperties = function() {
    	my.events().forEach(function(event){
    		my.object().on(event, my.events()[event]);
    		if(event.extend){
    			var mappedEvent = my.getMappedEvent(event);
    			if(mappedEvent !== ""){
    				my.object().on(my.getMappedEvent(event), my.events()[event]);
    			}
    		}
    	});
    };

    /**
     * Method that retrieves 
     * the mapped event to event pass in parameter
     * @param event
     * @return {String} the mapped event
     */
    my.getMappedEvent = function(event) {
    	var mappedEvent = "";
    	if(event in my.events()){
    		mappedEvent = my.events()[event];
    	}
    	else{
    		for(var e in my.events()) {
    			if(my.events().hasOwnProperty(e)){
    				if(my.events()[e] === event){
    					return e;
    				}
    			}
    		}
    	}
    	return mappedEvent;
    };
    
    return my;
}
