var id = 0;
function generateId() { return id++; };

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