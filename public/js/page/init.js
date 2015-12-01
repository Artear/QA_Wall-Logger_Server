/**
 * Created by franciscok on 17/07/15.
 */

define(function (require) {

  var $ = require('jquery'),
      rickshaw = require('rickshaw');
      pub = require('rickshawPubNub.Fixtures.PubNub'),
      pub = new pub();

  $(document).ready(function () {

    var chocoWall = require('cw');

    $( "#main-form" ).on( "submit", function( event ) {
      chocoWall.submit(event, $(this));
    }).find('.close').on('click', function (event) {
      chocoWall.close(event);
    });;


    $( "#again").on('click', function (event) {
      chocoWall.changeScreen('#step-1', function(){
        chocoWall.reset();
      });
    });

    $( "#report").on('click', function (event) {
      chocoWall.report($(this));
    });

    var graph = new Rickshaw.Graph( {
      element: document.getElementById("chart"),
      width: 900,
      height: 500,
      renderer: 'area',
      stroke: true,
      preserve: true,
      series: [
        {
          color: 'steelblue',
          name: 'Cats',
          data: []
        },
        {
          color: 'lightblue',
          name: 'Dogs',
          data: []
        }
      ]
    });
    graph.render();

  });

});
