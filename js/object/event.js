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
    		if(event.extend){
    			var mappedEvent = my.getMappedEvent(event.name);
    			if(mappedEvent !== ""){
    				my.object().on(mappedEvent, event.func);
    			}
    		}
    		my.object().on(event.name, event.func);
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
		if(mapEvents.hasOwnProperty(event)){
    		mappedEvent = mapEvents[event];
    	}
		else{
    		for(var e in mapEvents) {
				if(mapEvents[e] === event){
					mappedEvent = e;
					break;
				}
    		}
    	}
    	return mappedEvent;
    };
    
    return my;
}
