var sp500 = {
		url: "./data/sp500.tsv",
		formatDate: "%Y-%m-%d"
};
var dataProducts = {
		url: "./data/dataProducts.tsv",
		formatDate: "%Y-%m"
};
var dataFemaleUs = {
		url: "./data/dataFemaleUs.tsv",
		formatDate: "%Y-%m"
};
function data(file){
	d3.tsv(file.url, function(error, data) {
		var dataFiltered = parseData(data);
		if (error)
			alert(error);
		var options = {
				height : window.innerHeight - 120,
				width : window.innerWidth - 120,
				margin : 60,
				brush : {
					height : 50,
					marginTop : 30
				},
				data : dataFiltered,
				formatDate: file.formatDate
		};
		var my = TimeLine(options);
		my();
	});
};

var flare = {
		url: "./data/flare.json"
};

function dataTreeMap(file){
	d3.json(file.url, function(error, data) {
		if (error)
			alert(error);
		var options = {
				height : window.innerHeight - 120,
				width : window.innerWidth - 120,
				margin : 60,
				data : data
		};
		var my = TreeMap(options);
		my();
	});
};