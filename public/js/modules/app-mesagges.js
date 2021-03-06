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
    var DEBUG = false;

    var colorChartFont = "white";
    var titleAxisFontSize = 20;

    var updateInterval = 500;//Milliseconds

    var resultMediumViewPortY = 0.5;
    var zoneZoom;

    var zoomAxisYAdditional = 0.2;
    var zoomAxisXAdditional = 1;

    var axisYInterval = 0.1;

    var axisYViewportMinimum = 0;
    var axisYViewportMaximum = 1;

    var defaultXViewportMaximum = 1.5;
    var defaultXViewportMinimum = -4.5;

    var axisXViewportMaximum = defaultXViewportMaximum;
    var axisXViewportMinimum = defaultXViewportMinimum;

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
                !(e.axisY.viewportMaximum === null) && !(e.axisX.viewportMinimum === null)
                && !(e.axisX.viewportMaximum === null)) {
                axisYViewportMinimum = e.axisY.viewportMinimum;
                axisYViewportMaximum = e.axisY.viewportMaximum;
                if(e.axisX.ViewportMinimum < -4.5){
                    axisXViewportMinimum = e.axisX.ViewportMinimum;
                    axisXViewportMaximum = e.axisX.ViewportMaximum;
                }
            }
            if(DEBUG){
                console.log("VIEWPORT Y Min: ", e.axisY.viewportMinimum);
                console.log("VIEWPORT Y Max: ", e.axisY.viewportMaximum);
                console.log("VIEWPORT X Min: ", e.axisX.viewportMinimum);
                console.log("VIEWPORT X Max: ", e.axisX.viewportMaximum);
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
            viewportMaximum: axisXViewportMaximum,
            viewportMinimum: axisXViewportMinimum,
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

                    axisXViewportMinimum = -(cantStartEndEvent * 1) ;
                    axisXViewportMaximum = -(cantStartEndEvent * 1) + 5;
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

        chart.options.axisX.viewportMinimum = axisXViewportMinimum;
        chart.options.axisX.viewportMaximum = axisXViewportMaximum;

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

                         axisXViewportMinimum = -cantStartEndEvent - 0.5;

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

    /* Method to zoom in into the chart
    */
    var zoomIn = function(localized) {

        if(axisYViewportMinimum < 0){
            axisYViewportMinimum = 0;
        }

        var diffAxisY = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
        var diffAxisX = Math.round((axisXViewportMaximum - axisXViewportMinimum) * 100) / 100;

        if(DEBUG){
            console.log("Zoom IN: viewPortMin ", axisYViewportMinimum);
            console.log("Zoom IN: viewPortMax ", axisYViewportMaximum);
            console.log("Zoom IN diffAxisY: ", diffAxisY);
            console.log("Zoom IN: axisXViewportMaximum ", axisXViewportMaximum);
            console.log("Zoom IN: axisXViewportMinimum ", axisXViewportMinimum);
            console.log("Zoom IN diffAxisX: ", diffAxisX);
        }

        if(diffAxisY > zoomAxisYAdditional){

            var zoomInAdditionalProportional;

            if(diffAxisY <= 3){
                zoomInAdditionalProportional = zoomAxisYAdditional;
                axisYInterval = 0.1;
            }else if(diffAxisY <= 20){
                zoomInAdditionalProportional = zoomAxisYAdditional * 5;
                axisYInterval = 0.5;
            }else{
                zoomInAdditionalProportional = zoomAxisYAdditional * 20;
                axisYInterval = 2;
            }

            if(localized){
                var aux = zoomInAdditionalProportional / 2;

                switch (zoneZoom){
                    case 0:
                        axisYViewportMaximum = axisYViewportMaximum - zoomInAdditionalProportional * 2;
                        break;
                    case 1:
                        axisYViewportMinimum = axisYViewportMinimum + (zoomInAdditionalProportional - aux);
                        axisYViewportMaximum = axisYViewportMaximum - (zoomInAdditionalProportional + aux);
                        break;
                    case 2:
                        axisYViewportMinimum = axisYViewportMinimum + zoomInAdditionalProportional;
                        axisYViewportMaximum = axisYViewportMaximum - zoomInAdditionalProportional;
                        break;
                    case 3:
                        axisYViewportMinimum = axisYViewportMinimum + (zoomInAdditionalProportional + aux);
                        axisYViewportMaximum = axisYViewportMaximum - (zoomInAdditionalProportional - aux);
                        break;
                    case 4:
                        axisYViewportMinimum = axisYViewportMinimum + zoomInAdditionalProportional * 2;
                        break;
                }

            }else{
                axisYViewportMinimum = axisYViewportMinimum + zoomInAdditionalProportional;
                axisYViewportMaximum = axisYViewportMaximum - zoomInAdditionalProportional;
            }


            var newDiffAxisY = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
            if(newDiffAxisY === zoomAxisYAdditional){
                  buttonZoomIn.disabled = true;
            }
            if(newDiffAxisY < 90){
                  buttonZoomOut.disabled = false;
            }
        }

        if(diffAxisX >= 7 && diffAxisX <= 12){

            var zoomAxisXAdditionalProportional;

            zoomAxisXAdditionalProportional = zoomAxisXAdditional;

            console.log("Zoom IN zoomAxisXAdditionalProportional: ", zoomAxisXAdditionalProportional);

            if(axisXViewportMaximum > 0){
                axisXViewportMaximum = defaultXViewportMaximum;
                axisXViewportMinimum = axisXViewportMinimum + zoomAxisXAdditionalProportional;
            }else{

//                if(axisXViewportMaximum - zoomAxisXAdditionalProportional >= 0){
//                //axisXViewportMinimum is minor than zoomAxisXAdditionalProportional
//                    axisXViewportMinimum = axisXViewportMinimum - zoomAxisXAdditionalProportional;
//                    axisXViewportMaximum = axisXViewportMaximum + zoomAxisXAdditionalProportional;
//                }else {
//                    //axisXViewportMinimum is higher than zoomAxisXAdditionalProportional
//                    axisXViewportMinimum = diffAxisX + (zoomAxisXAdditionalProportional * 2);
//                    axisXViewportMaximum = defaultXViewportMaximum;
//                }
            }
        }

       updateChart();

        if(DEBUG){
            console.log("Zoom IN AFTER: axisYViewportMinimum ", axisYViewportMinimum);
            console.log("Zoom IN AFTER: axisYViewportMaximum ", axisYViewportMaximum);
            console.log("Zoom IN AFTER: axisXViewportMaximum ", axisXViewportMaximum);
            console.log("Zoom IN AFTER: axisXViewportMinimum ", axisXViewportMinimum);
        }


    };

    /* Method to zoom out into the chart
    */
    var zoomOut = function(){

        var diffAxisY = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
        var diffAxisX = Math.round((axisXViewportMaximum - axisXViewportMinimum) * 100) / 100;

        if(diffAxisY > 90){
            return;
        }

        if(DEBUG){
            console.log("Zoom OUT: viewPortMin ", axisYViewportMinimum);
            console.log("Zoom OUT: viewPortMax ", axisYViewportMaximum);
            console.log("Zoom OUT diffAxisY: ", diffAxisY);
            console.log("Zoom OUT: axisXViewportMaximum ", axisXViewportMaximum);
            console.log("Zoom OUT: axisXViewportMinimum ", axisXViewportMinimum);
            console.log("Zoom OUT diffAxisX: ", diffAxisX);
        }

        var zoomAxisYAdditionalProportional;
        var zoomAxisXAdditionalProportional;

        if(diffAxisY < 3){
            zoomAxisYAdditionalProportional = zoomAxisYAdditional;
        }else if( diffAxisY < 10){
            zoomAxisYAdditionalProportional = zoomAxisYAdditional * 5;
            axisYInterval = 0.5;
        }else{
            zoomAxisYAdditionalProportional = zoomAxisYAdditional * 20;
            axisYInterval = 2;
        }

        if(DEBUG){
            console.log("zoomAxisYAdditionalProportional: ", zoomAxisYAdditionalProportional);
        }

        if(axisYViewportMinimum - zoomAxisYAdditionalProportional >= 0){
            //axisYViewportMinimum is minor than zoomAxisYAdditionalProportional
            axisYViewportMinimum = axisYViewportMinimum - zoomAxisYAdditionalProportional;
            axisYViewportMaximum = axisYViewportMaximum + zoomAxisYAdditionalProportional;
        }else {
            //axisYViewportMinimum is higher than zoomAxisYAdditionalProportional
            axisYViewportMinimum = 0;
            axisYViewportMaximum = diffAxisY + (zoomAxisYAdditionalProportional * 2);
        }

        var newDiffAxisY = Math.round((axisYViewportMaximum - axisYViewportMinimum) * 100) / 100;
        if(newDiffAxisY > zoomAxisYAdditionalProportional){
             buttonZoomIn.disabled = false;
             if(newDiffAxisY >= 90){
                buttonZoomOut.disabled = true;
             }
        }

        if(diffAxisX < 12){
            zoomAxisXAdditionalProportional = zoomAxisXAdditional;

            console.log("Zoom OUT axisXViewportMaximum: ", axisXViewportMaximum);

            if(axisXViewportMaximum > 0){

                axisXViewportMaximum = defaultXViewportMaximum;
                axisXViewportMinimum = axisXViewportMinimum - 1;
            }else{

//                if(axisXViewportMaximum - zoomAxisXAdditionalProportional >= 0){
//                //axisXViewportMinimum is minor than zoomAxisXAdditionalProportional
//                    axisXViewportMinimum = axisXViewportMinimum - zoomAxisXAdditionalProportional;
//                    axisXViewportMaximum = axisXViewportMaximum + zoomAxisXAdditionalProportional;
//                }else {
//                    //axisXViewportMinimum is higher than zoomAxisXAdditionalProportional
//                    axisXViewportMinimum = diffAxisX + (zoomAxisXAdditionalProportional * 2);
//                    axisXViewportMaximum = defaultXViewportMaximum;
//                }
            }
        }

        updateChart();

        if(DEBUG){
            console.log("Zoom OUT AFTER: axisYViewportMinimum ", axisYViewportMinimum);
            console.log("Zoom OUT AFTER: axisYViewportMaximum ", axisYViewportMaximum);
            console.log("Zoom OUT AFTER: axisXViewportMaximum ", axisXViewportMaximum);
            console.log("Zoom OUT AFTER: axisXViewportMinimum ", axisXViewportMinimum);
        }

    };

    /* Add listeners for zoom buttons */
    var buttonZoomIn = document.getElementById("buttonZoomIn");
    buttonZoomIn.addEventListener("click", function() { zoomIn(false); }, false);

    var buttonZoomOut = document.getElementById("buttonZoomOut");
    buttonZoomOut.addEventListener("click", zoomOut, false);

    setInterval(timerChart, updateInterval);

    var chartContainer = $('#chartContainer');
    chartContainer.bind('mousewheel', function(e){

        //if(controlMovement && !(devices.length === 0)){
        if(controlMovement){
//        console.log(event);
            event.stopPropagation();
            event.preventDefault();
            if(e.originalEvent.wheelDelta /120 > 0) {
                zoomIn(true);
            }
            else{
                zoomOut();
            }
        }
    });

    chartContainer.bind('mousemove', function(e){

            if(controlMovement){
                event.stopPropagation();
                event.preventDefault();

                var offset = chartContainer.offset();
                var width = chartContainer.width() - 40;

                if(event.clientX - Math.floor(offset.left) - 40 < 0){
                    return;
                }

                var zoomMouseXPosition = event.clientX - Math.floor(offset.left) - 40;
                var zoomMouseYPosition = event.clientY - Math.floor(offset.top) + $(window).scrollTop();

                var result = ((axisYViewportMaximum - axisYViewportMinimum) * zoomMouseXPosition / width);
                var resultMediumViewPortY = round(result, axisYInterval);
                var zoneMin = (axisYViewportMaximum - axisYViewportMinimum) / 5;
                zoneZoom = getZoneZoom(resultMediumViewPortY, zoneMin);

                if(DEBUG){
                    console.log("Zoom: axisYViewportMaximum ", axisYViewportMaximum);
                    console.log("Zoom: axisYViewportMinimum ", axisYViewportMinimum);
                    console.log("resultMediumViewPortY:", resultMediumViewPortY);
                    console.log("ZOne zoom:", zoneZoom);
                }
            }
        });

    function getZoneZoom(resultMediumViewPortY, zoneMin){
        var divisionZoom = resultMediumViewPortY / zoneMin;
        return Math.floor(divisionZoom) > 4 ? 4 : Math.floor(divisionZoom);
    }

    function round(value, step) {
        step || (step = 1.0);
        var inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

    return app;

});