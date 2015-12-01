/**
 * Created by franciscok on 17/07/15.
 */

define(function (require) {

  var $ = require('jquery');

  $(document).ready(function () {

    $('#fileinput').on('change', function(){
      var ajax = $.ajax({
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false
      });

      /*
      for(var i = 0; i<this.files.length; i++){
        var file =  this.files[i];
        // This code is only for demo ...
        console.group("File "+i);
        console.log("name : " + file.name);
        console.log("size : " + file.size);
        console.log("type : " + file.type);
        console.log("date : " + file.lastModified);
        console.groupEnd();
      }
      */
    });

    //document.getElementById('fileinput').addEventListener(, false);

  });

});
