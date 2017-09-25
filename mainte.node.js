
"use strict;";

var version = "c2-B-e"; // Chiakeshi 2gou - B part - revision

function formatDate(date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};

function basename (path, suffix) {
	// Returns the filename component of the path  
	// 
	// version: 910.820
	// discuss at: http://phpjs.org/functions/basename	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: Ash Searle (http://hexmen.com/blog/)
	// +   improved by: Lincoln Ramsay
	// +   improved by: djmix
	// *	 example 1: basename('/www/site/home.htm', '.htm');	// *	 returns 1: 'home'
	// *	 example 2: basename('ecra.php?p=1');
	// *	 returns 2: 'ecra.php?p=1'
	var b = path.replace(/^.*[\/\\]/g, '');
		if (typeof(suffix) == 'string' && b.substr(b.length-suffix.length) == suffix) {
		b = b.substr(0, b.length-suffix.length);
	}
	return b;
}

function l(hash){
  return Object.keys(hash).length;
}

function createResult(portals,masters){
  var result = {
    resP8:{},
    resP7:{},
    resP6u:{},
    enlP8:{},
    enlP7:{},
    enlP6u:{},
    neuP:{}
  };

  for (var i=0; i<masters.length; i++){
    var guid = masters[i].guid;
    var p = portals[guid];
    if (!p || !p.level){ continue; }
    if (p.team == "E"){
      if (p.level==8){
        result.enlP8[guid] = p;
      } else if (p.level==7){
       result.enlP7[guid] = p;
      } else {
        result.enlP6u[guid] = p;
      }
    } else if (p.team == "R"){
      if (p.level==8){
        result.resP8[guid] = p;
      } else if (p.level==7){
        result.resP7[guid] = p;
      } else {
        result.resP6u[guid] = p;
      }
    } else {
      result.neuP[guid] = p;
    }
  }
  return result;
}

function diff(result1, result2){
  return l(result1.resP8)==l(result2.resP8)
    && l(result1.resP7)==l(result2.resP7)
    && l(result1.resP6u)==l(result2.resP6u)
    && l(result1.enlP8)==l(result2.enlP8)
    && l(result1.enlP7)==l(result2.enlP7)
    && l(result1.enlP6u)==l(result2.resP6u)
    && l(result1.neuP)==l(result2.neuP);
}

function m() {
    if (arguments.length === 0) return false;
 
    var i, len, key, result = [];
 
    for (i = 0, len = arguments.length;i < len; i++) {
        if (typeof arguments[i] !== 'object') continue;
 
        for (key in arguments[i]) {
            if (isFinite(key)) {
                result.push(arguments[i][key]);
            } else {
                result[key] = arguments[i][key];
            }
        }
    }
 
    return result;
};

