/*
 * Fonctions pour parser les donnees
 */
function parseData(data){
	var nodeArray = [];
	var dataFiltered = [];
	var reg = new RegExp("[ ,;]+", "g");
	var keyArray = [];
	var valueArray = [];
	var date;
	var close;
	// On parse le fichier pour 
	// qu'il soit accepte par d3js
	data.forEach(function(d){
		for (property in d) {
			// Si les proprietes ont
			// besoins d'etre splitee
			if(property.match(reg)){
				keyArray = property.split(reg);
				valueArray = d[property].split(reg);
				for (var i = 0; i < valueArray.length; i++) {
					if(isNaN(valueArray[i])){
						d["date"] = valueArray[i];
					}
					else{
						d["close"] = valueArray[i];
					}
				}
				delete d[property]; 
			}
		}
		// Si les valeurs sont non coherentes
		if(d.close != "." && d.date != "."){
			dataFiltered.push(d);
		}
	});
	// Mise des bons noms de keys
	if(!data[0].close || !data[0].date){
		dataFiltered.forEach(
			function(node) { 			
				for (property in node) {
					if(isNaN(node[property])){
						node["date"] = node[property];
						delete node[property];
					}
					else{
						node["close"] = node[property];
						delete node[property];
					}
				}
			}
		);
	}
	return dataFiltered;
};