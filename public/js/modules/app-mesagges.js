define(function (require) {

    var $ = require('jquery'),
        socket = null,
        bg = require('bargraph');

    var app = {};

    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect(data.localIp + ':' + data.socket_port +'/');
    }).done(function() {
        socket.on('log', processEvent);
        socket.emit('join', {room: 'statistics'});
    });

    var tasks = [];
    var devices = [];
    var currentDevice;

    /** Config **/
    var colorChartFont = "white";
    var titleAxisFontSize = 20;

    var updateInterval = 500;//Milliseconds

    var zoomAdditional = 0.2;


    var axisYViewportMinimum = 0;
    var axisYViewportMaximum = 1;

    var defaultXViewportMaximum = 1.5;
    var defaultXViewportMinimum = -4.5;

    var live = true;//false; DEBUG
    var controlMovement = false;
    /** ===== **/

    var select = document.getElementById('selectDevice');
    select.onchange=function(){
        var currentDeviceId = $(this).val();

        for(var i=0; i<devices.length; i++){
            if(devices[i].id === currentDeviceId){
                currentDevice = devices[i];
                currentDevice.cantTaskEvents = 0;
            }
        }

        renderChart();
    };

    var chart = new CanvasJS.Chart("chartContainer",{
        height: 600,
        backgroundColor: "#637077",
        legend: {
            fontSize: 15
        },
		zoomEnabled: true,
        zoomType: 'xy',
         rangeChanged: function(e){

            if (!(e.trigger === "reset") && !(e.axisY.viewportMinimum === null) &&
                !(e.axisY.viewportMaximum === null)) {
                axisYViewportMinimum = e.axisY.viewportMinimum;
                axisYViewportMaximum = e.axisY.viewportMaximum;
            }

            console.log("VIEWPORTMin: ", e.axisY.viewportMinimum);
            console.log("VIEWPORTMax: ", e.axisY.viewportMaximum);
//            console.log(e);
//            if (e.trigger === "reset") {
//                    chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
//                                zoomed = false;
//                }
//            else {
//                minRange = e.axisX.viewportMinimum;
//                    maxRange = e.axisX.viewportMaximum;
//                zoomed = true;
//                }
//            slideBy = 0;
          },
		axisY: {
			includeZero: false,
			title: "Tiempo",
			interval: 0.1,
            labelFontSize: 10,
            titleFontSize: titleAxisFontSize,
            labelFontColor: colorChartFont,
            titleFontColor: colorChartFont,
            viewportMinimum: axisYViewportMinimum,
            viewportMaximum: axisYViewportMaximum
        },
		axisX: {
			interval: 1,
			title: "Eventos",
            labelFontSize: 15,
            titleFontSize: titleAxisFontSize,
            labelFontColor: colorChartFont,
            titleFontColor: colorChartFont,
            viewportMaximum: defaultXViewportMaximum,
            viewportMinimum: defaultXViewportMinimum,
            labelFormatter: function ( e ) {
                            if(e.label === null){
                                    return "";
                            }
                            return e.label;
                        }
		},
        dataPointMaxWidth: 10,
		data: [
			{
				type: "rangeBar",
				yValueFormatString: "#0.## segundos",
				dataPoints: []
			}
		]
	});

	function renderEvent(data){

	    var yTime = [];

        console.log(currentDevice.firstTime);
        if(currentDevice.firstTime == 0){
            currentDevice.firstTime = data.time;
            console.log(currentDevice.firstTime);
        }

        tasks = chart.options.data[0].dataPoints;

        switch(data.type) {
            case "PERIOD_START":
                //Start of a task
                if(tasks.length == 0 ) {
                    tasks.push({x: currentDevice.cantTaskEvents * -1,
                                y: [0, 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                } else {
                    var calc =  (data.time - currentDevice.firstTime) / 1000.0;

                    tasks.push({x: currentDevice.cantTaskEvents * -1,
                                y: [calc, calc + 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                }

                currentDevice.cantTaskEvents++;
                break;
            case "PERIOD_END":
                //End of a task
                var j = 0;
                while(j< tasks.length && tasks[j].id != data.id) {
                    j++;
                }
                if(j != tasks.length) {
                    yTime = tasks[j].y;
                    tasks[j].y = [yTime[0], (data.time - currentDevice.firstTime) / 1000.0];
                    tasks[j].end = true;
                }
                break;
            case "EVENT":
                //EVENT
                var calc =  (data.time - currentDevice.firstTime) / 1000.0;
                tasks.push({x: 1, y: [calc, calc + 0.001], name: data.message, label: 'Eventos',
                    deviceId: data.deviceId, id: data.id, toolTipContent: "{name}"});
                break;
        }

        chart.render();
	}

	function resetChart(){
	    tasks.length = 0;
        chart.options.data[0].dataPoints.length = 0;
	}

    function renderChart(){

        resetChart();
        var currentEvents = getCurrentEvents();
        for(var i = 0; i< currentEvents.length; i++){
            renderEvent(currentEvents[i]);
        }
    }

    function getCurrentEvents(){
        return currentDevice.events;
    }

	function hasThisDevice(deviceId){

	    for(var i=0; i < devices.length; i++){
	        if(devices[i].id === deviceId){
	            return true;
	        }
	    }

	    return false;
	}

	function addNewEvent(data){

	    for(var i=0; i < devices.length; i++){
            if(devices[i].id === data.deviceId){
                devices[i].events.push(data);
            }
        }
	}

	function addSelectElement(device){
        var opt = document.createElement('option');
        opt.value = device.id;
        opt.innerHTML = device.id;
        select.appendChild(opt);

        //First time to set the current deviceId and can draw all the events
        if(currentDevice === undefined){
            currentDevice = device;
        }
    }

    function processEvent(data) {

        if(!hasThisDevice(data.deviceId)){
            var newDevice = {id: data.deviceId, firstTime: 0, events: [data], cantTaskEvents: 0 };
            devices.push(newDevice);
            addSelectElement(newDevice);
        }else{
            addNewEvent(data);
        }

        if(data.deviceId === currentDevice.id){
            renderEvent(data);
        }
    }

    chart.render();

    function timerChart(){
        if(live){

            var event;
            var yAux;
            var cantStartEndEvent = 0;

            tasks = chart.options.data[0].dataPoints;

            for(var i = 0; i< tasks.length; i++){

                event = tasks[i];

                //Is start-end Event? And not finished?
                if(event.x <= 0){
                    if(!event.end){
                        yAux = tasks[i].y;
                        yAux[1] = yAux[1] + 0.1;
                        tasks[i].y = yAux;
                    }
                    cantStartEndEvent++;
                }
            }

            //TODO insert in order desc or asc and prevent this...
            tasks.sort(compareEvents);
            var latestEvent = tasks[tasks.length - 1];

            if(!controlMovement && !(latestEvent === undefined)){

                //The latest event not fit on the screen and need to scroll right.

                var diff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;

                if(diff > 1){
                    if(latestEvent.y[1] > diff){
                        axisYViewportMinimum = latestEvent.y[1] - diff;
                        axisYViewportMaximum = latestEvent.y[1];
                    }

                }

                if(latestEvent.y[1] > 1){
                    axisYViewportMinimum = latestEvent.y[1] - 1;
                    axisYViewportMaximum = latestEvent.y[1];
                }

                //If a particular event scroll to up to visualize them
                if(latestEvent.x > 0){
                    chart.options.axisX.viewportMinimum = defaultXViewportMinimum;
                    chart.options.axisX.viewportMaximum = defaultXViewportMaximum;

                }else if(cantStartEndEvent > (5/1)){ //There are many Start-End Events and need to scroll down.

                    chart.options.axisX.viewportMinimum = -(cantStartEndEvent * 1) ;
                    chart.options.axisX.viewportMaximum = -(cantStartEndEvent * 1) + 5;
                }

            }

            updateChart();
        }
    }

    /**
    *
    *Return the last event on graph based axe Y.
    *(Note axe Y is horizontally, and axe X was vertically)
    *
    **/
    function compareEvents(event1, event2){
        return (event1.y[1] - event2.y[1]);
    }

    function updateChart(){

        chart.options.axisY.viewportMinimum = axisYViewportMinimum;
        chart.options.axisY.viewportMaximum = axisYViewportMaximum;

        chart.render();
    }

    var buttonSeeAll = document.getElementById("buttonSeeAll");
    buttonSeeAll.addEventListener("click", function() {

                     //TODO insert in order desc or asc and prevent this...
                     tasks.sort(compareEvents);
                     var latestEvent = tasks[tasks.length - 1];
                     var maxValue = latestEvent.y[1];

                     axisYViewportMinimum = 0;
                     axisYViewportMaximum = maxValue;

                     chart.options.axisX.viewportMinimum = -tasks.length - 0.5;
                     updateChart();

                 }, false);

    var buttonControlMovement = document.getElementById("buttonControlMovement");
    buttonControlMovement.addEventListener("click", function() {

                    controlMovement = !controlMovement;

                    if(controlMovement){
                        buttonControlMovement.value = "MOVE OFF";
                        buttonZoomIn.disabled = false;
                        buttonZoomOut.disabled = false;
                    }else{
                        buttonControlMovement.value = "MOVE ON";
                        buttonZoomIn.disabled = true;
                        buttonZoomOut.disabled = true;
                    }

                    tasks = chart.options.data[0].dataPoints;

                    //TODO insert in order desc or asc and prevent this...
                    tasks.sort(compareEvents);
                    var latestEvent = tasks[tasks.length - 1];

                    if(!controlMovement && !(latestEvent === undefined)){

                        var maxValue = latestEvent.y[1];

                        axisYViewportMinimum = maxValue - 1 < 0 ? 0 : maxValue - 1;
                        axisYViewportMaximum = maxValue;

                        console.log("viewportMinimum", axisYViewportMinimum);
                        console.log("viewportMaximum", axisYViewportMaximum);

                        //Fix refresh graph if no new content data
                        tasks[tasks.length - 1].y[1] = tasks[tasks.length - 1].y[1] + 0.0001;

                        updateChart();
                    }

                 }, false);

    var buttonZoomIn = document.getElementById("buttonZoomIn");
    buttonZoomIn.addEventListener("click", function() {


        if(axisYViewportMinimum < 0){
            axisYViewportMinimum = 0;
        }

        var diff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;

        if(diff >= zoomAdditional){
            axisYViewportMinimum = axisYViewportMinimum + zoomAdditional;
            axisYViewportMaximum = axisYViewportMaximum - zoomAdditional;

            updateChart();

            var newDiff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
            if(newDiff === zoomAdditional){
                  buttonZoomIn.disabled = true;
            }
        }

    }, false);

    var buttonZoomOut = document.getElementById("buttonZoomOut");
        buttonZoomOut.addEventListener("click", function() {


        var diff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;

        console.log("Zoom OUT: viewPortMin ", axisYViewportMinimum);
        console.log("Zoom OUT: viewPortMax ", axisYViewportMaximum);
        console.log("Zoom OUT: ", diff);
        if(diff =< 3){

            if(axisYViewportMinimum - zoomAdditional >= 0){
            //axisYViewportMinimum is minor than zoomAdditional
                 axisYViewportMinimum = axisYViewportMinimum - zoomAdditional;
                 axisYViewportMaximum = axisYViewportMaximum + zoomAdditional;

                 console.log("Zoom OUT 1 : min", axisYViewportMinimum , " max: ", axisYViewportMaximum);

            }else {
             //axisYViewportMinimum is higher than zoomAdditional

                 axisYViewportMinimum = 0;
                 axisYViewportMaximum = diff + (zoomAdditional * 2);
                // 0.2 + 0.4 = 0.6
                // 0.6 + 0.4 = 1
                // 1 + 0.4 = 1.4
                // 4 * 0.2 = 0.8
//                if(diff > 0.2){
//
//                 //TODO VER QUE SI ES MAYOR A 0.2 TAMBIEN ENTRA ACA
//                 //TODO encontrar patron de proporcionalidad por que repite lo mismo siempre que es menor a 0.2
//                    //TODO
//                    axisYViewportMinimum = 0;
//                    axisYViewportMaximum = 1;
//
//                    console.log("Zoom OUT 2 : min", axisYViewportMinimum , " max: ", axisYViewportMaximum);
//                }else{
//                    //To Fix the zoom out when the positions are near zero
//                    //TODO VER QUE SI ES MAYOR A 0.2 TAMBIEN ENTRA ACA
//                    axisYViewportMinimum = 0;
//                    axisYViewportMaximum = 0.6;
//                    console.log("Zoom OUT 3 : min", axisYViewportMinimum , " max: ", axisYViewportMaximum);
//
//                }
            }


            var newDiff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
            if(newDiff > zoomAdditional){
                 buttonZoomIn.disabled = false;
            }

        }else{


        }

        updateChart();

        console.log("Zoom OUT AFTER: viewPortMin ", chart.options.axisY.viewportMinimum);
        console.log("Zoom OUT AFTER: viewPortMax ", chart.options.axisY.viewportMaximum);

    }, false);

    setInterval(timerChart, updateInterval);

    return app;

});