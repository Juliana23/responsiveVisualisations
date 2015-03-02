/**
 * <b>Responsive Less For d3js library :</b><br/>
 * <br/>
 * Responive less offers several tools for less file
 * <br/>
 * Already instanciated, to use it you have to use the variable: <br/>
 * $$ResponsiveLess
 * <br/>
 * <b>Example:</b><br/>
 * $$ResponsiveLess.phone_label_font_size("14px");<br/>
 * $$ResponsiveLess.desktop_label_font_size("18px");<br/>
 * $$ResponsiveLess.updateVariables();<br/>
 * <br/>
 * <b>List of less variables:</b><br>
 * <table>
 * <tr><th>Variable</th><th>Default value</th></tr>
 * <tr><td>xs_min</td><td>321px</td></tr>
 * <tr><td>sm_min</td><td>768px</td></tr>
 * <tr><td>md_min</td><td>1024px</td></tr>
 * <tr><td>lg_min</td><td>1824px</td></tr>
 * <tr><td>xs_max</td><td>320px</td></tr>
 * <tr><td>xs_max_o</td><td>768px</td></tr>
 * <tr><td>sm_max</td><td>1024px</td></tr>
 * <tr><td>phone_label_font_size</td><td>20px</td></tr>
 * <tr><td>phone_landscape_label_font_size</td><td>20px</td></tr>
 * <tr><td>tablet_label_font_size</td><td>16px</td></tr>
 * <tr><td>desktop_label_font_size</td><td>16px</td></tr>
 * <tr><td>large_label_font_size</td><td>16px</td></tr>
 * <tr><td>phone_portrait_strict_label_font_size</td><td>18px</td></tr>
 * <tr><td>phone_landscape_strict_label_font_size</td><td>18px</td></tr>
 * <tr><td>tablet_landscape_strict_label_font_size</td><td>16px</td></tr>
 * <tr><td>tablet_portrait_strict_label_font_size</td><td>16px</td></tr>
 * <tr><td>phone_tooltip_width</td><td>100px</td></tr>
 * <tr><td>phone_landscape_tooltip_width</td><td>100px</td></tr>
 * <tr><td>tablet_tooltip_width</td><td>100px</td></tr>
 * <tr><td>desktop_tooltip_width</td><td>100px</td></tr>
 * <tr><td>large_tooltip_width</td><td>100px</td></tr>
 * <tr><td>phone_portrait_strict_tooltip_width</td><td>180px</td></tr>
 * <tr><td>phone_landscape_strict_tooltip_width</td><td>180px</td></tr>
 * <tr><td>tablet_landscape_strict_tooltip_width</td><td>180px</td></tr>
 * <tr><td>tablet_portrait_strict_tooltip_width</td><td>180px</td></tr>
 * <tr><td>phone_tooltip_max_width</td><td>100px</td></tr>
 * <tr><td>phone_landscape_tooltip_max_width</td><td>100px</td></tr>
 * <tr><td>tablet_tooltip_max_width</td><td>100px</td></tr>
 * <tr><td>desktop_tooltip_max_width</td><td>100px</td></tr>
 * <tr><td>large_tooltip_max_width</td><td>100px</td></tr>
 * <tr><td>phone_portrait_strict_tooltip_max_width</td><td>180px</td></tr>
 * <tr><td>phone_landscape_strict_tooltip_max_width</td><td>180px</td></tr>
 * <tr><td>tablet_landscape_strict_tooltip_max_width</td><td>180px</td></tr>
 * <tr><td>tablet_portrait_strict_tooltip_max_width</td><td>180px</td></tr>
 * <tr><td>phone_tooltip_font_size</td><td>14px</td></tr>
 * <tr><td>phone_landscape_tooltip_font_size</td><td>14px</td></tr>
 * <tr><td>tablet_tooltip_font_size</td><td>14px</td></tr>
 * <tr><td>desktop_tooltip_font_size</td><td>12px</td></tr>
 * <tr><td>large_tooltip_font_size</td><td>12px</td></tr>
 * <tr><td>phone_portrait_strict_tooltip_font_size</td><td>20px</td></tr>
 * <tr><td>phone_landscape_strict_tooltip_font_size</td><td>14px</td></tr>
 * <tr><td>tablet_landscape_strict_tooltip_font_size</td><td>14px</td></tr>
 * <tr><td>tablet_portrait_strict_tooltip_font_size</td><td>16px</td></tr>
 * <tr><td>phone_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>phone_landscape_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>tablet_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>desktop_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>large_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>phone_portrait_strict_tooltip_line_height</td><td>22px</td></tr>
 * <tr><td>phone_landscape_strict_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>tablet_landscape_strict_tooltip_line_height</td><td>16px</td></tr>
 * <tr><td>tablet_portrait_strict_tooltip_line_height</td><td>16px</td></tr>
 * </table>
 * <br/>
 * @class ResponsiveLess
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveLess() {
    options = {
        /**
         * List of less variables<br/>
         * Read with : less.variables()<br/>
         * 
         * @attribute variables
         * @private
         * @type Object
         * @readonly
         */
        variables: {}
    };

    /**
     * Variable use to keep less variables modifcations before update them
     * 
     * @attribute prepareLessVariables
     * @private
     * @type Object
     * @readonly
     */
    prepareLessVariables = {};

    /**
     * ResponsiveLess Constructor
     *
     * @method my
     * @public
     * @constructor
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
    }
    ;

    /**
     * Method that generates unique id
     *
     * @method generateId
     * @private
     * @return {String} an unique id
     */
    my.generateId = function () {
        my.id++;
        return "less_" + my.id;
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
                    "if (!arguments.length) {return " + o + "_" + obj.id + ";} " + o + "_" + obj.id + " = newValue; prepareLessVariables['@" + o + "'] = newValue;");
            obj[o](options[o]);
        }
    };

    /**
     * getLessVars parses your LESS variables to Javascript (provided you make a dummy node in LESS)
     * @method getLessVars
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
    my.getLessVars = function (id, parseNumbers) {
        var bNumbers = parseNumbers === undefined ? true : parseNumbers
                , oLess = {}
        , rgId = /\#\w+/
                , rgKey = /\.([a-zA-Z\_]+)/
                , rgUnit = /[a-z]+$/
                , aUnits = 'em,ex,ch,rem,vw,vh,vmin,cm,mm,in,pt,pc,px,deg,grad,rad,turn,s,ms,Hz,kHz,dpi,dpcm,dppx'.split(',')
                , rgValue = /:\s?(.*)\s?;\s?\}/
                , rgStr = /^'([^']+)'$/
                , sId = '#' + id
                , oStyles = document.styleSheets;
        for (var i = 0, l = oStyles.length; i < l; i++) {
            var oRules = oStyles[i].cssRules;
            if (oRules !== null) {
                for (var j = 0, k = oRules.length; j < k; j++) {
                    var sRule = oRules[j].cssText
                            , aMatchId = sRule.match(rgId);
                    if (aMatchId && aMatchId[0] === sId) {
                        var aKey = sRule.match(rgKey)
                                , aVal = sRule.match(rgValue);
                        if (aKey && aVal) {
                            var sKey = aKey[1]
                                    , oVal = aVal[1];
                            oLess[sKey] = oVal;
                        }
                    }
                }
            }
        }
        return oLess;
    };
    
    /**
     * Method to retrieve the initial 
     * value of less vars using the function less.modifyVars
     * 
     * @method attributeValueInitialToVars
     * @public
     */
    my.attributeValueInitialToVars = function () {
        var lessVars = {};
        // Get initial variables
        var variables = my.variables();
        for (key in variables) {
            lessVars["@" + key] = variables[key];
        }
        // Modify less variables
        less.modifyVars(function () {
            for (key in lessVars) {
                return "'" + key + "': '" + lessVars[key] + "'";
            }
        });
    };

    /**
     * Method to update less variables
     * 
     * @method updateVariables
     * @public
     */
    my.updateVariables = function () {
        less.modifyVars(prepareLessVariables);
        prepareLessVariables = {};
        $$ResponsiveConstants.updateLessVariables();
    };

    return my;
}

var $$ResponsiveLess = (new ResponsiveLess())();