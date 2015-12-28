define(function (require) {

    var $ = require('jquery'),
        socket = null,
        bg = require('bargraph');

    var app = {};

    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect("192.168.15.146:" + data.socket_port +'/');
    }).done(function() {
        socket.on('log', processEvent);
        socket.emit('join', {room: 'statistics'});
    });

    var tasks = [];
    var devices = [];
    var currentDevice;

    /** Config **/
    var DEBUG = false;

    var colorChartFont = "white";
    var titleAxisFontSize = 20;

    var updateInterval = 500;//Milliseconds

    var zoomAdditional = 0.2;

    var axisYInterval = 0.1;

    var axisYViewportMinimum = 0;
    var axisYViewportMaximum = 1;

    var defaultXViewportMaximum = 1.5;
    var defaultXViewportMinimum = -4.5;

    var live = true;//false; DEBUG
    var controlMovement = false;
    var seeAll = false;
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
            if(DEBUG){
                console.log("VIEWPORTMin: ", e.axisY.viewportMinimum);
                console.log("VIEWPORTMax: ", e.axisY.viewportMaximum);
            }

          },
		axisY: {
			includeZero: false,
			title: "Tiempo",
			interval: axisYInterval,
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

        if(currentDevice.firstTime == 0){
            currentDevice.firstTime = data.time;
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

        chart.options.axisY.interval = axisYInterval;
        chart.options.axisY.viewportMinimum = axisYViewportMinimum;
        chart.options.axisY.viewportMaximum = axisYViewportMaximum;

        chart.render();
    }

    var buttonSeeAll = document.getElementById("buttonSeeAll");
    buttonSeeAll.addEventListener("click", function() {

                    seeAll = !seeAll;

                    //TODO insert in order desc or asc and prevent this...
                    tasks.sort(compareEvents);
                    var latestEvent = tasks[tasks.length - 1];
                    var maxValue = latestEvent.y[1];

                    if(seeAll){
                         buttonSeeAll.value = "SEE SOME";
                         buttonZoomIn.disabled = true;
                         buttonZoomOut.disabled = true;
                         buttonControlMovement.disabled = true;

                         axisYInterval = maxValue / 20;
                         axisYViewportMinimum = null;
                         axisYViewportMaximum = null;

                         var cantStartEndEvent = 0;
                         for(var i = 0; i < tasks.length; i++){
                             //Is start-end Event? And not finished?
                             if(tasks[i].x <= 0){
                                 cantStartEndEvent++;
                             }
                         }

                         chart.options.axisX.viewportMinimum = -cantStartEndEvent - 0.5;

                    }else{
                         buttonSeeAll.value = "SEE ALL";

                         buttonZoomIn.disabled = false;
                         buttonZoomOut.disabled = false;
                         buttonControlMovement.disabled = false;

                         axisYInterval = 0.1;
                         axisYViewportMinimum = maxValue - 1 < 0 ? 0 : maxValue - 1;
                         axisYViewportMaximum = maxValue;
                    }

                    updateChart();

                 }, false);

    var buttonControlMovement = document.getElementById("buttonControlMovement");
    buttonControlMovement.addEventListener("click", function() {

                    controlMovement = !controlMovement;

                    if(controlMovement){
                        buttonControlMovement.value = "MOVE OFF";
                        buttonZoomIn.disabled = false;
                        buttonZoomOut.disabled = false;
                        buttonSeeAll.disabled = false;
                    }else{
                        buttonControlMovement.value = "MOVE ON";
                        buttonZoomIn.disabled = true;
                        buttonZoomOut.disabled = true;
                        buttonSeeAll.disabled = true;
                    }

                    tasks = chart.options.data[0].dataPoints;

                    //TODO insert in order desc or asc and prevent this...
                    tasks.sort(compareEvents);
                    var latestEvent = tasks[tasks.length - 1];

                    if(!controlMovement && !(latestEvent === undefined)){

                        var maxValue = latestEvent.y[1];

                        axisYInterval = 0.1;
                        axisYViewportMinimum = maxValue - 1 < 0 ? 0 : maxValue - 1;
                        axisYViewportMaximum = maxValue;

                        if(DEBUG){
                            console.log("viewportMinimum", axisYViewportMinimum);
                            console.log("viewportMaximum", axisYViewportMaximum);
                        }

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

        if(DEBUG){
            console.log("Zoom IN: viewPortMin ", axisYViewportMinimum);
            console.log("Zoom IN: viewPortMax ", axisYViewportMaximum);
            console.log("Zoom IN DIFF: ", diff);
        }

        if(diff >= zoomAdditional){

            var zoomInAdditionalProportional;

            if(diff <= 3){
                zoomInAdditionalProportional = zoomAdditional;
                axisYInterval = 0.1;
            }else if(diff <= 20){
                zoomInAdditionalProportional = zoomAdditional * 5;
                axisYInterval = 0.5;
            }else{
                zoomInAdditionalProportional = zoomAdditional * 20;
                axisYInterval = 2;
            }

            axisYViewportMinimum = axisYViewportMinimum + zoomInAdditionalProportional;
            axisYViewportMaximum = axisYViewportMaximum - zoomInAdditionalProportional;

            updateChart();

            var newDiff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
            if(newDiff === zoomAdditional){
                  buttonZoomIn.disabled = true;
            }
            if(newDiff < 90){
                  buttonZoomOut.disabled = false;
            }
        }

    }, false);

    var buttonZoomOut = document.getElementById("buttonZoomOut");
        buttonZoomOut.addEventListener("click", function() {


        var diff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;

        if(diff > 90){
            return;
        }

        if(DEBUG){
            console.log("Zoom OUT: viewPortMin ", axisYViewportMinimum);
            console.log("Zoom OUT: viewPortMax ", axisYViewportMaximum);
            console.log("Zoom OUT DIFF: ", diff);
        }

        var zoomAdditionalProportional;

        if(diff < 3){
            zoomAdditionalProportional = zoomAdditional;
        }else if( diff < 10){
            zoomAdditionalProportional = zoomAdditional * 5;
            axisYInterval = 0.5;
        }else{
            zoomAdditionalProportional = zoomAdditional * 20;
            axisYInterval = 2;
        }

        if(DEBUG){
            console.log("zoomAdditionalProportional: ", zoomAdditionalProportional);
        }

        if(axisYViewportMinimum - zoomAdditionalProportional >= 0){
            //axisYViewportMinimum is minor than zoomAdditional
            axisYViewportMinimum = axisYViewportMinimum - zoomAdditionalProportional;
            axisYViewportMaximum = axisYViewportMaximum + zoomAdditionalProportional;
        }else {
            //axisYViewportMinimum is higher than zoomAdditional
            axisYViewportMinimum = 0;
            axisYViewportMaximum = diff + (zoomAdditionalProportional * 2);
        }

        var newDiff = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
        if(newDiff > zoomAdditionalProportional){
             buttonZoomIn.disabled = false;
             if(newDiff >= 90){
                buttonZoomOut.disabled = true;
             }
        }

        updateChart();

        if(DEBUG){
            console.log("Zoom OUT AFTER: viewPortMin ", chart.options.axisY.viewportMinimum);
            console.log("Zoom OUT AFTER: viewPortMax ", chart.options.axisY.viewportMaximum);
        }

    }, false);

    setInterval(timerChart, updateInterval);

    return app;

});