var fs = require('fs');
var tsv = fs.readFileSync(process.argv[2], "utf-8");
var lines = tsv.split("\n");
var map = new Array(); // "AG1,count";

function countUp(m, ownerd){
    if (ownerd in map){
        map[ownerd]++;
    } else {
        map[ownerd]=1;
    }
}

for (key in lines) {
    var columns = lines[key].split("\t");
    if (lines[key].indexOf("#")==0 || columns.length<13) continue;
    if (!columns[13]) continue;
    var ags = columns[13].split(",");
    var owner = columns[9];
    countUp(map, owner);
    for (var i=0; i<ags.length; i++){
        var ag1 = ags[i];
        if (ag1==owner) continue;
        countUp(map,ag1)
    }
}

for (ag in map) {
   console.log(map[ag]+"\t"+ag);
}

