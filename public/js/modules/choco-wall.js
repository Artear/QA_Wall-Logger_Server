/**
 * Choco Wall, interfaz grafica
 * @module cw
 * @author Juan Farias dientuki@gmail.com
 * @version 1.0
 */
define(function (require) {

    var $ = require('jquery'),
        instance = null,
        interval = null,
        socket = null,
        waterfall = require('waterfall'),
        odometer = require('odometer'),
        QRcode = require('qrcode'),
        wptapi = require('wpt'),
        replaces = ['loadTime', 'TTFB', 'render', 'SpeedIndex', 'domElements', 'docTime', 'requestsDoc', 'bytesInDoc', 'fullyLoaded', 'bytesIn'],
        odometers = {
            speed: null,
            ux: null
        },
        qrconfig = {
            width: 310,
            height: 310,
            text: null
        },
        urls = {
            psi: null,
            wpt: null
        },
        $psi = $('#pagespeed'),
        $loading = $($("#wpt-loading").html().trim()),
        $wpts = $("#wpt-summary").html().trim();

    /**
     * Cw object, usa Singleton
     * @alias module:Wpt
     */
    function Cw() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Choco-wall");
        }
        if (typeof initialize === "function") {
            initialize(this);
        }
    }

    /**
     * Constructor
     *
     * @param {object}
     *            self - this
     */
    var initialize = function(self) {
        /**
         * @var {number} furor - Interval to work
         */
        $.getJSON("http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function (data) {
            socket = require('io').connect(data.localIp + ':' + data.socket_port + '/');
        }).done(function () {
            socket.emit('join', {room: 'statistics'});

            socket.on('log', function (data) {
                console.log('log me dicen esto faaa >', data);
            });

            socket.on('wpt', function (data) {
                console.log('WPT me dicen esto', data);
                url = data.jsonUrl;
                interval = setInterval(function () {
                    wptcheck(url)
                }, 1000);
            });

            socket.on('bitly.wpt', function (url) {
                console.log('debo mostrar bitly', url)
                urls.wpt = url;

                showQr({
                    el: '#qrcode-wpt',
                    text: urls.wpt
                });
            });

            socket.on('bitly.psi', function (url) {
                urls.psi = url;

                showQr({
                    el: '#qrcode-psi',
                    text: urls.psi
                });

            });
        });

        odometers.speed = new odometer({
            el: $psi.find('.speed')[0],
            value: 0,
            format: '(ddd)',
            theme: 'minimal'
        });

        odometers.ux = new odometer({
            el: $psi.find('.ux')[0],
            value: 0,
            format: '(ddd)',
            theme: 'minimal'
        });

        waterfall.setConfig({
            leftMargin: 200,
            svgWidth: 962
        });

        $loading.attr('id', 'loading')
    }

    function psi(url) {
        $.ajax({
            async: true,
            cache: false,
            dataType: 'json',
            method: 'GET',
            url: 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?strategy=mobile&fields=ruleGroups&url=' + encodeURIComponent(url)
        }).done(function (data, textStatus, jqXHR) {
            if (jqXHR.status === 200) {
                odometers.speed.update(data.ruleGroups.SPEED.score);
                odometers.ux.update(data.ruleGroups.USABILITY.score);
            }
        });
    }

    function wpt(wptjson) {
        var indexs = ['First View', 'Repeat View'],
            i = 0;
        tmp = null;

        for (var k in wptjson.median) {

            var run = wptjson.median[k],
                item = $wpts;

            item = item.replace('{{title}}', indexs[i]);

            for (var j = 0, l = replaces.length; j <= l; j++) {
                item = item.replace('{{' + replaces[j] + '}}', run[replaces[j]]);
            }

            tmp += item.replace('{{requests}}', run['requests'].length);

            i++;

        }

        $('#summary').find('tbody').empty().append(tmp);

        wptapi.setJson(wptjson);
        waterfall.showme('#waterfall',
            wptapi.getData(wptjson.median.firstView.run),
            wptjson.median.firstView.fullyLoaded);

    }

    function wptcheck(url) {
        $.ajax({
            async: true,
            cache: false,
            dataType: 'json',
            method: 'GET',
            url: url
        }).done(function (wptjson, textStatus, jqXHR) {
            $('#loading').find('.wpt-status').html(wptjson.statusText);
            if (wptjson.statusCode == 200) {
                clearInterval(interval);
                wpt(wptjson.data);
                hideLoading();
            }
        });
    }

    function showLoading() {
        $('#report').attr('disabled', 'disabled');

        $(window).on('resize.loading', function () {
            $('#wpt').height($(window).height() - $('#wpt').offset().top);
        }).trigger('resize');

        $('#wpt').append($loading.clone());
    }

    function hideLoading() {
        $('#wpt').css('height', 'auto');

        $loading.fadeOut('fast', function () {
            $(window).off('resize.loading');
            $('#loading').remove();
            $('#report').removeAttribute('disabled');
        });
    }


    function showQr(opts) {

        var $qrcode = $(opts.el);

        qrconfig.text = opts.text;
        new QRCode($qrcode.find('.qrcode')[0], qrconfig);

        $qrcode.find('a').attr('title', $qrcode.find('.qrcode-title').html())
            .attr('href', opts.text)
            .text(opts.text);
    }

    /**
     *
     * @param event
     * @returns {boolean}
     * @param $form
     */
    Cw.prototype.submit = function (event, $form) {
        event.preventDefault();

        var $inputs = $form.find(':input'),
            form = {
                runs: '3',
                connectivity: '3G',
                location: 'ec2-sa-east-1:Chrome',
                url: 'http://tn.com.ar'
            };

        form.location = ( $inputs.filter("[name='location']").val() || 'ec2-sa-east-1' ) + ':' + ( $inputs.filter("[name='browser']").val() || 'Chrome' );
        $inputs = $inputs.not("[name='location']");

        for (var i = 0, l = $inputs.length; i < l; i++) {
            var $input = $($inputs[i]);
            if (['submit', 'button', 'reset'].indexOf($input.attr('type')) == -1) {
                if ($input.val() != null) {
                    form[$input.attr('name')] = $input.val();
                }
            }
        }

        psi(form.url);
        console.log("enviando", form);
        socket.emit('page', form);
        instance.changeScreen('#step-2', function () {
            showLoading();

        });
        //wptcheck('http://www.webpagetest.org/jsonResult.php?test=150922_M6_19B0')
        return false;
    };

    /**
     *
     * @param event
     */
    Cw.prototype.close = function (event) {

    };

    /**
     *
     * @param screen
     * @param callback
     */
    Cw.prototype.changeScreen = function (screen, callback) {
        console.log('debo cambiar a', screen);

        $('.active').fadeOut('fast', function () {
            $(this).removeClass('active');
        });

        $(screen).fadeIn('slow', function () {
            $(this).addClass('active');
        });

        if (callback && typeof(callback) === "function") {
            callback();
        }
    };

    /**
     *
     */
    Cw.prototype.report = function ($this) {

        if ($this.attr('disabled') === undefined) {
            return false;
        }

        var $report = $loading.clone();

        $report.find('.wpt-status').remove().end()
            .attr('id', 'modal').attr('class', 'modal')
            .children().prepend('<div class="close" title="Cerrar"></div>');

        $('body').append($report);

        showQr({
            el: '#qrcode-psi',
            text: urls.psi
        });

        showQr({
            el: '#qrcode-wpt',
            text: urls.wpt
        });

        $report.fadeIn('slow')
            .on('click.close', function (e) {

                if ((e.target.className == 'close') || (e.target.className == 'modal')) {
                    $report.fadeOut('fast', function () {
                        $(this).remove();
                    }).off('click.close');
                }
            });
    };

    /**
     *
     */
    Cw.prototype.reset = function () {
        console.log('cleaning odometer');
        odometers.speed.update(0);
        odometers.ux.update(0);
        $('#summary').find('tbody td').html('');
        $('#waterfall').empty();
        $('#loading').find('.qrcode img').remove();
    };

    return (instance = (instance || new Cw()));

});