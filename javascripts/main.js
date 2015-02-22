window.onresize = resizeIframe;
		function resizeIframe() {
			var height = window.innerHeight - 
			(document.getElementById("header").clientHeight || document.getElementById("header").offsetHeight) - 
			(document.getElementById("footer").clientHeight|| document.getElementById("footer").offsetHeight);
			document.getElementById("visualization").style.height = height + 'px';
		}
		
		function changeSrcIframe(visualization) {
			var nameVisualization;
			var nameSource;
			var titleSelected;
			var titleRemove1;
			var titleRemove2;
			if(visualization){
				nameVisualization = visualization;
				if(nameVisualization.toUpperCase() === "treemap".toUpperCase()){
					nameSource = "treemap.html";
					titleSelected = "title2_main_content";
					titleRemove1 = "title1_main_content";
					titleRemove2 = "title3_main_content";
				}
				else if(nameVisualization.toUpperCase() === "timeline".toUpperCase()){
					nameSource = "timeline.html";
					titleSelected = "title1_main_content";
					titleRemove1 = "title2_main_content";
					titleRemove2 = "title3_main_content";
				}
				else{
					nameSource = "presentation.html";
					titleSelected = "title3_main_content";
					titleRemove1 = "title1_main_content";
					titleRemove2 = "title2_main_content";
				}
			}
			document.getElementById("visualization").src = nameSource;
			document.getElementById(titleSelected).className = "title_selected";
			document.getElementById(titleRemove1).className = "";
			document.getElementById(titleRemove2).className = "";
		}
		
		function changeSrcIframeRight() {
			var nameVisualization;
			var nameSource;
			var titleSelected;
			var titleRemove1;
			var titleRemove2;
			
			var name = document.getElementById("visualization").src.split( '/' );
			var query = name[name.length-1].split( '.html' );
			nameVisualization = query[0];
			if(nameVisualization.toUpperCase() === "timeline".toUpperCase()){
				nameSource = "treemap.html";
				titleSelected = "title2_main_content";
				titleRemove1 = "title1_main_content";
				titleRemove2 = "title3_main_content";
			}
			else if(nameVisualization.toUpperCase() === "treemap".toUpperCase()){
				nameSource = "presentation.html";
				titleSelected = "title3_main_content";
				titleRemove1 = "title1_main_content";
				titleRemove2 = "title2_main_content";
			}
			else{
				nameSource = "timeline.html";
				titleSelected = "title1_main_content";
				titleRemove1 = "title2_main_content";
				titleRemove2 = "title3_main_content";
			}
			document.getElementById("visualization").src = nameSource;
			document.getElementById(titleSelected).className = "title_selected";
			document.getElementById(titleRemove1).className = "";
			document.getElementById(titleRemove2).className = "";
		}
		
		function changeSrcIframeLeft() {
			var nameVisualization;
			var nameSource;
			var titleSelected;
			var titleRemove1;
			var titleRemove2;
			
			var name = document.getElementById("visualization").src.split( '/' );
			var query = name[name.length-1].split( '.html' );
			nameVisualization = query[0];
			if(nameVisualization.toUpperCase() === "timeline".toUpperCase()){
				nameSource = "presentation.html";
				titleSelected = "title3_main_content";
				titleRemove1 = "title1_main_content";
				titleRemove2 = "title2_main_content";
			}
			else if(nameVisualization.toUpperCase() === "treemap".toUpperCase()){
				nameSource = "timeline.html";
				titleSelected = "title1_main_content";
				titleRemove1 = "title2_main_content";
				titleRemove2 = "title3_main_content";
			}
			else{
				nameSource = "treemap.html";
				titleSelected = "title2_main_content";
				titleRemove1 = "title1_main_content";
				titleRemove2 = "title3_main_content";
			}
			document.getElementById("visualization").src = nameSource;
			document.getElementById(titleSelected).className = "title_selected";
			document.getElementById(titleRemove1).className = "";
			document.getElementById(titleRemove2).className = "";
		}
		
		new ResponsiveEvent({
			object : d3.select(window).each(function(d,i){
				Hammer(this, {
					prevent_default: true,
					no_mouseevents: true
				})
			}),
        	events : [
        		{"name": "swiperight", "func": changeSrcIframeLeft, "extend": false},
        		{"name": "swipeleft", "func": changeSrcIframeRight, "extend": false}
        	]
        })();
		
		function enterFullScreen(){
            var elem = document.getElementById('visualization');
            if (screenfull.enabled) {
                screenfull.request(elem);
            }                    
        }
        
        window.onkeypress = function (e) {
            if(e.keyCode === 32){
                enterFullScreen();
            }
        };
//        
//        $(document).ready(function(){
//        	new ResponsiveEvent({
//    			object : d3.select("#title4_main_content").each(function(d,i){
//    				Hammer(this, {
//    					prevent_default: true,
//    					no_mouseevents: true
//    				})
//    			}),
//            	events : [
//            		{"name": "tap", "func": locationDoc, "extend": false}
//            	]
//            })();
//    		
//    		function locationDoc(){
//    			window.open("./doc", '_blank');
//    		}
//        });
