/**
 * WPT formatea los datos de wpt
 * @module Wpt
 * @author Juan Farias dientuki@gmail.com
 * @version 1.0
 */
define(function () {

    var instance = null,
        data = null,
        returned = {
            waterfall: null,
            breakpoints: null
        }

    /**
     * Wpt object, usa Singleton
     * @alias module:Wpt
     */
    function Wpt(){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one Wpt");
        }
    }


    function getName(rq){

        var full = rq.full_url.split("/"),
            file = null,
            q = null;
        file = full[full.length-1];
        q = file.indexOf("?");

        if (q != -1){
            file = file.substr(0,q);
        }

        return rq.host + ' - ' + file;
    }

    function getMime(contentType){
        var mime = 'other';

        switch (contentType){
            case 'text/html':
                mime = 'html';
                break;

            case 'image/gif':
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/png':
            case 'image/svg+xml':
            case 'image/x-icon':
                mime = 'image';
                break;

            case 'text/css':
                mime = 'css';
                break;

            case 'application/javascript':
            case 'application/x-javascript':
            case 'text/javascript':
                mime = 'js';
                break;

            case 'application/x-font-woff':
                mime = 'font';
                break;
        }

        return mime;
    }

    Wpt.prototype.setJson = function(json){
        data = json;
    }

    Wpt.prototype.getWaterfall = function(run){
        if (isNaN(run)){
            return false;
        }

        if (run > Object.keys(data.runs).length){
            return false;
        }

        var requests = data.runs[run].firstView.requests,
            waterfall = [];

        for(var request in requests) {
            waterfall.push({
                name: getName(requests[request]),
                count: requests[request].all_ms,
                end: requests[request].all_end,
                mime: getMime(requests[request].contentType)
            });
        }

        return waterfall;
    }

    Wpt.prototype.getBreakpoints = function(run){
        if (isNaN(run)){
            return false;
        }

        if (run > Object.keys(data.runs).length){
            return false;
        }

        var r = data.runs[run].firstView,
            breakpoints = [r.TTFB, r.domContentLoadedEventEnd, r.firstPaint, r.visualComplete, r.loadTime, r.fullyLoaded];

        return breakpoints;



    }

    Wpt.prototype.getData = function(run){
        returned.waterfall = this.getWaterfall(run);
        returned.breakpoints = this.getBreakpoints(run);

        return returned;
    }



    return (instance = (instance || new Wpt()));

});
