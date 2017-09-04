var fs = require('fs');
var tsv = fs.readFileSync(process.argv[2], "utf-8");
var lines = tsv.split("\n");
var map = new Array(); // "AG1-AG2,count";

for (key in lines) {
    var columns = lines[key].split("\t");
    if (lines[key].indexOf("#")==0 || columns.length<13) continue;
    var ags = columns[13].split(",");
    for (var i=0; i<ags.length; i++){
        var ag1 = ags[i];
        for (var j=i+1; j<ags.length; j++){
            var ag2 = ags[j];
            var k = ag1 + "," + ag2;
            var k2 = ag2 + "," + ag1;
            if (k in map){
                map[k]++;
            } else if (k2 in map){
                map[k2]++;
            } else {
                map[k] = 1;
            }
        }
    }
}
for (ag12 in map) {
   console.log(map[ag12]+"\t"+ag12);
}

