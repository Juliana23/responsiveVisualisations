/**
 * <b>Responsive TreeUtil For d3js library :</b><br/>
 * <br/>
 * Responive treeUtil offers several tools for trees
 * <br/>
 * It already instanciate, to use it you have to use the variable: <br/>
 * - $$ResponsiveTreeUtil
 * <br/>
 * <b>Example:</b><br/>
 * var allParents = $$ResponsiveTreeUtil.getAllParents(d);
 * <br/>
 * @class ResponsiveTreeUtil
 * @constructor
 * @version 0.1
 * @author Leclaire Juliana
 * @support d3js v3
 */
function ResponsiveTreeUtil() {

    /**
     * ResponsiveTreeUtil Constructor
     *
     * @method my
     * @public
     * @constructor
     */
    function my() {
        my.id = 0;

        my.instance = null;
        
        return my;
    };
    
    /**
     * Get all parents on node
     * 
     * @method getAllParents
     * @public
     * @param {Object} node node to get all parents
     * @return {Array} parents of node
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
     * To know if text needs 
     * to be in light color
     * 
     * @method needLightColor
     * @public
     * @param {Object} color color to evaluate
     * @return {Boolean} true if the text needs light color
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