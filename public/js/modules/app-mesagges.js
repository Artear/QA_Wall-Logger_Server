define(function (require) {

    var $ = require('jquery'),
        instance = null,
        socket = null,
        bg = require('bargraph');

    function am() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one am");
        }

        socket.emit('join', {room: 'statistics'});

    }

    $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect(data.localIp + ':' + data.port +'/');
    });

    var firstTime = 0;
    var tasks = [];
    var taskEvent=-1;
    var updateInterval = 10000;

    var chart = new CanvasJS.Chart("chartContainer",{
		height:500,
		title:{
			text: "QA Wall Eventos",
            fontSize: 20
		},
        legend: {
            fontSize: 10
        },
		zoomEnabled: true,
        zoomType: "y",
		exportEnabled: true,
		axisY: {
			includeZero: false,
			title: "Tiempo",
			interval: 0.02,
            labelFontSize: 10,
            titleFontSize: 20
    },
		axisX: {
			interval:1,
			title: "Eventos",
            labelFontSize: 10,
            titleFontSize: 20
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


    socket.on('log', function (data) {

        var yTime = [];

        if(firstTime == 0){
            firstTime = data.time;
        }

        switch(data.type) {
            case "PERIOD_START":
                //Start of a task
                taskEvent++;
                if(tasks.length == 0) {
                    tasks.push({x: taskEvent*-1,
                                y: [0, 0.1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id})

                } else {
                    var calc =  (data.time - firstTime) / 1000.0;

                    tasks.push({x: taskEvent*-1,
                                y: [calc, calc + 1],
                                label: data.message,
                                deviceId: data.deviceId,
                                id: data.id})
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
    });

    chart.render();

    return (instance = (instance || new am()));

});