function createResultString(masters, currentResult,currentPortals,lastResult,lastPortals){
  var change = false;
  // var resultStr = "Time: " + new Date().toLocaleString('ja-JP')+ "\n" + 
  var resultStr = "Time: " + formatDate(new Date(),"YYYY-MM-DD hh:mm:ss")+ "\n" + 
    "File: "+basename(process.argv[3],"")+" ["+version+"]\n"+
    "P8 RES " + l(currentResult.resP8) +" : " + l(currentResult.enlP8) +" ENL\n"+
    "P7 RES " + l(currentResult.resP7) +" : " + l(currentResult.enlP7) +" ENL\n"+
    "P6-1 RES " + l(currentResult.resP6u) +" : " + l(currentResult.enlP6u) +" ENL\n";
  if (0<l(currentResult.neuP)){
    resultStr += "中立ポータル: " + l(currentResult.neuP) + "\n";
    for (var guid in currentResult.neuP){
      var p = currentResult.neuP[guid];
      resultStr += "  "+p.title + "\n"; 
    }
  }

  var lvup = [];
  var lvdown = [];
  for (var guid in currentPortals){
    var cp = currentPortals[guid];
    var lp = lastPortals[guid];
    // console.log(cp);
    if (!cp || !lp){
      continue;
    }
        if (lp.team=="N"){
            if (cp.team=="N"){
                // N -> N
                // nothind to do
            } else if (cp.team=="R"){
                // N -> R
                // UPREPO
                lvup.push("  (NEU->RES P"+cp.level+")"+cp.title);
            } else if (cp.team=="E"){
                // N -> E
                // DOWNREP
                lvdown.push("  (NEU->ENL P"+cp.level+")"+cp.title);
            }
        } else if (lp.team=="R"){
            if (cp.team=="N"){
                // R -> N
                // DOWNREP
                lvdown.push("  (RES->NEU)"+cp.title);
            } else if (cp.team=="R"){
                // R -> R
                if (lp.level<cp.level){
                    lvup.push("  (RES P"+lp.level+"->P"+cp.level+")"+cp.title);
                } else if (lp.level<cp.level){
                    lvdown.push("  (RES P"+lp.level+"->P"+cp.level+")"+cp.title);
                }
            } else if (cp.team=="E"){
                // R -> E
                lvdown.push("  (RES->ENL P"+cp.level+")"+cp.title);
            }
        } else if (lp.team=="E"){
            if (cp.team=="N"){
                // E -> N
                lvup.push("  (ENL->NEU)"+cp.title);
            } else if (cp.team=="R"){
                // E -> R
                lvup.push("  (ENL->RES P"+cp.level+")"+cp.title);
            } else if (cp.team=="E"){
                // E -> E
                if (lp.level<cp.level){
                    lvdown.push("  (ENL P"+lp.level+"->P"+cp.level+")"+cp.title);
                }
            }
        }
  }
  var enlPs = m(enlPs, currentResult.enlP8);
  enlPs = m(enlPs, currentResult.enlP7);
  enlPs = m(enlPs, currentResult.enlP6u);
  if (0<l(enlPs)){
    resultStr += "ENLポータル: "+l(enlPs) +"\n";
    for (var guid in enlPs){
      var p = enlPs[guid];
      resultStr += "  (P"+p.level + ")"+p.title + ", "; 
    }
    resultStr += "\n";
  }
  if (0<lvup.length){
    resultStr += "*Level up*\n";
    for (var i in lvup){
      resultStr += lvup[i]+"\n";
    }
  }
  if (0<lvdown.length){
    resultStr += "*Level down*\n";
    for (var i in lvdown){
      resultStr += lvdown[i]+"\n";
    }
  }
  var r = {
    change: change,
    resultStr: ""
  };
  if (!change && lvup.length==0 && lvdown.length==0){
    // 変化がない場合は・・
    r.change = false;
  } else {
    r.change = true;
  }
  r.resultStr = resultStr;
  return r;
}

function load(masters, file){
  var fs = require('fs');
  var ps = fs.readFileSync(file, "utf-8");
  ps = JSON.parse(ps);
  var result = {};
  for (var i in masters){
    var p = masters[i];
    result[p.guid] = ps[p.guid];
  }
  return result;
}

function main(){
  var fs = require('fs');
  // master
  var masters = fs.readFileSync(process.argv[2], "utf-8");
  masters = JSON.parse(masters);

  var currentPortals = load(masters,process.argv[3]);
  // var currentPortals = fs.readFileSync(process.argv[3], "utf-8");
  // currentPortals = JSON.parse(currentPortals);

  var lastPortals = load(masters,process.argv[4]);
  // var lastPortals = fs.readFileSync(process.argv[4], "utf-8");
  // latsPortals = JSON.parse(lastPortals);

  var currentResult = createResult(currentPortals, masters);
  var lastResult = createResult(lastPortals, masters);

  var result = createResultString(masters,currentResult,currentPortals,lastResult,lastPortals);
  if (result.change){
    console.log(result.resultStr);
  }
}

main();


