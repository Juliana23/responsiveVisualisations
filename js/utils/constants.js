/**
 * <b>Responsive Constants For d3js library :</b><br/>
 * <br/>
 * Responive constants offers several constants
 * <br/>
 * Already instanciated, to use it you have to use the variable: <br/>
 * $$ResponsiveConstants
 * <br/>
 * <b>Example:</b><br/>
 * var xsmin = $$ResponsiveConstants._XSMIN_();
 * <br/>
 * @class ResponsiveConstants
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveConstants() {
	options = {
            // Date
            /**
             * Constant used to declare datatype YEAR on axis<br/>
             * Read with : $$ResponsiveConstants._YEAR_()<br/>
             * 
             * @attribute _YEAR_
             * @public
             * @type String
             * @final
             */
            _YEAR_ : "year",
            /**
             * Constant used to declare datatype MONTH on axis<br/>
             * Read with : $$ResponsiveConstants._MONTH_()<br/>
             * 
             * @attribute _MONTH_
             * @public
             * @type String
             * @final
             */
            _MONTH_ : "month",
            /**
             * Constant used to declare datatype DAY on axis<br/>
             * Read with : $$ResponsiveConstants._DAY_()<br/>
             * 
             * @attribute _DAY_
             * @public
             * @type String
             * @final
             */
            _DAY_ : "day",

            // Orientation
            /**
             * Constant used to declare orientation TOP on axis<br/>
             * Read with : $$ResponsiveConstants._TOP_()<br/>
             * 
             * @attribute _TOP_
             * @public
             * @type String
             * @final
             */
            _TOP_ : "top",
            /**
             * Constant used to declare orientation BOTTOM on axis<br/>
             * Read with : $$ResponsiveConstants._BOTTOM_()<br/>
             * 
             * @attribute _BOTTOM_
             * @public
             * @type String
             * @final
             */
            _BOTTOM_ : "bottom",
            /**
             * Constant used to declare orientation LEFT on axis<br/>
             * Read with : $$ResponsiveConstants._LEFT_()<br/>
             * 
             * @attribute _LEFT_
             * @public
             * @type String
             * @final
             */
            _LEFT_ : "left",
            /**
             * Constant used to declare orientation RIGHT on axis<br/>
             * Read with : $$ResponsiveConstants._RIGHT_()<br/>
             * 
             * @attribute _RIGHT_
             * @public
             * @type String
             * @final
             */
            _RIGHT_ : "right",
            
            // Width Screen
            /**
             * Less variable used to define minimal width of smartphone<br/>
             * Read with : $$ResponsiveConstants._XSMIN_()<br/>
             * Write with : $$ResponsiveConstants._XSMIN_(newValue)<br/>
             * 
             * @attribute _XSMIN_
             * @public
             * @type String
             * @default 321px
             */
            _XSMIN_ : $$ResponsiveLess.xs_min(),
            /**
             * Less variable used to define maximal width of phone<br/>
             * Read with : $$ResponsiveConstants._XSMAX_()<br/>
             * Write with : $$ResponsiveConstants._XSMAX_(newValue)<br/>
             * 
             * @attribute _XSMAX_
             * @public
             * @type String
             * @default 320px
             */
            _XSMAX_ : $$ResponsiveLess.xs_max(),
            /**
             * Less variable used to define minimal width of tablet<br/>
             * Read with : $$ResponsiveConstants._SMMIN_()<br/>
             * Write with : $$ResponsiveConstants._SMMIN_(newValue)<br/>
             * 
             * @attribute _XSMAX_
             * @public
             * @type String
             * @default 768px
             */
            _SMMIN_ : $$ResponsiveLess.sm_min(),
            /**
             * Less variable used to define maximal width of tablet<br/>
             * Read with : $$ResponsiveConstants._SMMAX_()<br/>
             * Write with : $$ResponsiveConstants._SMMAX_(newValue)<br/>
             * 
             * @attribute _SMMAX_
             * @public
             * @type String
             * @default 1024px
             */
            _SMMAX_ : $$ResponsiveLess.sm_max(),

            // Width tooltip
            /**
             * Less variable used to define width of tooltip on small screen<br/>
             * Read with : $$ResponsiveConstants._XSWIDTH_()<br/>
             * Write with : $$ResponsiveConstants._XSWIDTH_(newValue)<br/>
             * 
             * @attribute _XSWIDTH_
             * @public
             * @type String
             * @default 180px
             */
            _XSWIDTH_ : $$ResponsiveLess.phone_portrait_strict_tooltip_width(),
            /**
             * Less variable used to define width of tooltip on large screen<br/>
             * Read with : $$ResponsiveConstants._SMWIDTH_()<br/>
             * Write with : $$ResponsiveConstants._SMWIDTH_(newValue)<br/>
             * 
             * @attribute _SMWIDTH_
             * @public
             * @type String
             * @default 100px
             */
            _SMWIDTH_ : $$ResponsiveLess.desktop_tooltip_width()
	};
	
    /**
     * ResponsiveConstants Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {    	
    	// Generate accessors for less variables
    	$$ResponsiveUtil.generateAccessors(my, options);
    	
    	return my;
    };
    
    /**
     * Method to update less variables
     * 
     * @method updateLessVariables
     * @public
     */
    my.updateLessVariables = function() {
    	// Width Screen
    	my._XSMIN_($$ResponsiveLess.xs_min());
    	my._XSMAX_($$ResponsiveLess.xs_max());
    	my._SMMIN_($$ResponsiveLess.sm_min());
    	my._SMMAX_($$ResponsiveLess.sm_max());

	// Width tooltip
    	my._XSWIDTH_($$ResponsiveLess.phone_portrait_strict_tooltip_width());
    	my._SMWIDTH_($$ResponsiveLess.desktop_tooltip_width());
    };
    
    return my;
}

var $$ResponsiveConstants = (new ResponsiveConstants())();