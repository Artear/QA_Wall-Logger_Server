define(function (require) {

    var $ = require('jquery');

    var sidebar = function () {
        var self = this;

        // Variables
        var objMain = $('#main');
        var configText = $('.configsidebar');
     
        // Show sidebar
        function showSidebar(){
            objMain.addClass('use-sidebar');
            $('#sidebar form').fadeIn(1000);
            configText.hide();
            //$.cookie('sidebar-pref2', 'use-sidebar', { expires: 30 });
        }
     
        // Hide sidebar
        function hideSidebar(){
            $('#sidebar form').fadeOut('fast', function(){
                objMain.removeClass('use-sidebar');
            });
            configText.show();
            //$.cookie('sidebar-pref2', null, { expires: 30 });
        }
     
        // Sidebar separator
        var objSeparator = $('#separator');
     
        objSeparator.click(function(e){
            e.preventDefault();
            if ( objMain.hasClass('use-sidebar') ){
                hideSidebar();
            }
            else {
                showSidebar();
            }
        }).css('height', Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 80 + 'px');
     
        // Load preference
        /*if ( $.cookie('sidebar-pref2') == null ){
            objMain.removeClass('use-sidebar');
        }*/
        return {

        }
    };

    return new sidebar();
});