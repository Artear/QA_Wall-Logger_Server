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
            configText.hide();
            //$.cookie('sidebar-pref2', 'use-sidebar', { expires: 30 });
        }
     
        // Hide sidebar
        function hideSidebar(){
            objMain.removeClass('use-sidebar');
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
        }).css('height', $("#content").outerHeight() + 'px');
     
        // Load preference
        /*if ( $.cookie('sidebar-pref2') == null ){
            objMain.removeClass('use-sidebar');
        }*/
        return {

        }
    };

    return new sidebar();
});