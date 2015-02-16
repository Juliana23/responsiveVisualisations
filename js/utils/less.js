/**
 * Utiliy Class For Less
 */
function ResponsiveLess() {
	options = {
			variables: {}
	};
	
	// Variable use to keep less variables modifcations before update them
	prepareLessVariables = {};

    /**
     * Constructor
     */
    function my() {
    	my.id = 0;
    	
    	//parse less
    	less.refresh();
    	
    	// Retrieve less variables
    	var lessVars = my.getLessVars("less");
    	
    	// Generate accessors for less variables
    	my.generateAccessors(my, lessVars);
    	$$ResponsiveUtil.generateAccessors(my, options);
    	
    	my.variables(lessVars);
    	
    	return my;
    };
    
    /**
     * Method that generates unique id
     * @returns {String}
     */
    my.generateId = function () {
        my.id++;
        return "less_" + my.id;
    };
    
    /**
     * This method generates getters and setters options for object obj
     * @param json object options
     */
    my.generateAccessors = function (obj, options) {
        if (!obj.id) {
            obj.id = my.generateId();
        }
        for (var o in options) {
            obj[o] = new Function("newValue",
            		"if (!arguments.length) {return " + o + "_" + obj.id + ";} " + o + "_" + obj.id + " = newValue; prepareLessVariables['@" + o + "'] = newValue;");
            obj[o](options[o]);
        }
    };

	/**
	 * getLessVars parses your LESS variables to Javascript (provided you make a dummy node in LESS)
	 * @param {String} id The CSS-id your variables are listed under.
	 * @param {Boolean} [parseNumbers=true] Try to parse units as numbers.
	 * @return {Object} A value object containing your LESS variables.
	 * @example
	 * LESS:
	 * 	&#64;myLessVariable: 123px;
	 * 	#dummyLessId { width: @myLessVariable; }
	 * Javascript:
	 * 	getLessVars('dummyLessId');
	 * returns:
	 * 	{myLessVariable:123}
	 */
	my.getLessVars = function(id, parseNumbers) {
		var bNumbers = parseNumbers===undefined?true:parseNumbers
			,oLess = {}
			,rgId = /\#\w+/
			,rgKey = /\.([a-zA-Z\_]+)/
			,rgUnit = /[a-z]+$/
			,aUnits = 'em,ex,ch,rem,vw,vh,vmin,cm,mm,in,pt,pc,px,deg,grad,rad,turn,s,ms,Hz,kHz,dpi,dpcm,dppx'.split(',')
			,rgValue = /:\s?(.*)\s?;\s?\}/
			,rgStr = /^'([^']+)'$/
			,sId = '#'+id
			,oStyles = document.styleSheets;
		for (var i=0,l=oStyles.length;i<l;i++) {
			var oRules = oStyles[i].cssRules;
			console.log(oRules);
			for (var j=0,k=oRules.length;j<k;j++) {
				var sRule = oRules[j].cssText
					,aMatchId = sRule.match(rgId);
				if (aMatchId&&aMatchId[0]==sId) {
					var aKey = sRule.match(rgKey)
						,aVal = sRule.match(rgValue);
					if (aKey&&aVal) {
						var sKey = aKey[1]
							,oVal = aVal[1];
						oLess[sKey] = oVal;
					}
				}
			}
		}
		return oLess;
	};
	
	/**
	 * Method to retrieve the initial 
	 * value of less vars
	 */
	my.attributeValueInitialToVars = function(){
		var lessVars = {};
		// Get initial variables
		var variables = my.variables();
		for(key in variables){
			lessVars["@" + key] = variables[key];
		}
		// Modify less variables
		less.modifyVars(function(){
			for(key in lessVars){
				return "'" + key + "': '" + lessVars[key] + "'";
			}
		});
	};
	
	/**
	 * Method to update less variables
	 */
	my.updateVariables = function() {
		less.modifyVars(prepareLessVariables);
		prepareLessVariables = {};
		$$ResponsiveConstants.updateLessVariables();
	};

	return my;
}

var $$ResponsiveLess = (new ResponsiveLess())();