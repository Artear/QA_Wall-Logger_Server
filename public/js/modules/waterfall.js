define(['d3'], function () {

    var waterfall = {},
        config = {
            leftMargin: 0,
            recWidth: 5,
            recHeight: 30,
            numTicks: 5,
            svgWidth: 1000,
            lineHeight: 16
        };

    waterfall.setConfig = function (newconfig){
        for(var element in newconfig) {
            config[element] = newconfig[element]
        }
    }

    waterfall.showme = function (attachTo, data, maxData, breaks) {

        var wtf = data.waterfall;

        config.numTicks =  Math.ceil(maxData/500);
        config.svgHeight = (wtf.length * config.recHeight) + config.lineHeight;
        config.barchange = wtf.length - 3;
        config.verticallineHeight = wtf.length * config.recHeight;

        // Append the chart and pad it a bit
        var chart = d3.select(attachTo).append("svg")
            .attr("class", "chart")
            .attr("width", config.svgWidth)
            .attr("height", config.svgHeight);

        var colorScale = d3.scale.category10();

        // Set the x-axis scale
        var x = d3.scale.linear()
            .domain([0, maxData])
            .range([0, config.svgWidth - config.leftMargin]);

        // The main graph area
        chart = chart.append("g")
            .attr("class","gMainGraphArea");

        //Zebra shit
        chart.append("g")
            .attr("transform", "translate(0," + config.lineHeight + ")")
            .attr('class', 'zebra')
            .selectAll("rect")
            .data(wtf)
            .enter().append("rect")
            .attr("x",0)
            .attr("y",
            function(d, i) {
                return i * config.recHeight;
            })
            .attr("height", 30)
            .attr("width",config.svgWidth)
            .text(null)

        // Set the vertical lines for axis
        chart.append("g")
            .attr("transform", "translate(" + config.leftMargin + "," + config.lineHeight + ")")
            .attr('class', 'vertical-lines')
            .selectAll("line")
            .data(x.ticks(config.numTicks))
            .enter().append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", 0)
            .attr("y2",0)
            .transition().duration(1500)
            .attr("y2", config.verticallineHeight)




        // Color bars
        chart.append("g")
            .attr('class', 'bars')
            .attr("transform", "translate(" + config.leftMargin + "," + config.lineHeight + ")")
            .selectAll("rect")
            .data(wtf)
            .enter().append("rect")
            .attr("class",
                function(d,i){
                    return "item-bar mime-" + d.mime;
                })
            .attr("x",
                function(d,i){
                    return x(d.end - d.count);
                })
            .attr("y",
                function(d, i) {
                    return i * config.recHeight;
                })
            .attr("height", 30)
            .attr("width",0)
            .attr('rx', 5)
            .attr('ry', 5)
            .transition().duration(1000)
            .attr("width",
                function(d, i) {
                    return x(d.count);
                });

        // Set the vertical lines for axis
        chart.append("g")
            .attr("transform", "translate(" + config.leftMargin + "," + config.lineHeight + ")")
            .attr('class', 'breakpoints')
            .selectAll("line")
            .data(data.breakpoints)
            .enter().append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", 0)
            .attr("y2",0)
            .attr('class','test')
            .transition().duration(1500)
            .attr("y2", config.verticallineHeight);

        // Set the values on the bars
        chart.append("g")
            .attr("transform", "translate(" + config.leftMargin + "," + config.lineHeight + ")")
            .selectAll("text")
            .data(wtf)
            .enter().append("text")
            .attr("class","bar")
            .attr("x",
                function(d, i) {
                    if ( config.barchange > i ) {
                        myX = Math.ceil(x(d.end - d.count) + x(d.count));
                    } else {
                        myX = x(d.end - d.count) - 3
                    }
                    return myX;
                    //return x(d.end - (d.count/2)) ;
                })
            .attr("y", function(d, i) { return (i * config.recHeight) + config.lineHeight + (7/2); })
            .attr("dx", 0) // padding-right
            .attr("dy", 0) // vertical-align: middle
            .attr("text-anchor",
                function(d,i){
                    return config.barchange > i ? 'start' : 'end'
                }) // text-align
            .text(function(d, i) { return (d.count) + "ms"; });



        // Set the numbering on the lines for axis
        chart.append("g")
            .attr("transform", "translate(" + config.leftMargin + "," + config.lineHeight + ")")
            .selectAll("rule")
            .data(x.ticks(config.numTicks))
            .enter().append("text")
            .attr("class", "rule")
            .attr("x", x)
            .attr("y", 0)
            .attr("dy", -3)
            .attr("text-anchor", "middle")
            .text(function(d,i){
                return (d/1000);
            });

        // Text in the left, if avaiable
        chart.append("g")
            .attr("transform", "translate(0," + config.lineHeight + ")")
            .selectAll("text")
            .data(wtf)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", function(d, i) { return (i * config.recHeight) + config.lineHeight + (7/2); })
            .attr("dx", 0) // padding-right
            .attr("dy", 0) // vertical-align: middle
            .attr('width', config.leftMargin )
            .text(function(d, i) { return (d.name); })
            .each(function(d){
                    var self = d3.select(this),
                        textLength = self.node().getComputedTextLength(),
                        text = self.text();
                    while ( ( textLength > self.attr('width') )&& text.length > 0) {
                        text = text.slice(0, -1);
                        self.text(text + '...');
                        textLength = self.node().getComputedTextLength();
                    }
                });





    };


    return waterfall;

});