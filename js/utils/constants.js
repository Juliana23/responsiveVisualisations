/**
 * Utiliy Class For Constants
 */
function ResponsiveConstants() {
	options = {
			// Date
			_YEAR_ : "year",
			_MONTH_ : "month",
			_DAY_ : "day",
			// Orientation
			_TOP_ : "top",
			_BOTTOM_ : "bottom",
			_LEFT_ : "left",
			_RIGHT_ : "right",

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
     * Constructor
     */
    function my() {    	
    	// Generate accessors for less variables
    	$$ResponsiveUtil.generateAccessors(my, options);
    	
    	return my;
    };
    
    /**
     * Method to update less variables
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