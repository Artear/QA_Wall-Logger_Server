define(function (require) {

    var $ = require('jquery'),
        socket = null,
        bg = require('bargraph');

    var app = {};

    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect('192.168.15.60:' + data.socket_port +'/');
    }).done(function() {
        socket.on('log', processEvent);
        socket.emit('join', {room: 'statistics'});
    });

    var firstTime = 0;
    var tasks = [];
    var taskEvent = -1;
    var updateInterval = 10000;

    var vpMin = 0;
    var vpMax = 1;

    var live = true;//false; DEBUG
    var controlMovement = false;
    var addEventAuxVar = 5;

    var chart = new CanvasJS.Chart("chartContainer",{
        height: 500,
        backgroundColor: "#637077",
		title:{
			text: "QA Wall Eventos",
            fontSize: 40
		},
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
            titleFontSize: 20,
            labelFontColor: "white",
            titleFontColor: "white",
            viewportMinimum: vpMin,
            viewportMaximum: vpMax
        },
		axisX: {
			interval:1,
			title: "Eventos",
            labelFontSize: 15,
            titleFontSize: 20,
            labelFontColor: "white",
            titleFontColor: "white",
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
				dataPoints: tasks
			}
		]
	});

    function processEvent(data) {

        var yTime = [];

        if(firstTime == 0){
            firstTime = data.time;
        }

        switch(data.type) {
            case "PERIOD_START":
                //Start of a task
                taskEvent++;
                console.log("PERIOD_START: ", data);
                if(tasks.length == 0) {
                    tasks.push({x: taskEvent*-1,
                                y: [0, 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                    console.log("PERIOD_START: ", data);
                } else {
                    var calc =  (data.time - firstTime) / 1000.0;

                    tasks.push({x: taskEvent*-1,
                                y: [calc, calc + 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id,
                                end: false})
                }
                break;
            case "PERIOD_END":
                //End of a task
                var j = 0;
                while(j< tasks.length && tasks[j].id != data.id) {
                    j++;
                }
                if(j != tasks.length) {
                    yTime = tasks[j].y;
                    tasks[j].y = [yTime[0], (data.time - firstTime) / 1000.0];
                    tasks[j].end = true;
                }
                break;
            case "EVENT":
                //EVENT
                var calc =  (data.time-firstTime) / 1000.0;
                tasks.push({x: 1, y: [calc, calc + 0.001], name: data.message, label: 'Eventos',
                    deviceId: data.deviceId, id: data.id, toolTipContent: "{name}"});
                break;
        }

        chart.render();
    }

    /** DEBUG Msgs
    tasks.push({x: -1, y: [0, 1], label: "data.message", deviceId: "data.deviceId", id: "data.id", end: false});
    tasks.push({x: -2, y: [0.5, 3.1], label: "data.message2", deviceId: "data.deviceId2", id: "data.id2", end: false});
    tasks.push({x: -3, y: [2, 2.8], label: "data.message3", deviceId: "data.deviceId3", id: "data.id3", end: false});
    tasks.push({x: -4, y: [3, 3.1], label: "data.message4", deviceId: "data.deviceId4", id: "data.id4", end: false});
    /***/

    chart.render();

    function timerChart(){
        if(live){

            var event;
            var yAux;
            var cantStartEndEvent = 0;

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

    /** DEBUG Msgs
    var buttonLive = document.getElementById("buttonLive");
    buttonLive.addEventListener("click", function() {
                 live = !live;
               }, false);

    var buttonAddEvent = document.getElementById("buttonAddEvent");
    buttonAddEvent.addEventListener("click", function() {

                    var data = {"deviceId":"fe19b2535f8ea300","id":"f40fecf1-835b-4584-b78b-6cbc23371e7a","message":"GranTitular","time":1450192042898,"type":"PERIOD_START"};
                    processEvent(data);

                 }, false);

    var buttonEndEvent = document.getElementById("buttonEndEvent");
    buttonEndEvent.addEventListener("click", function() {

                    var data = {"deviceId":"fe19b2535f8ea300","id":"f40fecf1-835b-4584-b78b-6cbc23371e7a","message":"GranTitular","time":1450192044038,"type":"PERIOD_END"};
                    processEvent(data);

                 }, false);
    **/
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

                    if(!controlMovement){
                        //TODO insert in order desc or asc and prevent this...
                        tasks.sort(compareEvents);
                        var latestEvent = tasks[tasks.length - 1];

                        var maxValue = latestEvent.y[1];

                        vpMin = maxValue - 1;
                        vpMax = maxValue;

                        chart.options.axisY.viewportMinimum = vpMin;
                        chart.options.axisY.viewportMaximum = vpMax;
                        chart.render();
                    }

                 }, false);

    setInterval(timerChart, 500);

    return app;

});