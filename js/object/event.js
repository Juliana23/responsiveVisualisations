/**
 * <b>Responsive Event For d3js library :</b><br/>
 * <br/>
 * Responive event allows you to define only one event for all devices by extension. <br/>
 * To instantiate one, you need to pass the following parameters into a json object :<br/>
 * <b>object</b> : object which listen to events (required)<br/>
 * <b>events</b> : list of events that can be extended
 * associated with function listen by the object (required)<br/>
 * <br/>
 * <b>Example:</b><br/>
 * new ResponsiveEvent({<br/>
 *      &nbsp;&nbsp;&nbsp;object : window,<br/>
 *      &nbsp;&nbsp;&nbsp;events : [<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"name" : "mousemove", "func": function1, "extend": true},<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"name" : "mouseout", "func": function2, "extend": false,<br/>
 *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"name" : "touchend", "func": function3, "extend": false}<br/>
 *      &nbsp;&nbsp;&nbsp;]<br/>
 * })()<br/>
 * <br/>
 * <b>Mapped events</b>
 * <table>
 * <tr><th>Mouse</th><th>Touch</th><tr>
 * <tr><td>mousedown</td><td>touchstart</td><tr>
 * <tr><td>mouseup</td><td>touchenter</td><tr>
 * <tr><td>mouseover</td><td>mouseover</td><tr>
 * <tr><td>mouseout</td><td>touchleave</td><tr>
 * <tr><td>mousemove</td><td>touchmove</td><tr>
 * <tr><td>click</td><td>tap</td><tr>
 * <tr><td>dblclick</td><td>doubletap</td><tr>
 * <tr><td>mousecancel (fake)</td><td>touchcancel</td><tr>
 * </table>
 * </br>
 * @class ResponsiveEvent
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveEvent(options) {
    options = {
        /**
         * Object which listen to events<br/>
         * Read with : object.g()<br/>
         * Write with : object.g(newValue)<br/>
         * 
         * @attribute object
         * @public
         * @required
         * @type Object
         */
        object: options.object,
        /**
         * List of events that can be extended
         * associated with function listen by the object<br/>
         * Read with : axis.events()<br/>
         * Write with : axis.events(newValue)<br/>
         * 
         * @attribute events
         * @public
         * @required
         * @type Object
         */
        events: options.events,
        /**
         * 
         * 
         * @attribute eventsId
         * @public
         * @required
         * @type Object
         */
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
     * ResponsiveEvent Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {
    	
        // Create getters and setters for options
        $$ResponsiveUtil.generateAccessors(my, options);

        // Create d3js event properties
        my.initProperties();

        return my;
    }

    /**
     * This method init properties for axis
     * 
     * @method initProperties
     * @private
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
     * 
     * @method initEvent
     * @public
     * @param {String} event name of event to define 
     * @param {Function} func function to invoke when event is triggered
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
     * 
     * @method intercept
     * @private
     */
    my.intercept = function(){
    	var event = window.event || d3.event;
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
     * 
     * @method transformEvent
     * @private
     * @param {Event} event Hammer Event or Touch Event to transform
     * @param {String} type name of event
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
     * 
     * @method isMouseEvent
     * @private
     * @param {String} event to check
     * @return {Boolean} true if event is mouse event
     */
    my.isMouseEvent = function (event) {
    	return mapEvents.hasOwnProperty(event);
    };
    
    /**
     * Method that retrieves 
     * the mapped event to event pass in parameter
     * 
     * @method getMappedEvent
     * @private
     * @param {String} event name of event to get the matching event 
     * @return {String} event name of mapped event
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
     * 
     * @method generateId
     * @private
     * @return {String} an unique id
     */
    my.generateId = function () {
    	var time = new Date().getTime();
        return time;
    };

    return my;
}