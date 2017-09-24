
"use strict;";

var reswueTmpl = {
    "Document": {
        "FileFormatVersion": "1"
    },
    "OperationInfo": {
        "OperationName": ""
    },
    "Portals": [],
    "Links": [],
    "Polygons": [],
    "Agents": [],
    "Groups": [],
    "Alerts": []
};

function l(hash){
  return Object.keys(hash).length;
}

function createResult(portals, agName){
  var results = [];
  for (var guid in portals){
    var p = portals[guid];
    var ags = p[13];
    if (ags.split(",").indexOf(agName)==-1 && p[1]!=8){
      results.push(map(p,agName));
    }
  }
  return results;
}

function map(p,ag){
  var l = p[10].split(",");
  // return {"type":"marker","latLng":{"lat":l[0],"lng":l[1]},"color":"red", "title":p[2]}
  return {
    "guid":p[11],
    "alerttype":"UpgradePortalAlert",
    "nodeName":p[2],
    "lat":l[0],"lng":l[1],
    "agent":ag,
    "agentname":ag
  };
  // return p;
}

function load(masters, file){
  var fs = require('fs');
  var content = fs.readFileSync(file, "utf-8");
  var lines = content.split("\n"); 
  var result = {};
  
  for (var line in lines){
    line = lines[line];
    var columns = line.split("\t");
    var guid = columns[11];
    if(guid){
      for (var i in masters){
        if (masters[i].guid == guid){
          result[guid] = columns;
        }
      }
    }
  }
  return result;
}

function main(){
 console.log(process.argv);
  var fs = require('fs');
  // master
  var masters = fs.readFileSync(process.argv[2], "utf-8");
  masters = JSON.parse(masters);

  var currentPortals = load(masters,process.argv[3]);
  var alerts = [];
  for (var i=4;i<process.argv.length;i++){
   var agName = process.argv[i];
   var ar = createResult(currentPortals, agName);
   alerts = alerts.concat(ar);
  }
  reswueTmpl.Alerts = alerts;
  console.log(JSON.stringify(reswueTmpl));
}

main();


