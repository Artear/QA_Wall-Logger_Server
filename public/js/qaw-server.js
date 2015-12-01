//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
  baseUrl: 'js/',
  paths: {
    jquery: 'libs/jquery-2.1.4.min',

    //Libs
    io: 'libs/socket.io-1.3.6.min',

    //Modules

    //Plugins

  },
  shim: {
    io: {
      exports: 'io'
    },

  }
});


requirejs(['page/init']);
