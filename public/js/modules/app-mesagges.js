define(function (require) {

    var $ = require('jquery'),
        socket = null,
        bg = require('bargraph');

    var app = {};

    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect("192.168.15.141:" + data.socket_port +'/');
    }).done(function() {
        socket.on('log', processEvent);
        socket.emit('join', {room: 'statistics'});
    });

    /** Config **/
    var colorChartFont = "white";
    var titleAxisFontSize = 20;
    /** ===== **/

//    var firstTime = 0;
    var tasks = [];
//    var taskEvent = -1;
    var updateInterval = 500;//Milliseconds

    var vpMin = 0;
    var vpMax = 1;

    var live = true;//false; DEBUG
    var controlMovement = false;
    var addEventAuxVar = 5;

    var devices = [];
    var currentDevice;

    var select = document.getElementById('selectDevice');
    select.onchange=function(){
        var currentDeviceId = $(this).val();

        for(var i=0; i<devices.length; i++){
            if(devices[i].id === currentDeviceId){
                currentDevice = devices[i];
            }
        }

        console.log("On CHANGE : ", currentDevice.id)
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
		axisY: {
			includeZero: false,
			title: "Tiempo",
			interval: 0.1,
            labelFontSize: 10,
            titleFontSize: titleAxisFontSize,
            labelFontColor: colorChartFont,
            titleFontColor: colorChartFont,
            viewportMinimum: vpMin,
            viewportMaximum: vpMax
        },
		axisX: {
			interval: 1,
			title: "Eventos",
            labelFontSize: 15,
            titleFontSize: titleAxisFontSize,
            labelFontColor: colorChartFont,
            titleFontColor: colorChartFont,
            viewportMinimum: -4.5,
            viewportMaximum: 1.5,
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

                console.log("PERIOD_START: ", data);
                if(tasks.length == 0 ) {
                    tasks.push({x: currentDevice.cantTaskEvents * -1,
                                y: [0, 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                    console.log("PERIOD_START1: ", data);
                } else {
                    var calc =  (data.time - currentDevice.firstTime) / 1000.0;

                    tasks.push({x: currentDevice.cantTaskEvents * -1,
                                y: [calc, calc + 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                           console.log("PERIOD_START2: ", data);
                }

                currentDevice.cantTaskEvents++;

                console.log(currentDevice.cantTaskEvents);
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
                console.log("PERIOD_END: ", data);
                break;
            case "EVENT":
                //EVENT
                var calc =  (data.time - currentDevice.firstTime) / 1000.0;
                tasks.push({x: 1, y: [calc, calc + 0.001], name: data.message, label: 'Eventos',
                    deviceId: data.deviceId, id: data.id, toolTipContent: "{name}"});
                console.log("EVENT: ", data);
                break;
        }

        console.log("CANTIDAD DE EVENTOS", tasks.length);
        chart.render();
	}

	function resetChart(){
	    tasks.length = 0;
        chart.options.data[0].dataPoints.length = 0;
	}

    function renderChart(){

        resetChart();
        console.log("DATAPOINTS: ", chart.options.data[0].dataPoints);
        var currentEvents = getCurrentEvents();
        console.log(currentEvents);
        for(var i = 0; i< currentEvents.length; i++){
            console.log("LOOPEANDO" , i);
            renderEvent(currentEvents[i]);
        }
        console.log("DEVICES: " , devices);
        console.log(chart);
    }

    function getCurrentEvents(){
        return currentDevice.events;
    }

    function getCurrentFirstTime(){
        return ;
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
            var newDevice = {id:data.deviceId, firstTime: 0, events: [data], cantTaskEvents: 0, };
            devices.push(newDevice);
            addSelectElement(newDevice);
        }else{
            addNewEvent(data);
        }

//         console.log(data.deviceId, " es igual ???? a :",currentDeviceId);

        //TODO see that to draw correctly the first element
        if(data.deviceId === currentDevice.id){
            renderEvent(data);
        }

//        console.log("DEVICES: " , devices);
//        console.log(chart);
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
                if(latestEvent.y[1] > 1){
                    vpMin = latestEvent.y[1] - 1;
                    vpMax = latestEvent.y[1];

                    chart.options.axisY.viewportMinimum = vpMin;
                    chart.options.axisY.viewportMaximum = vpMax;
                }

                //There are many Start-End Events and need to scroll down.
                if(cantStartEndEvent > (5/1)){
                    chart.options.axisX.viewportMinimum = -(cantStartEndEvent * 1) ;
                    chart.options.axisX.viewportMaximum = -(cantStartEndEvent * 1) + 5;
                    console.log("pasooo", cantStartEndEvent,  cantStartEndEvent * 0.5);
                }

            }

            chart.render();
        }
    }

    /**
    *
    *Return the last event on graph based axe Y. (Note axe Y is horizontally, and axe X was vertically)
    *
    **/
    function compareEvents(event1, event2){
        return (event1.y[1] - event2.y[1]);
    }

    var buttonSeeAll = document.getElementById("buttonSeeAll");
    buttonSeeAll.addEventListener("click", function() {

                     //TODO insert in order desc or asc and prevent this...
                     tasks.sort(compareEvents);
                     var latestEvent = tasks[tasks.length - 1];
                     var maxValue = latestEvent.y[1];

                     chart.options.axisY.viewportMinimum = 0;
                     chart.options.axisY.viewportMaximum = maxValue;

                     chart.options.axisX.viewportMinimum = -tasks.length - 0.5;
                     chart.render();

                 }, false);

    var buttonControlMovement = document.getElementById("buttonControlMovement");
    buttonControlMovement.addEventListener("click", function() {

                    controlMovement = !controlMovement;

                    if(controlMovement){
                        buttonControlMovement.value = "MOVE OFF";
                    }else{
                        buttonControlMovement.value = "MOVE ON";
                    }

                    if(!controlMovement){
                        //TODO insert in order desc or asc and prevent this...
                        tasks.sort(compareEvents);
                        var latestEvent = tasks[tasks.length - 1];

                        var maxValue = latestEvent.y[1];

                        vpMin = maxValue - 1 < 0 ? 0 : maxValue - 1;
                        vpMax = maxValue;

                        chart.options.axisY.viewportMinimum = vpMin;
                        chart.options.axisY.viewportMaximum = vpMax;

                        console.log("viewportMinimum", vpMin);
                        console.log("viewportMaximum", vpMax);

                        //Fix refresh graph if no new content data
                        tasks[tasks.length - 1].y[1] = tasks[tasks.length - 1].y[1] + 0.0001;
                        chart.render();
                    }

                 }, false);

    var buttonZoomIn = document.getElementById("buttonZoomIn");
    buttonZoomIn.addEventListener("click", function() {

        if(chart.options.axisY.interval >= 0.1){

            chart.options.axisY.interval = chart.options.axisY.interval * 2;
            chart.options.axisY.viewportMinimum = vpMin;
            chart.options.axisY.viewportMaximum = vpMax;
            chart.render();
            console.log(chart);
        }

    }, false);

    var buttonZoomOut = document.getElementById("buttonZoomOut");
        buttonZoomOut.addEventListener("click", function() {

        if(chart.options.axisY.interval >= 0.5){
            chart.options.axisY.interval = chart.options.axisY.interval / 2;
            chart.options.axisY.viewportMinimum = vpMin;
            chart.options.axisY.viewportMaximum = vpMax;
            chart.render();
        }

    }, false);

    setInterval(timerChart, updateInterval);

    return app;

});