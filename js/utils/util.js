/**
 * <b>Responsive Util For d3js library :</b><br/>
 * <br/>
 * Already instanciated, to use it you have to use the variable: <br/>
 * $$ResponsiveUtil
 * <br/>
 * <b>Example:</b><br/>
 * var isMobile = $$ResponsiveUtil.mobile();
 * <br/>
 * @class ResponsiveUtil
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveUtil() {

    /**
     * ResponsiveUtil Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {
        my.id = 0;

        // Date
        my._YEAR_ = "year";
        my._MONTH_ = "month";
        my._DAY_ = "day";
        // Orientation
        my._TOP_ = "top";
        my._BOTTOM_ = "bottom";
        my._LEFT_ = "left";
        my._RIGHT_ = "right";

        // Width Screen
        my._XSMIN_ = "321";
        my._XSMAX_ = "768";
        my._SMMIN_ = "768";
        my._SMMAX_ = "1024";

        // Width tooltip
        my._XSWIDTH_ = "180"; // Between [_XSMIN_, _XSMAX_] and [_SMMIN_, _SMMAX_]
        my._SMWIDTH_ = "100";

        my.instance = null;
        
        return my;
    };

    /**
     * Method that generates unique id
     * 
     * @method generateId
     * @private
     * @return {String} an unique id
     */
    my.generateId = function () {
        my.id++;
        return "obj_" + my.id;
    };

    /**
     * This method generates getters and setters options for object obj
     * 
     * @method generateAccessors
     * @public
     * @param {Object} obj accessors for object obj
     * @param {Object} options json object options
     */
    my.generateAccessors = function (obj, options) {
        if (!obj.id) {
            obj.id = my.generateId();
        }
        for (var o in options) {
            obj[o] = new Function("newValue",
                    "if (!arguments.length) {return " + o + "_" + obj.id + ";} " + o + "_" + obj.id + " = newValue;");
            obj[o](options[o]);
        }
    };

    /**
     * This method allow to add multiple resize events on window
     * 
     * @method addResizeEvent
     * @public
     * @param {Function} func function to invoke when event resize is triggered
     */
    my.addResizeEvent = function (func) {
        var oldResize = window.onresize;
        window.onresize = function () {
            func();
            if (typeof oldResize === 'function') {
                oldResize();
            }
        };
    };
    
    /**
     * This method is use to detect whether the 
     * users browser is an mobile browser
     * 
     * @method mobile
     * @public
     * @return {Boolean} true if the device is a mobile
     */
    my.mobile = function () {
        ///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
        ///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>

        if (sessionStorage.desktop) // desktop storage 
            return false;
        else if (localStorage.mobile) // mobile storage
            return true;

        // alternative
        var mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
        for (var i in mobile) {
            if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) {
                return true;
            }
        }
        // nothing found.. assume desktop
        return false;
    };
    
    /**
     * This method return the position of cursor
     * 
     * @method getCursorPosition
     * @public
     * @return {Object} position into json object {x; vx, y: vy}
     */
    my.getCursorPosition = function () {
    	var e = window.event;
		return {
			x : e.clientX,
			y : e.clientY
		};
    };

    /**
     * This method return the position of element
     * 
     * @method getElementPosition
     * @public
     * @param {String} id id for get element
     * @return {Object} position into json object {x; vx, y: vy}
     */
    my.getElementPosition = function (id) {
    	var elem = document.getElementById(id);
    	var top=0;
    	var left=0;

    	while(elem) {
    		top += parseInt(elem.offsetTop);
    		left += parseInt(elem.offsetLeft);
    		elem = elem.offsetParent;
    	}

    	return {x: top, y: left};
    };
    
    /**
     * This method is use to detect whether the 
     * cursor clicked is included
     * 
     * @method isPositionOutsideContainer
     * @public
     * @param {String} margin margin for the outside zone
     * @return {Boolean} true if the event is outside
     */
    my.isPositionOutsideContainer = function (margin) {
    	var e = window.event;
    	var xClicked = e.clientX;
		var yClicked = e.clientY;
		if(xClicked < margin 
				|| yClicked < margin
				|| xClicked > window.innerWidth - margin
				|| yClicked > window.innerHeight - margin){
			return true; 
		}
		return false;
    };

    /**
     * Calculate width of current screen
     * 
     * @method getWidth
     * @public
     * @return {String} screen width
     */
    my.getWidth = function () {
        xWidth = null;
        if (window.screen !== null)
            xWidth = window.screen.availWidth;

        if (window.innerWidth !== null)
            xWidth = window.innerWidth;

        if (document.body !== null)
            xWidth = document.body.clientWidth || document.body.getBoundingClientRect().width;

        return xWidth;
    };
    
    /**
     * Calculate height of current screen
     * 
     * @method getHeight
     * @public
     * @return {String} screen height
     */
    my.getHeight = function () {
        xHeight = null;
        if (window.screen !== null)
            xHeight = window.screen.availHeight;

        if (window.innerHeight !== null)
            xHeight = window.innerHeight;

        if (document.body !== null)
            xHeight = document.body.clientHeight || document.body.getBoundingClientRect().height;

        return xHeight;
    };

    return my;
}

var $$ResponsiveUtil = (new ResponsiveUtil())();