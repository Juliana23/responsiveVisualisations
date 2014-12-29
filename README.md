Responsive Visualisations
========================

Choisir visualisation simple et un jeu de donn�es
--------------

Visualisation de base : Visualisation TimeLine
Jeu de donn�es : fichier tsv avec des dates pour l'axe des absisses et des points marqu�s pour l'axe des ordonn�s

Mettre en place le responsive
--------------

Utiliser les outils du lien :
https://blog.safaribooksonline.com/2014/02/17/building-responsible-visualizations-d3-js/

On peut redimensionner la fen�tre en ayant le graphique qui s'adapte et qui ne surcharge pas les donn�es sur les axes.
Ce non surchargement des axes se fait gr�ce � ces lignes de codes :

		yAxis.ticks(Math.max(height / 50, 2));
		xAxis.ticks(Math.max(width / 100, 2));

La fonction ticks met le nombre de donn�es que nous voulons sur les axes. Nous prenons donc en compte la taille de la fen�tre qui vient d'�tre redimensionn�e.

Mettre en place la g�n�ricit�
--------------

Utiliser les outils du lien : 
http://bost.ocks.org/mike/chart/ 