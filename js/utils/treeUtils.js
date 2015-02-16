/*
 * Fonction qui recupere les parents
 * de node passe en parametre 
 */
function getAllParents(node){
    var parents = [];
    while(node.parent){
        parents.push(node.parent);
        node = node.parent;
    }
    return parents;
}

//function getMinX(nodes){
//	var minX = [];
//	var min = nodes[0];
//	nodes.forEach(function(node){
//		if(node.x < min.x){
//			min = node;
//		}
//	}
//	nodes.forEach(function(node){
//		if(node.x === min.x){
//			minX.push(node);
//		}
//	}
//	return minX;
//}

/*
 * Fonction qui recupere les quatres extremites
 * d'un groupe de rectangles afin de pouvoir les
 * encadrer
 */
function getOutline(nodes){
	var maxTopLeft = nodes[0];
	var maxTopRight = nodes[0];
	var	minBottomLeft = nodes[0];
	
	var xMin = nodes[0].x;
	var xMax = nodes[0].x + nodes[0].dx;
	var yMin = nodes[0].y;
	var yMax = nodes[0].y + nodes[0].dy;
	
	nodes.forEach(function(node){
		if(node.x <= xMin){
			xMin = node.x;
		}
		if(node.y <= yMin){
			yMin = node.y;
		}
		if((node.x + node.dx) >= xMax){
			xMax = node.x + node.dx;
		}
		if((node.y + node.dy) >= yMax){
			yMax = node.y + node.dy;
		}
	});
	
	var outline = [
	               {
	            	   x: xMin, y: yMin
	               },
	               {
	            	   x: xMax, y: yMin
	               },
	               {
	            	   x: xMax, y: yMax
	               },
	               {
	            	   x: xMin, y: yMax
	               },
	               {
	            	   x: xMin, y: yMin
	               }
	               ];
	return outline;
}

