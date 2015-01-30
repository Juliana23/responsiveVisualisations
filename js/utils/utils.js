/*
 * Ces fonctions recupere la hauteur et
 * la largeur de l'ecran
 */

function getWidth() {
	xWidth = null;
	if (window.screen != null)
		xWidth = window.screen.availWidth;

	if (window.innerWidth != null)
		xWidth = window.innerWidth;

	if (document.body != null)
		xWidth = document.body.clientWidth;

	return xWidth;
}
function getHeight() {
	xHeight = null;
	if (window.screen != null)
		xHeight = window.screen.availHeight;

	if (window.innerHeight != null)
		xHeight = window.innerHeight;

	if (document.body != null)
		xHeight = document.body.clientHeight;

	return xHeight;
}

//Used to detect whether the users browser is an mobile browser
function isMobile() {
	///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
	///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>

	if (sessionStorage.desktop) // desktop storage 
		return false;
	else if (localStorage.mobile) // mobile storage
		return true;

	// alternative
	var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile']; 
	for (var i in mobile){
		if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0){
			return true;
		}
	}
	// nothing found.. assume desktop
	return false;
}