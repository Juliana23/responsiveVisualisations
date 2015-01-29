function getAllParents(node){
    var parents = [];
    while(node.parent){
        parents.push(node.parent);
        node = node.parent;
    }
    return parents;
}

function getOutline(nodes){
	var maxTopLeft = nodes[0];
	var maxTopRight = nodes[0];
	var	minBottomLeft = nodes[0];
	
	nodes.forEach(function(node){
		// Max top left
		if(node.x <= maxTopLeft.x && node.y <= maxTopLeft.y){
			maxTopLeft = node;
		}
		// Max top right
		if((node.x + node.dx) >= (maxTopRight.x + maxTopRight.dx) && node.y <= maxTopRight.y){
			maxTopRight = node;
		}
		// Min bottom left
		if(node.x <= minBottomLeft.x && (node.y + node.dy) >= (minBottomLeft.y + minBottomLeft.dy)){
			minBottomLeft = node;
		}
	});
	
	var outline = [
	               {
	            	   x: maxTopLeft.x, y: maxTopLeft.y
	               },
	               {
	            	   x: maxTopRight.x + maxTopRight.dx, y: maxTopRight.y
	               },
	               {
	            	   x: maxTopRight.x + maxTopRight.dx, y: minBottomLeft.y + minBottomLeft.dy
	               },
	               {
	            	   x: minBottomLeft.x, y: minBottomLeft.y + minBottomLeft.dy
	               },
	               {
	            	   x: maxTopLeft.x, y: maxTopLeft.y
	               }
	               ];
	return outline;
}