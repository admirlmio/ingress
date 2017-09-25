// ==UserScript==
// @id             iitc-plugin-portal-detailer@kuzira245
// @name           IITC plugin: Chiakeshi-1gou
// @category       Info
// @author         kuzira245
// @version        1.1.1.2
// @namespace      http://nayuki.homeip.net:81/~nayuki/
// @description    Send portal detailes to server.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapperPD() {
    String.prototype.splice = function(idx, rem, s) {
        return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
    };
    // in case IITC is not available yet, define the base plugin object
    if (typeof window.plugin !== "function") {
        window.plugin = function() {};
    }

    function toEasyView(mod, simple){
        var color = "white";
        var r = "";
        var m = mod.name;
        if (mod.rarity == "VERY_RARE"){
            color = "#FF0077";
            r = "VR";
        }
        if (mod.rarity == "RARE"){
            color = "#73a8ff";
            r = "R";
        }
        if (mod.rarity == "COMMON"){
            color = "#8cffbf";
            r = "C";
        }
        if (mod.name == "Portal Shield"){
            m ="PS";
        }
        if (mod.name == "AXA Shield"){
            m ="AXA";
            r = "";
        }
        if (mod.name == "SoftBank Ultra Link"){
            m ="SBUL";
            r = "";
        }
        if (mod.name == "Heat Sink"){
            m ="HS";
        }
        if (mod.name == "Multi-hack"){
            m ="MH";
        }
        if (mod.name == "Link Amp"){
            m ="LA";
        }
        if (mod.name == "Force Amp"){
            m ="FA";
            r = "";
        }
        if (mod.name == "Turret"){
            m ="TU";
            r = "";
        }
        if (mod.name == "Ito En Transmuter (+)"){
            m = "ITOEN(+)";
            r = "";
        }
        if (mod.name == "Ito En Transmuter (-)"){
            m = "ITOEN(-)";
            r = "";
        }
        var text = r+m;
        if (simple){
            return text;
        } else if (text == "RHS" || text == "RMH"){
            return '<span style="color:'+color+';background-color:#886A08;">'+text+'</span>';
        } else if (text == "VRHS" || text == "VRMH"){
            return '<span style="color:'+color+';background-color:yellow;">'+text+'</span>';
        } else if (text == "ITOEN(+)" || text == "ITOEN(-)"){
            return '<span style="color:'+color+';background-color:yellow;">'+text+'</span>';
        } else {
            return '<span style="color:'+color+';">'+text+'</span>';
        }
    }

    function json4Import(b){
        var date = new Date();
        var polyMap = {
            "Polygons": [
                {
                    "description": date.toISOString(),
                    "type": "groupa",
                    "latlngs": [
                        b._southWest,
                        {"lat":b._southWest.lat, "lng":b._northEast.lng},
                        b._northEast,
                        {"lat":b._northEast.lat, "lng":b._southWest.lng},
                        b._southWest
                    ],
                    "color": "blue"
                }
            ]
        };
        return JSON.stringify(polyMap);
    }

    function getFactionColor(team){
        if (team=="R"){
            return "#4999d0";
        } else if (team=="E"){
            return "#62b73c";
        } else {
            return "white";
        }
    }

    function getResoLVLsSpan(detail, party, simple){
        var ret ="";
        var array = [];
        for (var i=0; i<detail.resonators.length; i++){
            array.push(detail.resonators[i].level);
        }
        array.sort(
            function(a,b){
                if( a < b ) return 1;
                if( a > b ) return -1;
                return 0;
            }
        );
        for (var i=0; i<detail.resonators.length; i++){
            if (simple){
                ret += "" + array[i];
            } else {
                ret += '<span style="color:'+getLevelColor(array[i])+';">' + array[i] + "</span>";
            }
        }

        for (var i=0; i<detail.resonators.length; i++){
            var owner = detail.resonators[i].owner;
            if (party.lastIndexOf(owner)<0){ party.push(owner);}
        }
        return ret;
    }

    function getPortalLevelSpan(detail, simple){
        return '<span style="color:'+getLevelColor(detail.level)+'">P'+detail.level+'</span>';
    }

    function getLevelColor(level){
        var color = "white";
        switch (level){
            case 1:
                color = "#fece3b";
                break;
            case 2:
                color = "#ffa622";
                break;
            case 3:
                color = "#ff7312";
                break;
            case 4:
                color = "#e40008";
                break;
            case 5:
                color = "#fd2992";
                break;
            case 6:
                color = "#eb26a9";
                break;
            case 7:
                color = "#c124bf";
                break;
            case 8:
                color = "#9627d0";
                break;
        }
        return color;
    }

    function e6toN(dep){
        dep = ""+dep;
        return dep.splice(dep.length-6,0,".");
    }
    function getFuctionalSpan(detail){
        var color = getFactionColor(detail.team);
        return '<a href="https://www.ingress.com/intel?pll='+e6toN(detail.latE6)+','+e6toN(detail.lngE6)+'&z=17" style="color:'+color+';" target="_blank">'+detail.title+'</a>';
    }

    function getPartySpan(team, party){
        return '<span style="color:'+getFactionColor(team)+';">' + party + "</span>";
    }

    function toJson(detail){
        var cache = [];
        return JSON.stringify(detail , function(key, value) {
            if (typeof value == 'object' && value !== null){
                if (-1 < cache.indexOf(value)) return;
            }
            cache.push(value);
            return value;
        });
    }

    function getSimpleTSV(detail){
        var party = [];
        var tsv = detail.team + "\t";
        tsv += detail.level + "\t";
        tsv += detail.title + "\t";
        var mods = "";
        for (var i=0; i<4; i++){
            if (i<detail.mods.length){
                var mod =detail.mods[i];
                if (mod !== null){
                    mods += toEasyView(mod,true);
                    if (party.lastIndexOf(mod.owner)<0){ party.push(mod.owner);}
                }
                mods += "\t";
            }else{
                mods += "\t";
            }
        }
        tsv += mods + "\t";
        const resos = getResoLVLsSpan(detail, party,true);
        tsv += resos + "\t";
        tsv += detail.owner + "\t";
        const latlng = e6toN(detail.latE6)+','+e6toN(detail.lngE6);
        tsv += latlng+"\t";
        tsv += detail.guid + "\t";
        tsv += "https://www.ingress.com/intel?pll="+latlng+"&z=17\t";
        tsv += party;
        return tsv;
    }

   function download(content, mimeType, extention){
       var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
       var blob = new Blob([ bom, content ], { "type" : mimeType });
       var a = document.createElement('a');
       // file nameにdateを足す
       var date = new Date () ;
       var year = date.getFullYear() ;
       var month = date.getMonth() + 1 ;
       var day = date.getDate() ;
       var hour = date.getHours() ;
       var minute = date.getMinutes() ;
       if (month < 10) {
           month  = '0' + month ;
       }
       if (day < 10) {
           day = '0' + day ;
       }
       if (hour < 10) {
           hour   = '0' + hour ;
       }
       if (minute < 10) {
           minute = '0' + minute ;
       }
       a.download = "PD_"+year+month+day+"_"+hour+minute+"."+extention;
       a.target   = '_blank';
       if (window.URL && window.URL.createObjectURL) {
           // for Firefox
           a.href = window.URL.createObjectURL(blob);
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
       } else if (window.webkitURL && window.webkitURL.createObject) {
           // for Chrome
           a.href = window.webkitURL.createObjectURL(blob);
           a.click();
       } else {
           alert("未実装の機能です.");
       }
   }
    
    // base context for plugin
    window.plugin.ingresspd = function() {};
    var self = window.plugin.ingresspd;
    self.executing = false;
    self.guids = [];
    self.index = 0;
    self.details = [];
    self.enlOnly = false;
    self.toggle =  function (){
        if (window.plugin.ingresspd.executing){
            // stop
            window.plugin.ingresspd.executing = false;
            $("#idmPDCheckButton").text("START");
        } else if (self.index<self.guids.length){
            // continuie
            window.plugin.ingresspd.executing = true;
            $("#idmPDCheckButton").text("STOP");
            window.portalDetail.request(self.guids[self.index]);
        } else {
            // restart
            window.plugin.ingresspd.executing = true;
            $("#idmPDCheckButton").text("STOP");
            window.plugin.ingresspd.reset();
        }
    };

    window.plugin.ingresspd.export = function() {};
    self.export.json =  function (){
        if (window.plugin.ingresspd.executing){
            alert("実行中はエクスポート機能を利用できません.");
            return;
        }
        var list = [];
        for (var i in window.plugin.ingresspd.details){
            list.push(window.plugin.ingresspd.details[i]);
        }
        var json = toJson(list);
        download(json, "application/json", "json");
    };

    self.export.tsvString =  function (){
        var tsv = "#team\tlv\tname\tmod1\tmod2\tmod3\tmod4\tresos\towner\tlatlng\tguid\tURL\tparty(s)\t"+json4Import(window.map.getBounds())+"\n";
        for (var i in window.plugin.ingresspd.details){
            tsv += getSimpleTSV(window.plugin.ingresspd.details[i])+"\n";
        }
        return tsv;
    };
    self.export.tsv =  function (){
        download(self.export.tsvString(), "plain/text", "txt");
    };
    self.export.html =  function (){
        alert("未実装の機能です.そのうち作ります.");
    };
    self.export.send =  function (){
        alert("未実装の機能です.そのうち作ります.");
    };
    self.export.copy =  function (){
        var textArea = document.createElement("textarea");
        textArea.value = self.export.tsvString();
        document.body.appendChild(textArea);
        textArea.select();
        var result = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (result){
            alert("結果をクリップボードにコピーしました.");
        }
    };

    self.reset = function reset(){
        self.details = [];
        for (var guid in window.portals) {
            var p = window.portals[guid];
            var b = window.map.getBounds();
            // skip if not currently visible
            if (p._latlng.lat < b._southWest.lat || p._latlng.lng < b._southWest.lng
                || p._latlng.lat > b._northEast.lat || p._latlng.lng > b._northEast.lng) continue;
            if (self.enlOnly && p.options.data.team != "E"){
                continue;
            }else{
                self.guids.push(guid);
            }
        }
        $("#idmPDCheckNums").text((self.index)+"/"+self.guids.length);
        $("#idmPDCheck li").remove();
        window.portalDetail.request(self.guids[self.index]);
    };

    self.genk = function genk() {
        if (self.executing){
            return;
        }
        self.enlOnly = confirm("Pickup ENL portals only?\nIf you push cancel puck up all portals. ");
        var mode = "ALL";
        if (self.enlOnly){ mode = "ENL Only"; }
        self.executing = true;
        var dialog = window.dialog({
            title: "Ingress Portal checker",
            html: '<span>画面に表示されているポータルを調べます</span> ['+mode+'] <span id="idmPDCheckNums"/><br/>'
            +'<button type="button" id="idmPDCheckButton" onclick="window.plugin.ingresspd.toggle();" style="width: 40%;">STOP</button>'
            +'<button type="button" onclick="window.plugin.ingresspd.export.json();" style="width: 10%;">JSON</button>'
            +'<button type="button" onclick="window.plugin.ingresspd.export.tsv();" style="width: 10%;">TSV</button>'
            +'<button type="button"  onclick="window.plugin.ingresspd.export.html();" style="width: 10%;">HTML</button>'
            +'<button type="button"  onclick="window.plugin.ingresspd.export.copy();" style="width: 10%;">COPY</button>'
            +'<button type="button"  onclick="window.plugin.ingresspd.export.send();" style="width: 15%;">SERVER</button>'
            +'<div style="width: 600px; height: ' + ($(window).height() - 150) + 'px; margin-top: 5px;background-color: rgba(29,29,29,0.5);"><ul  id="idmPDCheck"/></div>',
            closeCallback: function(){
                self.executing=false;
                self.guids = [];
                self.index = 0;
            }
        }).parent();
        $(".ui-dialog-buttonpane", dialog).remove();
        // width first, then centre
        dialog.css("width", 630).css({
            "top": ($(window).height() - dialog.height()) / 2,
            "left": ($(window).width() - dialog.width()) / 2
        });
        self.reset();
        return dialog;
    };
    // setup function called by IITC
    self.setup = function init() {
        // add controls to toolbox
        var link = $("<a onclick=\"window.plugin.ingresspd.genk();\" title=\"Check portals in this screen.\">Check Ps</a>");
        $("#toolbox").append(link);
        window.addHook('portalDetailLoaded', function(data) { setTimeout(function(d){
            var cache = [];
            var detail = window.portalDetail.get(d.guid);
            detail.guid = d.guid;
            self.details.push(detail);
            self.index++;
            $("#idmPDCheckNums").text((self.index)+"/"+self.guids.length);
            var color = "white";
            var mods = "";
            var party = [detail.owner];

            for (var i=0; i<4; i++){
                if (i<detail.mods.length){
                    var mod = detail.mods[i];
                    if (mod !== null){
                        if (mods.length){
                            mods += ",";
                        }
                        mods += toEasyView(mod, false);
                        if (party.lastIndexOf(mod.owner)<0){ party.push(mod.owner);}
                    } else {
                        mods += ",";
                    }
                }else{
                    mods += ",";
                }
            }
            $('<li>'+getPortalLevelSpan(detail)+','+getFuctionalSpan(detail)+',' + mods + ','+getResoLVLsSpan(detail, party,false)+','+getPartySpan(detail.team, party)+','+e6toN(detail.latE6)+','+e6toN(detail.lngE6)+'</li>').appendTo("#idmPDCheck");
            if (!self.executing){
                return;
            }
            if (self.index<self.guids.length){
                window.portalDetail.request(self.guids[self.index]);
            } else {
                self.executing = false;
                self.guids = [];
                self.index = 0;
                $("#idmPDCheckButton").text("FINISHED. RESTART?");
            }
        }, 3000, data); });
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
script.appendChild(document.createTextNode("(" + wrapperPD + ")();"));
(document.body || document.head || document.documentElement).appendChild(script);
