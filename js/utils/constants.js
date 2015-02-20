/**
 * <b>Responsive Constants For d3js library :</b><br/>
 * <br/>
 * Responive constants offers several constants
 * <br/>
 * It already instanciate, to use it you have to use the variable: <br/>
 * - $$ResponsiveConstants
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
            // Width Screen
            _XSMIN_ : $$ResponsiveLess.xs_min(),
            _XSMAX_ : $$ResponsiveLess.xs_max(),
            _SMMIN_ : $$ResponsiveLess.sm_min(),
            _SMMAX_ : $$ResponsiveLess.sm_max(),

            // Width tooltip
            _XSWIDTH_ : $$ResponsiveLess.phone_portrait_strict_tooltip_width(), // Between [_XSMIN_, _XSMAX_] and [_SMMIN_, _SMMAX_]
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
    	// Date
        my._YEAR_ = "year";
        my._MONTH_ = "month";
        my._DAY_ = "day";
        // Orientation
        my._TOP_ = "top";
        my._BOTTOM_ = "bottom";
        my._LEFT_ = "left";
        my._RIGHT_ = "right";
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