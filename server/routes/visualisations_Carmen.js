const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

const con = require('../helpers/database');

//insert source in session
router.post('/getDataforVis', (req, res, next) => {
  var results = [];
  const id_session = req.body.id_session;
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  var query_string = 'SELECT action_session.id, action_session.id_session, action_session.id_action, action_session.id_object, action_session.action_desc, action_session.param_value, action_session.duration, object_session.name  FROM action_session left join object_session  on action_session.id_object = object_session.id where action_session.id_session=?';
  con.query(query_string, [req.body.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });

    return res.json(results);
  });
  
    //return res.json(JSON.parse(results));
});

router.post('/generateJson', (req, res, next) => {
  data = req.body;
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  newdate = year + "-" + month + "-" + day;

  var participants = {};
  var nparticipants = 0;
  var CPR_array = [];
  var sessions_stop = [];
  var id_session = 0;
  var participant_names = []

  for (var i = 0; i < data.length; i++) {
          if (data[i].name != null){
            participant_names.push(data[i].name);
            participants[data[i].name] = {};
            participants[data[i].name]["name"] = data[i].name;
            participants[data[i].name]["group"] = 0
            participants[data[i].name]["actions"] = [];
          }
        }
  //console.log(participants);
  for (x in participants) {nparticipants++;}
participants["n"] = nparticipants;
participants["who"] = removeDuplicates(participant_names);
participants["who"] = participants["who"].sort();
participants["who"] = participants["who"].reverse();
participants["time_start"] = newdate+" 00:00:00";
participants["criticalTs"] = [];
console.log(participants);
        for (var i = 0; i < data.length; i++) {
          //id_session to generate json file
          id_session = data[i].id_session;
          //add when the session ended
          if(data[i].action_desc == "Session ended"){
            participants["time_end"] = newdate+" "+data[i].duration.split(".")[0];
          }
          
          //add critical items to R1 - they don't have student associated
          //change: add doctor as a timeline, and then add critical incidents

          if(data[i].param_value == "alert"){
            var ct = {};
            ct["event"] = data[i].action_desc;
            ct["when"] = newdate+" "+data[i].duration.split(".")[0];
            participants["criticalTs"].push(ct);


            // add critical items attributes to teacher1
            var critical_item = {};
            time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
            critical_item["id"] = participants["teacher1"]["actions"].length+1;
            critical_item["group"] = 1;
            critical_item["action"] = data[i].action_desc;
            critical_item["start"] = newdate+" "+data[i].duration.split(".")[0];
            critical_item["type"] = "box";
            critical_item["className"] = "critical";
           
            console.log('hola aqui');

            if(data[i].action_desc.split(" ")[0] == "Ask"){
              critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/ask.png" style="width: 136px; height: 112px;">';
              }
            else if(data[i].action_desc.split(" ")[0] == "Lose"){
              critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/lose.png" style="width: 136px; height: 112px;">';
              }
            else if(data[i].action_desc.split(" ")[0] == "Deteriorate"){
              critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/deteriorate.png" style="width: 136px; height: 112px;">';
              }
            participants["teacher1"]["actions"].push(critical_item);
          }

          //add actions that were made by a student
          if(data[i].duration != null && data[i].name != null ){
            var item = {};
            //find CPR actions as they have duration
            if(data[i].action_desc == "Start CPR"){
              CPR_array.push(data[i]);
            }

            else if(data[i].action_desc == "Stop CPR"){
              sessions_stop.push(data[i].id);
            }

            else {
              //console.log(data[i].action_desc);
              //any other action
              time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
              item["id"] = participants[data[i].name]["actions"].length+1;
              if(data[i].name == "teacher1"){
                item["group"] = 1;
                participants[data[i].name]["group"] = 1;
              }
              else{
                item["group"] = parseInt(data[i].name.slice(-1))+1;
                participants[data[i].name]["group"] = parseInt(data[i].name.slice(-1))+1;
              }

              item["action"] = data[i].action_desc;
              item["start"] = newdate+" "+data[i].duration.split(".")[0];
              item["type"] = "box";
              if (data[i].action_desc == "Deliver Shock"){
                item["className"] = "action shock "+data[i].name.toLowerCase();
              }
              else{
                item["className"] = "action "+data[i].name.toLowerCase();
              }
              
              item["content"] = time_from_start+'<div id="text">'+data[i].action_desc+'</div>';
              if (data[i].name != null){
                participants[data[i].name]["actions"].push(item);
              }
            }
          }

        }//end for
        //console.log(sessions_stop);
        // add info from CPR
        for (var i = 0; i < CPR_array.length; i++) {
          var id_reg = CPR_array[i].id;
          var item = {};
            time_from_start = CPR_array[i].duration.split(":").slice(-2).join(":").split(".")[0];
            item["id"] = participants[CPR_array[i].name]["actions"].length+1;
            item["group"] = parseInt(CPR_array[i].name.slice(-1))+1;
            item["start"] = newdate+" "+CPR_array[i].duration.split(".")[0];
            item["align"] = "center";
            item["className"] = 'cpr';
            
            item["content"] = time_from_start+'<div id="text">Compressions</div>';
            var nearCPR = closest(id_reg,sessions_stop);
            sessions_stop = remove_closest(nearCPR,sessions_stop);
            
            for(var j=0; j < data.length; j++){
              if(data[j].action_desc == "Stop CPR" && data[j].id == nearCPR){
                  item["end"] = newdate+" "+data[j].duration.split(".")[0];
                  item["title"] = diff_minutes(data[j].duration,CPR_array[i].duration)+" mins";
              }
            }
          participants[CPR_array[i].name]["actions"].push(item);
          //console.log(item);
        }

  fs.writeFile("client/data/session_"+id_session+".json", JSON.stringify(participants), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 

  //console.log(participants);
  return res.json(participants);
});

router.get('/getJsonFromFile', (req, res, next) => {
  const id_session = req.query.id;
  var obj = JSON.parse(fs.readFileSync('client/data/session_'+id_session+'.json', 'utf8'));

  return res.json(obj);
  
    //return res.json(JSON.parse(results));
});

function closest (num, arr) {
                var curr = arr[0];
                var diff = Math.abs (num - curr);
                for (var val = 0; val < arr.length; val++) {
                    var newdiff = Math.abs (num - arr[val]);
                    if (newdiff < diff) {
                        diff = newdiff;
                        curr = arr[val];
                    }
                }
                return curr;
            }

function remove_closest (num, arr) {
                //console.log(arr1);
                for (var val = 0; val < arr.length; val++) {
                    if (arr[val] == num) {
                        removed =  arr.splice(val, 1);
                    }
                }
                return arr;
            }            
function diff_minutes(dt2, dt1) 
 {
  console.log(newdate+" "+dt1);
  var t1 = new Date(newdate+" "+dt1);
  var t2 = new Date(newdate+" "+dt2);
  var diff =t2.getTime() - t1.getTime();
  minutes = Math.floor(diff % 3.6e5) / 6e4;
  console.log(minutes.toFixed(2));
  return minutes.toFixed(2);
  
 }

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}
module.exports = router;
