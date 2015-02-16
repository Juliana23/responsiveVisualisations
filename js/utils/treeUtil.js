/**
 * Utiliy Class
 */
function ResponsiveTreeUtil() {

    /**
     * Constructor
     */
    function my() {
        my.id = 0;

        my.instance = null;
        
        return my;
    };
    
    /**
     * Function to get all parents 
     * on node
     * @param node object
     * @return array parents
     */
    my.getAllParents = function (node){
        var parents = [];
        while(node.parent){
            parents.push(node.parent);
            node = node.parent;
        }
        return parents;
    };
    
    /**
     * Function to know if text need 
     * to be in light color
     */
    my.needLightColor = function(color){
        var c = color.substring(1);      // strip #
        var rgb = parseInt(c, 16);   // convert rrggbb to decimal
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >>  8) & 0xff;  // extract green
        var b = (rgb >>  0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        return luma < 150;
    };

    return my;
}

var $$ResponsiveTreeUtil = (new ResponsiveTreeUtil())();