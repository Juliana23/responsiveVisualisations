function TimeLine(options) {
    options = options || {};

    function my() {
        my.init(options);

        function resize() {
            if (parseInt(d3.select("#graph").style("height")) < 200) {
                my.brushHeight(0);
            }
            else if (parseInt(d3.select("#graph").style("height")) < 400) {
                my.brushHeight(30);
            }
            else {
                my.brushHeight(50);
            }

            var width = parseInt(d3.select("#graph").style("width")) - my.margin() * 2,
                    height = parseInt(d3.select("#graph").style("height")) - my.brushHeight() - options.brush.marginTop - my.margin() * 2;

            // Modification de la hauteur et de la largeur
            my.resize(height, width);

            // Redessine le graphe de maniere reponsive
            my.redraw();
        }

        d3.select(window).on('resize', resize);
    }

    my.init = function (options) {
        //On cree un nouveau noeud <svg>
        my.margin(options.margin || 60);
        my.svg(d3.select("body").append("svg").attr("id", "graph")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight));
        my.svg().append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", window.innerWidth - (2 * my.margin()))
                .attr("height", window.innerHeight);

        // Initialisation de la taille du graphe
        my.width(options.width || parseInt(d3.select("#graph").style("width")) - my.margin() * 2);
        my.height(options.height || parseInt(d3.select("#graph").style("height")) - my.margin() * 2);

        // Initialisation des donnees
        my.initData(options.data);

        // Initialisation de la map
        my.initMap(my.data());

        // Initialisation des axes
        my.initX(my.width(), my.data());
        my.initY(my.height(), my.data());
        my.xAxis(d3.svg.axis().scale(my.x()).orient("bottom"));
        my.yAxis(d3.svg.axis().scale(my.y()).orient("left"));

        // Initialisation du brush
        my.initBrush(options.brush || {});

        // Initialisation du tooltip
        my.initTooltip(my.width());

        // Initialisation du graphe
        my.initGraph(my.margin(), my.height(), my.width(), my.xAxis(), my.yAxis(), my.data());

        // Initialisation de la ligne verticale
        my.initVerticalLine(my.graph(), my.height());

        // Initialisation du rectangle
        my.initRect(my.svg(), my.width(), my.height(), my.margin());

        /*
         * On recupere la premiere et derniere
         * valeur pour les afficher avec un cercle
         * si la visualisation est trop petite
         */
        if (options.firstEndCircle) {
            my.updateFirstEndCircle(my.graph(), my.firstRecord(), my.lastRecord());
        }

        // On met les evenements sur le graphe a jour
        my.updateMove(my.rect(), "mousemove", "mouseout", true);
        my.updateMove(my.rect(), "touchmove", "touchend", false);

        // Resize du graph
        my.resize(my.height(), my.width());

        // Redessine le graphe de maniere reponsive
        my.redraw();

        return my;
    };

    /*
     * Fonctions d'initialisation
     */

    my.initData = function (pData) {
        var data = pData || [];
        var parseDate = d3.time.format("%Y-%m").parse;
        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });
        my.data(data);
        my.firstRecord(data[0]);
        my.lastRecord(data[data.length - 1]);
    };

    my.initMap = function (data) {
        var map = {};
        data.forEach(function (d) {
            map[d.date] = d;
        });
        my.map(map);
    };

    my.initX = function (width, data) {
        var x = d3.time.scale()
                .range([0, width])
                .nice(d3.time.year);
        x.domain(d3.extent(data, function (d) {
            return d.date;
        }));
        my.x(x);
    };

    my.initY = function (height, data) {
        var y = d3.scale.linear()
                .range([height, 0])
                .nice();
        y.domain([0, d3.max(data, function (d) {
                return d.close;
            })]);
        my.y(y);
    };

    my.initTooltip = function (width) {
        var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .attr("x", width)
                .attr("y", 0)
                .style("opacity", 0);
        my.tooltip(tooltip);
    };

    my.initVerticalLine = function (graph, height) {
        var verticalLine = graph.append("line")
                .attr("class", "verticalLine")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", height)
                .style("opacity", 0);
        my.verticalLine(verticalLine);
    };

    my.initGraph = function (margin, height, width, xAxis, yAxis, data) {
        var graph = d3.select("#graph")
                .append("g")
                .attr("class", "focus");

        if (margin) {
            graph.attr("transform", "translate(" + margin + "," + margin + ")");
        }

        /*
         * On definit la visualisation principale
         */

        // Definition un zone
        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return my.x()(d.date);
                })
                .y0(my.height())
                .y1(function (d) {
                    return my.y()(d.close);
                });
        my.area(area);

        var dataPerPixel = data.length / width;
        var dataResampled = data.filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        graph.append("path")
                .datum(dataResampled)
                .attr("class", "area")
                .attr("d", area);

        graph.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        graph.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

        my.graph(graph);
    };

    my.initRect = function (container, width, height, margin) {
        // On cree un rectangle par dessus la visualisation
        var rect = container.append("rect")
                .attr("width", width + margin)
                .attr("height", height + margin)
                .style("opacity", 0)
                .attr("class", "onMouseMove");
        my.rect(rect);
    };

    my.initBrush = function (brushOpts) {
        if (!brushOpts) {
            return;
        }

        // Height
        my.brushHeight(brushOpts.height);
        // Revu de la taille du graph original
        my.height(my.height() - my.brushHeight() - my.margin());
        my.initY(my.height(), my.data());
        my.yAxis(d3.svg.axis().scale(my.y()).orient("left"));

        // Axes
        my.brushX(d3.time.scale().range([0, my.width()]));
        my.brushX().domain(my.x().domain());
        my.brushY(d3.scale.linear().range([my.brushHeight(), 0]).nice());
        my.brushY().domain(my.y().domain());
        my.brushXAxis(d3.svg.axis().scale(my.brushX()).orient("bottom"));

        // Definition du brush 
        var brush = d3.svg.brush()
                .x(my.brushX())
                .on("brush",
                        function () {
                            my.brushed();
                        }
                );
        my.brush(brush);

        // Definition du context
        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return my.brushX()(d.date);
                })
                .y0(my.brushHeight())
                .y1(function (d) {
                    return my.brushY()(d.close);
                });
        my.brushArea(area);
        my.initContext(area);
    };

    my.initContext = function (area) {
        var context = my.svg().append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + my.margin() + "," + (my.height() + my.margin() + options.brush.marginTop) + ")");

        var dataPerPixel = my.data().length / my.width();
        var dataResampled = my.data().filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        context.append("path")
                .datum(dataResampled)
                .attr("class", "area")
                .attr("d", area);

        context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + my.brushHeight() + ")")
                .call(my.brushXAxis());

        context.append("g")
                .attr("class", "x brush")
                .call(my.brush())
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", my.brushHeight() + 7);

        my.context(context);
    };

    /*
     * Getters AND Setters
     */

    my.svg = function (newSvg) {
        if (!arguments.length) {
            return svg;
        }
        svg = newSvg;
        return my;
    };

    my.tooltip = function (newTooltip) {
        if (!arguments.length) {
            return tooltip;
        }
        tooltip = newTooltip;
        return my;
    };

    my.verticalLine = function (newVerticalLine) {
        if (!arguments.length) {
            return verticalLine;
        }
        verticalLine = newVerticalLine;
        return my;
    };

    my.graph = function (newGraph) {
        if (!arguments.length) {
            return graph;
        }
        graph = newGraph;
        return my;
    };

    my.map = function (newMap) {
        if (!arguments.length) {
            return map;
        }
        map = newMap;
        return my;
    };

    my.data = function (newData) {
        if (!arguments.length) {
            return data;
        }
        data = newData;
        return my;
    };

    my.width = function (newWidth) {
        if (!arguments.length) {
            return width;
        }
        width = newWidth;
        return my;
    };

    my.height = function (newHeight) {
        if (!arguments.length) {
            return height;
        }
        height = newHeight;
        return my;
    };

    my.x = function (newX) {
        if (!arguments.length) {
            return x;
        }
        x = newX;
        return my;
    };

    my.y = function (newY) {
        if (!arguments.length) {
            return y;
        }
        y = newY;
        return my;
    };

    my.xAxis = function (newXAxis) {
        if (!arguments.length) {
            return xAxis;
        }
        xAxis = newXAxis;
        return my;
    };

    my.yAxis = function (newYAxis) {
        if (!arguments.length) {
            return yAxis;
        }
        yAxis = newYAxis;
        return my;
    };

    my.margin = function (newMargin) {
        if (!arguments.length) {
            return margin;
        }
        margin = newMargin;
        return my;
    };

    my.lastRecord = function (newLastRecord) {
        if (!arguments.length) {
            return lastRecord;
        }
        lastRecord = newLastRecord;
        return my;
    };

    my.firstRecord = function (newFirstRecord) {
        if (!arguments.length) {
            return firstRecord;
        }
        firstRecord = newFirstRecord;
        return my;
    };

    my.rect = function (newRect) {
        if (!arguments.length) {
            return rect;
        }
        rect = newRect;
        return my;
    };

    my.updateArgsRect = function (width, height, margin) {
        if (!arguments.length) {
            return my.rect();
        }
        my.rect()
                .attr("width", width + margin)
                .attr("height", height + margin);

        return my.rect();
    };

    my.updateArgsVerticalLine = function (height) {
        if (!arguments.length) {
            return my.verticalLine();
        }
        my.verticalLine()
                .attr("y2", height);

        return my.verticalLine();
    };

    my.area = function (newArea) {
        if (!arguments.length) {
            return area;
        }
        area = newArea;
        return my;
    };

    /*
     * Setters et Getters du Brush
     */

    my.brush = function (newBrush) {
        if (!arguments.length) {
            return brush;
        }
        brush = newBrush;
        return my;
    };

    my.brushHeight = function (newBrushHeight) {
        if (!arguments.length) {
            return brushHeight;
        }
        brushHeight = newBrushHeight;
        return my;
    };

    my.brushX = function (newBrushX) {
        if (!arguments.length) {
            return brushX;
        }
        brushX = newBrushX;
        return my;
    };

    my.brushY = function (newBrushY) {
        if (!arguments.length) {
            return brushY;
        }
        brushY = newBrushY;
        return my;
    };

    my.brushXAxis = function (newBrushXAxis) {
        if (!arguments.length) {
            return brushXAxis;
        }
        brushXAxis = newBrushXAxis;
        return my;
    };

    my.brushYAxis = function (newBrushYAxis) {
        if (!arguments.length) {
            return brushYAxis;
        }
        brushYAxis = newBrushYAxis;
        return my;
    };

    my.focus = function (newFocus) {
        if (!arguments.length) {
            return focus;
        }
        focus = newFocus;
        return my;
    };

    my.context = function (newContext) {
        if (!arguments.length) {
            return context;
        }
        context = newContext;
        return my;
    };

    my.brushArea = function (newBrushArea) {
        if (!arguments.length) {
            return brushArea;
        }
        brushArea = newBrushArea;
        return my;
    };

    /*
     * Methods
     */
    
    /*
     * Cette methode applique les redimensions
     * de la visualisation
     */
    my.resize = function (height, width) {
        if (arguments.length) {
            my.height(height);
            my.width(width);
        }

        my.x().range([0, my.width()]);
        my.svg().attr("width", my.width());
        if(my.height() > 0){
            my.y().range([my.height(), 0]);
            my.svg().attr("height", my.height());
        }

        my.updateArgsRect(my.width(), my.height(), my.margin());
        my.updateArgsVerticalLine(my.height());
        return my;
    };

    /*
     * Cette methode redessine le graphe
     */
    my.redraw = function () {
        my.svg().select("rect")
                .attr("width", window.innerWidth - (2 * my.margin()))
                .attr("height", window.innerHeight);

        my.verticalLine().attr("height", my.height());

        if (my.width() < 300 && my.height() < 80) {
            my.graph().select('.x.axis').style("display", "none");
            my.graph().select('.y.axis').style("display", "none");

            my.graph().select(".first")
                    .attr("transform", "translate(" + my.x()(my.firstRecord().date) +
                            "," + my.y()(my.firstRecord().close) + ")")
                    .style("display", "initial");

            my.graph().select(".last")
                    .attr("transform", "translate(" + my.x()(my.lastRecord().date) +
                            "," + my.y()(my.lastRecord().close) + ")")
                    .style("display", "initial");
        }
        else {
            my.graph().select('.x.axis').style("display", "initial");
            my.graph().select('.y.axis').style("display", "initial");
            my.graph().select(".last").style("display", "none");
            my.graph().select(".first").style("display", "none");
        }

        // On redefinit la quantite d'information sur les axes X & Y
        if(getWidth() > 768){
            my.xAxis().ticks(Math.max(my.width() / 100, 2));
        }
        else if(getWidth() <= 768){
            my.xAxis().ticks(Math.max(my.width() / 150, 2));
        }
        else if(getWidth() <= 480){
            my.xAxis().ticks(Math.max(my.width() / 200, 2));
        }
        else if(getWidth() <= 320){
            my.xAxis().ticks(Math.max(my.width() / 300, 2));
        }
        // Axe des y
        if(getHeight() > 768){
            my.yAxis().ticks(Math.max(my.height() / 100, 2));
        }
        else if(getHeight() <= 768){
            my.yAxis().ticks(Math.max(my.height() / 150, 2));
        }
        else if(getHeight() <= 480){
            my.yAxis().ticks(Math.max(my.height() / 200, 2));
        }
        else if(getHeight() <= 320){
            my.yAxis().ticks(Math.max(my.height() / 300, 2));
        }

        my.graph().select('.x.axis')
                .attr("transform", "translate(0," + my.height() + ")")
                .call(my.xAxis());

        my.graph().select('.y.axis')
                .call(my.yAxis());

        var dataPerPixel = my.data().length / my.width();
        var dataResampled = my.data().filter(function (d, i) {
            return i % Math.ceil(dataPerPixel) === 0;
        });

        my.area().y0(my.height());
        my.graph().select('.area').datum(dataResampled).attr("d", my.area());

        // Resize du brush
        my.brushX().range([0, my.width()]);
        my.brushY().range([my.brushHeight(), 0]);
        my.brushXAxis().ticks(Math.max(my.width() / 100, 2));
        my.context().attr("transform", "translate(" + my.margin() + "," + (my.height() + my.margin() + options.brush.marginTop) + ")");
        my.context().select('.x.axis')
                .attr("transform", "translate(0," + my.brushHeight() + ")")
                .call(my.brushXAxis());
        my.brushArea().y0(my.brushHeight());
        my.context().select('.area').datum(dataResampled).attr("d", my.brushArea());
    };

    /*
     * Cette methode met a jour les cercles 
     * de la premiere et derniere valeur
     */
    my.updateFirstEndCircle = function (graph, firstRecord, lastRecord) {
        var first = graph.append("g")
                .attr("class", "first")
                .style("display", "none");

        first.append("text")
                .attr("x", -8)
                .attr("y", 4)
                .attr("text-anchor", "end")
                .text(firstRecord.close);
        first.append("circle").attr("r", 4);

        var last = graph.append("g")
                .attr("class", "last")
                .style("display", "none");

        last.append("text")
                .attr("x", 8)
                .attr("y", 4)
                .text(lastRecord.close);
        last.append("circle")
                .attr("r", 4);
    };

    /*
     * Cette methode applique les etiquettes
     * lorsqu'on se deplace sur la courbe
     */
    my.updateMove = function (container, event, eventEnd, onDesktop) {
        var formatter = d3.time.format("%d/%m/%Y");

        container.on(event, function () {
            var verticalLine = my.verticalLine();
            var tooltip = my.tooltip();
            var map = my.map();
            var margin = my.margin();
            var height = my.height();
            var width = my.width();

            // Recuperation de la position X & Y
            var cursor;
            if (onDesktop) {
                cursor = d3.mouse(this);
            }
            else {
                cursor = d3.touches(this)[0];
            }
            var cursor_x = parseInt(cursor[0]);
            var cursor_y = parseInt(cursor[1]);

            // Si la position de la souris est en dehors de la zone du graphique, 
            // on arrete le traitement
            if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
                return;
            }

            // Grace a la fonction 'invert' on peut recuperer les valeurs
            // correspondant a notre position
            // Il faut soustraire la marge pour que la valeur soit correct.
            var selectedDate = x.invert(cursor_x - margin);
            var selectedClose = Number((y.invert(cursor_y - margin)).toFixed(2));

            // Positionnement de la barre verticale
            // en tenant compte de la marge
            verticalLine.attr("x1", cursor_x - margin);
            verticalLine.attr("x2", cursor_x - margin);
            verticalLine.style("opacity", 1);

            selectedDate.setHours(0, 0, 0, 0);
            var entry = map[selectedDate];
            if (typeof entry === "undefined") {
                entry = {
                    date: selectedDate,
                    close: selectedClose
                };
            }

            // On affiche l'etiquette associee
            tooltip
                    .style("opacity", .9);
            tooltip
                    .style("left", (onDesktop ? ((d3.event.pageX + 50 < width) ? d3.event.pageX + 50
                            : (d3.event.pageX - 150 < margin) ? d3.event.pageX - 10 : d3.event.pageX - 150)
                            : ((cursor_x + 50 < width) ? cursor_x + 50
                                    : (cursor_x - 150 < margin) ? cursor_x - 10 : cursor_x - 150)) + "px")
                    .style("top", ((onDesktop ? d3.event.pageY : cursor_y) - 50) + "px")
                    .html("<b>Date : </b>" + formatter(entry.date) + "<br>"
                            + "<b>Valeur : </b>" + entry.close + "<br>");
        })
        .on(eventEnd, function () {
            if (onDesktop) {
                var cursor = d3.mouse(this);
                var cursor_x = parseInt(cursor[0]);
                var cursor_y = parseInt(cursor[1]);
                // Si la position de la souris est en dehors de la zone du graphique, 
                // on masque la ligne et le tooltip
                if (cursor_x < margin || cursor_x > (width + margin) || cursor_y < margin || cursor_y > (height + margin)) {
                    tooltip.style("opacity", 0);
                    verticalLine.style("opacity", 0);
                }
            }
            else {
                tooltip.style("opacity", 0);
                verticalLine.style("opacity", 0);
            }
        });
    };


    /*
     * Methods du Brush
     */
    my.brushed = function () {
        my.x().domain(my.brush().empty() ? my.brushX().domain() : my.brush().extent());
        my.graph().select(".area").attr("d", my.area());
        my.graph().select(".x.axis").call(my.xAxis());
    };

    return my;

}
;