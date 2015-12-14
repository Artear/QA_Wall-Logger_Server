define(function (require) {

    var $ = require('jquery'),
        instance = null,
        socket = null,
        bg = require('bargraph');

    function am() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one am");
        }

//        socket.emit('join', {room: 'statistics'});

    }

//    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
//        socket = require('io').connect(data.localIp + ':' + data.port +'/');
//    });

    var firstTime = 0;
    var tasks = [];
    var taskEvent = -1;
    var updateInterval = 10000;

    var vpMin = 0;
    var vpMax = 3;

    var live = false;
    var addEventAuxVar = 5;

    var chart = new CanvasJS.Chart("chartContainer",{
        height: 500,
		title:{
			text: "QA Wall Eventos",
            fontSize: 20
		},
        legend: {
            fontSize: 10
        },
		zoomEnabled: true,
        zoomType: 'xy',
		axisY: {
			includeZero: false,
			title: "Tiempo",
			interval: 0.5,
            labelFontSize: 10,
            titleFontSize: 20,
            viewportMinimum: vpMin,
            viewportMaximum: vpMax
        },
		axisX: {
			interval:1,
			title: "Eventos",
            labelFontSize: 10,
            titleFontSize: 20,
            viewportMinimum: -4,
            viewportMaximum: -0.5
		},
        rangeChanged: function(e){
                console.log("pepe2");
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


//    socket.on('log', function (data) {
//
//        var yTime = [];
//
//        if(firstTime == 0){
//            firstTime = data.time;
//        }
//
//        switch(data.type) {
//            case "PERIOD_START":
//                //Start of a task
//                taskEvent++;
//                if(tasks.length == 0) {
//                    tasks.push({x: taskEvent*-1,
//                                y: [0, 0.1],
//                                label: data.message,
//                                deviceId: data.deviceId,
//                                id: data.id,
//                                end: false})
//
//                } else {
//                    var calc =  (data.time - firstTime) / 1000.0;
//
//                    tasks.push({x: taskEvent*-1,
//                                y: [calc, calc + 1],
//                                label: data.message,
//                                deviceId: data.deviceId,
//                                id: data.id,
//                                end: false})
//                }
//                break;
//            case "PERIOD_END":
//                //End of a task
//                var j = 0;
//                while(j< tasks.length && tasks[j].id != data.id) {
//                    j++;
//                }
//                if(j != tasks.length) {
//                    yTime = tasks[j].y;
//                    tasks[j].y = [yTime[0], (data.time - firstTime) / 1000.0];
//                    tasks[j].end = true;
//                }
//                break;
//            case "EVENT":
//                //EVENT
//                var calc =  (data.time-firstTime) / 1000.0;
//                tasks.push({x: 1, y: [calc, calc + 0.001], name: data.message, label: 'Eventos',
//                    deviceId: data.deviceId, id: data.id, toolTipContent: "{name}"});
//                break;
//        }
//
//        chart.render();
//    });

    tasks.push({x: -1, y: [0, 3], label: "data.message", deviceId: "data.deviceId", id: "data.id"});
    tasks.push({x: -2, y: [0.5, 1.1], label: "data.message2", deviceId: "data.deviceId2", id: "data.id2"});
    tasks.push({x: -3, y: [2, 2.1], label: "data.message3", deviceId: "data.deviceId3", id: "data.id3"});
    tasks.push({x: -4, y: [3, 3.1], label: "data.message4", deviceId: "data.deviceId4", id: "data.id4"});

    chart.render();

    function timerChart(){
        if(live){
            vpMin = vpMin + 0.5;
            vpMax = vpMax + 0.5;
            chart.options.axisY.viewportMinimum = vpMin;
            chart.options.axisY.viewportMaximum = vpMax;
            chart.render();
        }
        console.log(chart);
    }

    var buttonLive = document.getElementById("buttonLive");
    buttonLive.addEventListener("click", function() {
                 live = !live;
               }, false);

    var buttonLive = document.getElementById("buttonAddEvent");
    buttonLive.addEventListener("click", function() {
                    tasks.push({x: -(addEventAuxVar++), y: [3.5, 4], label: "data.message4", deviceId: "data.deviceId4", id: "data.id4"});
                    chart.render();
                 }, false);

    var buttonLive = document.getElementById("buttonSeeAll");
    buttonLive.addEventListener("click", function() {
                    chart.options.axisY.viewportMinimum = 0;
                    chart.options.axisY.viewportMaximum = 0;
                    chart.options.axisX.viewportMinimum = -20;
                    chart.render();
                 }, false);

    setInterval(timerChart, 2000);


    return (instance = (instance || new am()));

});