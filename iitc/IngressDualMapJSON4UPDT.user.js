// ==UserScript==
// @id             iitc-plugin-ingressdualmap-exporter-json-updt@kuzira245
// @name           IITC plugin: Portals information send to server.(for ICE)
// @category       Keys
// @version        0.0.0.1
// @namespace      http://nayuki.homeip.net:81/~nayuki/
// @description    Exports portals currently in view as a JSON list for use with Ingress Dual Map.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==
// {"key":"iitc-plugin-ingressdualmap-exporter-json-updt","value":{"upload":"https://nayuki.homeip.net/~nayuki/cgi-bin/dput.cgi","headers":{"x-filename":"ktnr_"}}}
function wrapperJSON() {
    // in case IITC is not available yet, define the base plugin object
    if (typeof window.plugin !== "function") {
        window.plugin = function() {};
    }
    // base context for plugin
    window.plugin.ingressdualmapjson = function() {};
    var self = window.plugin.ingressdualmapjson;
    self.genk = function genk() {
        var o = [];
        for (var guid in window.portals) {
            var cache = [];
            var portal = JSON.stringify(window.portals[guid].options.data , function(key, value) {
                if (typeof value == 'object' && value != null){
                    if (-1 < cache.indexOf(value)) return;
                }
                cache.push(value);
                return value;
            });
            o.push(portal);
        }

        var dialog = window.dialog({
            title: "Ingress Dual Map: JSON export",
            html: '<span>Save the list below as a JSON file, then copy it to <code>/sdcard/IngressDualMap</code> on your phone.</span>'
            + '<textarea id="idmJSONExport" style="width: 600px; height: ' + ($(window).height() - 150) + 'px; margin-top: 5px;"></textarea>'
        }).parent();
        $(".ui-dialog-buttonpane", dialog).remove();
        // width first, then centre
        dialog.css("width", 630).css({
            "top": ($(window).height() - dialog.height()) / 2,
            "left": ($(window).width() - dialog.width()) / 2
        });
        $("#idmJSONExport").val(o);
        return dialog;
    };
    // setup function called by IITC
    self.setup = function init() {
        // add controls to toolbox
        var link = $("<a onclick=\"window.plugin.ingressdualmapjson.genk();\" title=\"Generate a JSON list of portals and locations for use with Ingress Dual Map.\">JSON Export</a>");
        $("#toolbox").append(link);
        window.addHook('mapDataRefreshEnd', function() { setTimeout(function(){
            var value = localStorage['iitc-plugin-ingressdualmap-exporter-json-updt'];
            var url = "https://nayuki.homeip.net/~nayuki/cgi-bin/dput.cgi"; // default
            var xhr = new XMLHttpRequest();
            if(!value) {
                console.log("UPDT: configuration and values are not found.");
            } else {
                url = value.upload || url;
            }

            xhr.open("POST" , url, true);
            if (value && value.headers){
                for (key in value.headers){
                    if (key == "x-filename"){
                        xhr.setRequestHeader(key, value.headers[key]+Date.now()+".json");
                    } else {
                        xhr.setRequestHeader(key, value.headers[key]);
                    }
                }
            }
            xhr.onreadystatechange = function (){

                switch(xhr.readyState){
                case 4:
                    if(xhr.status == 0){
                        console.log("XHR 通信失敗");
                    }else{
                        if((200 <= xhr.status && xhr.status < 300) || (xhr.status == 304)){
                            console.log("受信:" + xhr.responseText);
                        }else{
                            console.log("その他の応答:" + xhr.status);
                        }
                    }
                    break;
                }
            };
            var o = {};
            for (var guid in window.portals) {
                o[guid] = (window.portals[guid].options.data);
            }
            var cache = [];
            var json = JSON.stringify(o , function(key, value) {
                if (typeof value == 'object' && value != null){
                    if (-1 < cache.indexOf(value)) return;
                }
                cache.push(value);
                return value;
            });

            console.log("send json.size="+json.length);
            $("body").append($('<span style="display: none;" id="jsonView">'+json+'</span>'));
            xhr.send(json);
            console.log("ok");
            //xhr.abort(); 
        },1); });
        // delete setup to ensure init can't be run again
        delete self.setup;
    };
    // IITC plugin setup
    if (window.iitcLoaded && typeof self.setup === "function") {
        self.setup();
    } else if (window.bootPlugins) {
        window.bootPlugins.push(self.setup);
    } else {
        window.bootPlugins = [self.setup];
    }
}
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapperJSON + ")();"));
(document.body || document.head || document.documentElement).appendChild(script);
