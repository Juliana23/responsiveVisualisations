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
    }

    return my;
}

var $$ResponsiveTreeUtil = (new ResponsiveTreeUtil())();