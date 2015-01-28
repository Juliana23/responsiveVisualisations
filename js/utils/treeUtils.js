function getAllParents(node){
    var parents = [];
    while(node.parent){
        parents.push(node.parent);
        node = node.parent;
    }
    return parents;
}