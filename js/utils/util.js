var id = 0;
function generateId() { id++; return "obj_" + id; };

/**
 * This method generates getters and setters options for object obj
 * @param json object options
 */
function generateAccessors(obj, options){
	if(!obj.id){
		obj.id = generateId();
	}
	for(var o in options){
		obj[o] = new Function("newValue", 
				"if (!arguments.length) {return " + o + "_" + obj.id + ";} " + o + "_" + obj.id + " = newValue;");
		obj[o](options[o]);
	}
};

/**
 * This method allow to add multiple resize events on window
 * @param {function} func
 */
function addResizeEvent(func) {
    var oldResize = window.onresize;
    window.onresize = function () {
        func();
        if (typeof oldResize === 'function') {
            oldResize();
        }
    };
}


/*
 * Define Some Util Constants
 */

// Date
var _YEAR_ = "year";
var _MONTH_ = "month";
var _DAY_ = "day";
// Orientation
var _TOP_ = "top";
var _BOTTOM_ = "bottom";
var _LEFT_ = "left";
var _RIGHT_ = "right";

// Width Screen
var _XSMIN_ = "321";
var _XSMAX_ = "768";
var _SMMIN_ = "768";
var _SMMAX_ = "1024";

// Width tooltip
var _XSWIDTH_ = "180"; // Between [_XSMIN_, _XSMAX_] and [_SMMIN_, _SMMAX_]
var _SMWIDTH_ = "100";

/*
 * Define Some Utils
 */

/**
 * This method is use to detect whether the 
 * users browser is an mobile browser
 * @return boolean
 */
function mobile() {
	///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
	///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>

	if (sessionStorage.desktop) // desktop storage 
		return false;
	else if (localStorage.mobile) // mobile storage
		return true;

	// alternative
	var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile']; 
	for (var i in mobile){
		if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0){
			return true;
		}
	}
	// nothing found.. assume desktop
	return false;
}