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
 * id : id to put a unique event on objects
 */
function ResponsiveEvent(options) {
    options = {
        object: options.object,
        events: options.events,
        eventsId: {}
    };

    mapEvents = {
        "mousedown": "touchstart",
        "mouseup": "touchend",
        "mouseover":"touchenter",
        "mouseout": "touchleave",
        "mousemove": "touchmove",
        "click": "tap",
        "dblclick": "doubletap",
        "mousecancel":"touchcancel" // Fake event
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
    my.initProperties = function () {
        my.events().forEach(function (event) {
            if (event.extend) {
                var mappedEvent = my.getMappedEvent(event.name);
                if (mappedEvent !== "") {
                	my.initEvent(mappedEvent, event.func);
                }
            }
            my.initEvent(event.name, event.func);
        });
    };
    
    /**
     * Define event on current obj
     * @param {String} event
     * @param {Function} func
     */
    my.initEvent = function(event, func){
    	if(my.isMouseEvent(event)){
    		my.object().on(event, func);
    	}
    	else if($$ResponsiveUtil.mobile()) {
    		my.object().on(event, my.intercept);
    		var id = my.generateId();
    		my.events()[event] = id;
            my.object().on(event + "_" + id, func); // Create a fake event
    	}
    };
    
    /**
     * Intercept the touch event triggered by the user in order to transform it
     */
    my.intercept = function(){
    	var event = window.event;
        // Touch Event
        if(event instanceof TouchEvent){
            my.transformEvent(event, event.type);
        }
        // Hammer Event
        else if(event instanceof Event && event.gesture){
            my.transformEvent(event.gesture.srcEvent, event.type);
        }
    };
    
    /**
     * Transform a touch event into mouse event and dispatch it
     * @param {TouchEvent} event
     */
    my.transformEvent = function(event, type) {
        var touches = event.changedTouches;
        var first = touches.item(0);
        var id = my.events()[type];
        var type = type + "_" + id;
        
        //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
        //           screenX, screenY, clientX, clientY, ctrlKey, 
        //           altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
                first.screenX, first.screenY,
                first.clientX, first.clientY, false,
                false, false, false, 0/*left*/, null);
        
        // Set the srcEvent
        simulatedEvent.srcEvent = event;

        // Trigger the new fake event
        first.target.dispatchEvent(simulatedEvent);
        
        // Stop the old event
        event.preventDefault();
    };

    /**
     * Indicate if event name pass in parameter is mouse event
     * @param {String} event
     * @return {Boolean} true if event is mouse event
     */
    my.isMouseEvent = function (event) {
    	return mapEvents.hasOwnProperty(event);
    };
    
    /**
     * Method that retrieves 
     * the mapped event to event pass in parameter
     * @param {String} event
     * @return {String} the mapped event
     */
    my.getMappedEvent = function (event) {
        var mappedEvent = "";
        if (mapEvents.hasOwnProperty(event)) {
            mappedEvent = mapEvents[event];
        }
        else {
            for (var e in mapEvents) {
                if (mapEvents[e] === event) {
                    mappedEvent = e;
                    break;
                }
            }
        }
        return mappedEvent;
    };
    
    /**
     * Method that generates unique id
     * @returns {String}
     */
    my.generateId = function () {
    	var time = new Date().getTime();
        return time;
    };

    return my;
}