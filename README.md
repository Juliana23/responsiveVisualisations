responsiveVisualisations
========================

1. Choisir visualisation simple et un jeu de données

Visualisation Area Chart
Jeu de données : fichier tsv avec des dates pour l'axe des absisses et des points marqués pour l'axe des ordonnés

2. Mettre en place le responsive

Utiliser les outils du lien :
https://blog.safaribooksonline.com/2014/02/17/building-responsible-visualizations-d3-js/

On peut redimensionner la fenêtre en ayant le graphique qui s'adapte et qui ne surcharge pas les données sur les axes.
Ce non surchargement des axes se fait grâce à ces lignes de codes :

		yAxis.ticks(Math.max(height / 50, 2));
		xAxis.ticks(Math.max(width / 100, 2));

La fonction ticks met le nombre de données que nous voulons sur les axes. Nous prenons donc en compte la taille de la fenêtre qui vient d'être redimensionnée.

3. Mettre en place la généricité

Utiliser les outils du lien : 
http://bost.ocks.org/mike/chart/ 