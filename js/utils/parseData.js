/*
 * Fonctions pour parser les donnees
 */

function parseData(data){
	var dataFiltered = [];
	data.forEach(function(d){
		if(d.close != "."){
			dataFiltered.push(d);
		}
	});
	return dataFiltered;
};