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
        d3: 'libs/d3.min',
        d3layout: 'libs/d3.layout',
        odometer: 'libs/odometer.min',
        qrcode: 'libs/qrcode.min',
        bargraph: 'libs/bargraph',

        //Modules
        waterfall: 'modules/waterfall',
        wpt: 'modules/wpt',
        cw: 'modules/choco-wall',
        am: 'modules/app-mesagges',
        sidebar: 'modules/sidebar',
        configwall: 'modules/config-wall'
    },
    shim: {
        io: {
            exports: 'io'
        },
        bargraph: {
            exports: 'bargraph'
        }

    }
});

requirejs(['page/config']);
requirejs(['page/init']);
