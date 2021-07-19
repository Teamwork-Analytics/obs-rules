const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');

const mqtt = require('mqtt');
const url = require('url');
var fs = require('fs');

const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wfejcfvu:t7Os7ERNBJ0s@m14.cloudmqtt.com:19641');
//const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wpancwwq:JM7WMMC9MqzM@m14.cloudmqtt.com:11474');
const auth = (mqtt_url.auth || ':').split(':');
var mqtt_client = [];

/*const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'group_analytics1'
});*/

const database='AllUTSsessions';
//const database='MonashAugustDataCollection';
//const database='group_analytics1';
//const database='MonashInterviews';

const con = mysql.createConnection({
  host: 'localhost',
  user: 'gloria',
  password: 'Sj&7u#THDXWihfAy37KqyAu6hmGkLT',
  database: database
});

// router.get('/', (req, res, next) => {
//   res.sendFile(path.join(
//     __dirname, '..', '..', 'client', 'views', 'rules.html'));
// });

//get all rules
router.get('/all/:id_session', (req, res, next) => {
  const results = [];

  con.query('SELECT * FROM rules WHERE id_session = ? ORDER BY type ASC;', [req.params.id_session], (err, rows)=>{
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
        //console.log(`${row.name} , ${row.magnitude}`);
      });
      return res.json(results);
  });
});

//get one rules
router.get('/selectOneRule/:id_rule', (req, res, next) => {
  const results = [];
  console.log('selectOneRule########: ', req.params.id_rule);
  console.log('ID_SESSION: ########: ', req.query.id_session);

  con.query('SELECT r.id, r.name, r.magnitude, r.feedback_ok, r.feedback_wrong, r.value_of_mag, (select a.action_desc from action_session as a, rules as r where r.id_first_act=a.id_action and r.id=?  and a.id_session=?) AS first_action, (select a.action_desc from action_session as a, rules as r where r.id_second_act=a.id_action and r.id=? and a.id_session=?) AS second_action FROM rules as r WHERE r.id=?;', 
    [req.params.id_rule, req.query.id_session, req.params.id_rule, req.query.id_session, req.params.id_rule], (err, rows)=>{
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
        //console.log(`${row.magnitude} , ${row.feedback_ok}`);
      });
      return res.json(results);
  });
});

//Edit one rule
router.post('/editRule/:id_rule', (req, res, next) => {
  const results = [];
  data = req.body;
  //rule = data.rule;
  console.log('editOneRule########: ', req.params.id_rule);
  console.log('ID_SESSION: ########: ', req.query.id_session);

  const dtobj_string = [data.name, data.value_of_mag, data.feedback_wrong, data.feedback_ok, req.params.id_rule];  
  //var rule_string = {name:req.body.name, type: req.body.typeRule, id_session: req.body.sessionid, id_first_act: req.body.firstAction, id_second_act: req.body.secondAction, magnitude: req.body.magnitude, value_of_mag: req.body.value, feedback_ok: req.body.feedbackCorrect, feedback_wrong: req.body.feedbackWrong};  

  console.log("The values for the update are", data.name, data.value_of_mag, data.feedback_wrong, data.feedback_ok, data.id_Rule);


  con.query('UPDATE rules SET name = ?, value_of_mag =?, feedback_wrong=?, feedback_ok = ? WHERE (id = ?);', dtobj_string, (err, rows)=>{
      if(err) throw err;
     con.query('SELECT r.id, r.name, r.magnitude, r.feedback_ok, r.feedback_wrong, r.value_of_mag, (select a.action_desc from action_session as a, rules as r where r.id_first_act=a.id_action and r.id=?  and a.id_session=?) AS first_action, (select a.action_desc from action_session as a, rules as r where r.id_second_act=a.id_action and r.id=? and a.id_session=?) AS second_action FROM rules as r WHERE r.id=?;', 
    [req.params.id_rule, req.query.id_session, req.params.id_rule, req.query.id_session, req.params.id_rule], (err, rows)=>{
    if(err) throw err;

    rows.forEach( (row) => {
      results.push(row);
        //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    return res.json(results);
    });
  });
}); //end function

//get types of rules
router.get('/types', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM rules_obs WHERE (id <> 4) and (id <> 6);', (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    console.log(`${row.name}`);
    });
    return res.json(results);
  });
});

//get actions from session
router.get('/actions/:id_session', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM action_session WHERE id_session = ? ORDER BY id ASC;', [req.params.id_session], (err,rows) => {
    if(err) throw err;
    rows.forEach( (row) => {
      results.push(row);
      console.log(`${row.action_desc}`);
    });
    return res.json(results);
  });
});

const roles = (id_session, callback) => {
  const results = [];

    con.query('SELECT * FROM object_session WHERE id_session = ? and id_object !=4 ORDER BY id ASC;', [id_session], (err,rows) => {
    if(err) throw err;
    rows.forEach( (row) => {
      results.push(row);
      console.log(`${row.action_desc}`);
    });
    callback (results);
  });
};

//get roles from session
router.get('/roles/:id_session', (req, res, next) => {
  return roles(req.params.id_session, (results)=>{  
    return res.json(results);
  });
});

//VALIDATE FREEQUENCY RULES
router.post('/validateFrequencyRule/:rulesID', (req, res, next) => {
  
  data = req.body;
  rule = data.rule;
  actions = data.actions;
  actionOcurrance ={};
  actionOcurrance['rule']= [];
  var rulesValidated={};
  var pointMessage = {};
  rulesValidated["points"]=[];
  rulesValidated["options"]=[];
  rulesValidated["message"]=[];
  rulesValidated['ruleName'] = rule[0].name;
  rulesValidated['type'] = 'Frequency';
  var actionMessage = '';
  var groupMessage ='';
  var startTimeOk='';
 
  //add the very first action
  var action = {};
  action["id"] = actions[0].id;
  action["start"] =actions[0].time_action;
  action["content"] = actions[0].action_desc;
  action["group"]=actions[0].id_object
  actionOcurrance['rule'].push(action);

  for (var i = 0; i < actions.length; i++) {
    var action = {};

    if (actions[i].action_desc != null && actions[i].action_desc == rule[0].first_action){
      action["id"] = actions[i].id;
      action["start"] =actions[i].time_action;
      action["content"] = actions[i].action_desc;
      action["group"]=actions[i].id_object
      actionOcurrance['rule'].push(action);
    }
  }

  //add the very last action

  var action = {};
  console.log('About to add thelast');
  console.log(actions[actions.length -1].id);
  action["id"] = actions[actions.length-1].id;
  action["start"] =actions[actions.length-1].time_action;
  action["content"] = actions[actions.length-1].action_desc;
  action["group"]=actions[actions.length-1].id_object
  actionOcurrance['rule'].push(action);
  

  coincidences = actionOcurrance['rule'];

  console.log('Size of coincidences: ', coincidences.length);
  var flag = true;
  //var point = {};
  //rulesValidated["points"].push(point);

  for (var i = 0; i < (coincidences.length-1); i++){
    //console.log('The action was identified in different ocations: ',coincidences[i].id); 
    //COMPARE IF DATES ARE ACCORDING TO THE RULE

    timeA = (new Date(coincidences[i].start)).getTime() / 1000;
    timeB = (new Date(coincidences[i+1].start)).getTime() / 1000;
    var difSeconds = timeB-timeA;


    if(difSeconds > (parseInt(rule[0].value_of_mag) * 60)){
      console.log('One of the actions took more than expected: ', difSeconds);
      flag=false;
      var point = {};
      point["start"] = coincidences[i].start;
      point["end"] = coincidences[i+1].start;
      point["type"] = 'background';
      //point["id"]=rule[0].id;
      point["id"]=Math.random();
      //point["content"] = 'This was not performed within proper time';
      point["className"] = 'negative'; 
      point["group"] = coincidences[i].group; 
      actionMessage = coincidences[i].id;
      groupMessage = coincidences[i].group;
      startTimeWrong=coincidences[i].start;
      rulesValidated["points"].push(point);
    }else{
      console.log('Well done, action performed in the right time', difSeconds);
      var point = {};
      point["start"] = coincidences[i].start;
      point["end"] = coincidences[i+1].start;
      point["type"] = 'background';
      //point["content"] = 'Well done!!';
      point["className"] = 'vis-time-response'; 
      point["id"] = coincidences[i].id;
      point["group"] = coincidences[i].group; 
      actionMessage = coincidences[i].id;
      groupMessage = coincidences[i].group;
      rulesValidated["points"].push(point);
      startTimeOk=coincidences[i].start;
    }
    
  }

  if (flag == true){
    rulesValidated['status'] = 'ok';
    console.log('TRUE the team did well');
    rulesValidated["title"] = actions[0].session_name + " - "+ rule[0].name +' <br>'+ '<span style="color:blue">' +rule[0].feedback_ok + '</span>';
    pointMessage['type'] = 'box';
    pointMessage['id'] = Math.random();
    pointMessage["className"] = 'feedbackok';
    pointMessage["content"] = 'Well done! The actions frequency was correct';
    pointMessage['group'] = groupMessage;
    pointMessage['start'] = startTimeOk;
    rulesValidated["message"].push(pointMessage);
  }else{
    console.log('FALSE the team failed');
    rulesValidated['status'] = 'wrong';
    rulesValidated["title"] = actions[0].session_name + " - "+'<br>'+ '<span style="color:orange">'+ rule[0].feedback_wrong + '</span>';
    pointMessage['type'] = 'box';
    pointMessage['id'] = Math.random();
    pointMessage["className"] = 'feedbackwrong';
    pointMessage["content"] = 'Something went wrong with the frequency';
    pointMessage['group'] = groupMessage;
    pointMessage['start'] = startTimeWrong;
    rulesValidated["message"].push(pointMessage);
  }


  var options = {};
  options ['start']=actions[0].time_action; 
  options ['end']=actions[actions.length-1].time_action;
  options ['editable']=false;
  //options ['autoResize'] = false;
  options ['moveable'] = false; 
  rulesValidated["options"].push(options);  
  console.log('Rules Validated @@@@@: ',rulesValidated);
  return res.json(rulesValidated);
});

//VALIDATE SEQUENCY RULES
router.post('/validateRule/:rulesID', (req, res, next) => {
  data = req.body;
  actions = data.actions;
  rule = data.rule;
  rulesValidated={};
  rulesValidated["points"]=[];
  rulesValidated["options"]=[];
  rulesValidated["message"]=[];
  //rulesValidated["feedback"]=[];
  rulesValidated["title"] = actions[0].session_name + " - "+ rule[0].name;
  rulesValidated['ruleName'] = rule[0].name;
  var pointMessage = {};
  positionActionA=0;
  positionActionB=0;

  start='';

  find = false;
  find2=false;
  console.log(rule[0].magnitude, 'AQUI MAGNITUD');

  if(rule[0].magnitude == 'Proximity'){
    console.log('HELLO I AM A PROXIMITY RULE');
    rulesValidated["title"]='<span style="color:orange">' +rule[0].feedback_wrong +'</span>';
    rulesValidated["status"]='reflect';
  }
  else{
    var point = {};
    for (var i = 0; i < actions.length; i++) {
      console.log('The second action selected: ', rule[0].second_action, actions[i].action_desc);
      //VALITATION OF SEQUENCE RULES

      if(rule[0].magnitude =='Sequence' || rule[0].magnitude =='Time'){
         // 2 is before 1 is after
        //if(rule[0].value_of_mag =='After'){
          if (actions[i].action_desc != null && actions[i].action_desc == rule[0].second_action){
            console.log('Si  entro');
            find=true;
            //point["id"] = actions[i].id;
            point["id"] = Math.random();
            point["content"] = 'Description: '+actions[i].action_desc;
            point["start"] = actions[i].time_action;
            point["type"] = 'box';
            point["group"] = actions[i].id_object;
            point["className"] = 'magenta';
            actionMessage=actions[i].id;
            groupMessage=actions[i].id_object;
            start=actions[i].time_action;
            positionActionA=i;
          }  
      } 
    }
    if(find==true){
      rulesValidated["points"].push(point);
    }

    //Find second action
    var point = {};
    for (var i = 0; i < actions.length; i++) {

      //console.log(rule[0].second_action, actions[i].action_desc);
      console.log('The first action selected: ', rule[0].first_action, actions[i].action_desc);

      //VALITATION OF SEQUENCE RULES

      if(rule[0].magnitude =='Sequence' || rule[0].magnitude =='Time'){ 
          if (actions[i].action_desc != null && actions[i].action_desc == rule[0].first_action){
            console.log('Si  entro second validation');
            find2=true;
            //point["id"] = actions[i].id;
            point["id"] = Math.random();
            point["content"] = 'Perform this actions is important: '+actions[i].action_desc;
            point["start"] = actions[i].time_action;
            point["className"] = 'magenta';
            point["group"] = actions[i].id_object;
            point["type"] = 'box';
            actionMessage=actions[i].id;
            groupMessage=actions[i].id_object;
            end=actions[i].time_action;
            //rulesValidated["points"].push(point);
            positionActionB=i;
          }
      } 
    }
    if(find2==true){
      rulesValidated["points"].push(point);
    }

        //We need to validate if non of the actions happend
    var point = {};
    console.log('validating rules, find or not: ', find, find2);
    pointMessage['type'] = 'box';
    pointMessage['id'] = Math.random();
    pointMessage['group'] = groupMessage;

    
    point["id"] = Math.random();
    console.log('ACTION 1: ', positionActionA, ' ACTION 2: ', positionActionB)

    if(find == true && find2==true){
      if(rule[0].magnitude =='Time'){
        point["start"] = start;
        point["end"] = end;
        point["type"] = 'background';
        pointMessage['start'] = end;

        start_time = (new Date(start)).getTime() / 1000;
        end_time = (new Date(end)).getTime() / 1000;
        console.log('date fist and second action: ',start_time, end_time);
        negative=false;
        if (start_time > end_time ){
          console.log('The diference will be negative');
          negative =true;
        }
        var difSeconds= end_time-start_time;
        
        if((difSeconds > (parseInt(rule[0].value_of_mag) * 60 ))|| (negative==true)){
          if(negative==true){
            point["start"] = end;
            point["end"] = start;
            pointMessage["content"] = 'The action was detected before the critical incident. Next time consider the order of the actions.';
          }else{
            pointMessage["content"] = 'The team reacted slow';
          }
          rulesValidated["title"] = '<span style="color:orange">' +rule[0].feedback_wrong +  ' Time response: '+parseFloat(difSeconds/60).toFixed(2) +'</span>';
          point["className"] = 'negative';
          rulesValidated['status'] = 'wrong';
          pointMessage["className"] = 'feedbackwrong';
          
        }else{
          rulesValidated["title"] ='<span style="color:blue">'+rule[0].feedback_ok + ' Time response: '+parseFloat(difSeconds/60).toFixed(2)+'</span>';
          point["className"] = 'vis-time-response';  
          rulesValidated['status'] = 'ok';
          pointMessage["className"] = 'feedbackok';
          pointMessage["content"] = 'The team reacted timely';
        }
      }else{
        //point["content"] =  rule[0].feedback_ok;
        //VALIDATING IF ACTION 1 HAPPENDS FIRST
        if (positionActionA < positionActionB){
          rulesValidated["title"] = '<span style="color:blue">'+rule[0].feedback_ok +'</span>';
          point["className"] = 'vis-time-response';  
          rulesValidated['status'] = 'ok';
          point["start"] = start;
          point["end"] = end;
          point["type"] = 'background';
          pointMessage["className"] = 'feedbackok';
          pointMessage['start'] = end;
          pointMessage["content"] = 'Well done the team perform this critical action';  
        }else{
          rulesValidated["title"] = '<span style="color:orange">'+ rule[0].feedback_wrong + "</span>" +'. Next time consider the order of the actions';
          point["className"] = 'negative';  
          rulesValidated['status'] = 'wrong';
          point["start"] = end;
          point["end"] = start;
          point["type"] = 'background';
          pointMessage["className"] = 'feedbackwrong';
          pointMessage['start'] = end;
          pointMessage["content"] = rule[0].feedback_wrong +'. Next time consider the order of the actions.';        
        }
      }
    } else if(find == true && find2==false){
      //point["content"] = rule[0].feedback_wrong;
      pointMessage["className"] = 'feedbackwrong';
      pointMessage["content"] = 'The team missed an action';
      pointMessage['start'] = start;

      rulesValidated["title"] = '<span style="color:orange">'+ rule[0].feedback_wrong + "</span>";
      point["start"] = start;
      point["type"] = 'background';
      point["end"] = actions[actions.length-1].time_action;
      //point["style"] = "color: red; background-color: pink;";
      point["className"] = 'negative';
      rulesValidated['status'] = 'wrong';
    }else if(find == false && find2==true){
      pointMessage["className"] = 'feedbackwrong';
      pointMessage["content"] = 'The team missed an action';
      pointMessage['start'] = end;
      //point["content"] = rule[0].feedback_wrong;
      //classMessage["className"] = 'feedbackwrong';
      //contentMessage["content"] = 'The team missed an action';
      rulesValidated["title"] = '<span style="color:orange">'+ rule[0].feedback_wrong+ "</span>";
      point["end"] = end;
      point["start"] = actions[0].time_action; 
      point["type"] = 'background';
      //point["style"] = "color: red; background-color: pink;";
      point["className"] = 'negative';
      rulesValidated['status'] = 'wrong';
    }
    else if(find == false && find2==false){
      pointMessage["className"] = 'feedbackwrong';
      pointMessage["content"] = 'The team missed critical actions';
      pointMessage['start'] = actions[actions.length].time_action;
      //point["content"] = rule[0].feedback_wrong;
      //classMessage["className"] = 'feedbackwrong';
      //contentMessage["content"] = 'The team missed an action';
      rulesValidated["title"] = '<span style="color:orange">'+rule[0].feedback_wrong + "</span>";
      point["end"] = actions[actions.length].time_action;
      point["start"] = actions[0].time_action; 
      point["type"] = 'background';
      //point["style"] = "color: red; background-color: pink;";
      point["className"] = 'negative';
      rulesValidated["status"] = 'wrong';
    }
    rulesValidated["points"].push(point);
    //create an additional point with type box, to plot an additional message

    console.log('This is the last point of the array ####: ',  rulesValidated["points"]);

  }
  
  var options = {};
  options ['start']=actions[0].time_action; 
  options ['end']=actions[actions.length-1].time_action;
  options ['editable']=false;
  //options ['autoResize'] = false;
  options ['moveable'] = false; 
  rulesValidated["options"].push(options);

  rulesValidated['message'].push(pointMessage);  
  
  //console.log('Rules Validated @@@@@: ',rulesValidated);
  return res.json(rulesValidated);
});


//update type of rule
//TO DO
router.post('/updatetypeRules', (req, res, next) => {
  var results = [];
  const dtobj_string = [req.body.newname, req.body.id_objsession];
  
  con.query('UPDATE object_session SET name = ? WHERE id = ?', dtobj_string, (err, result) => {
  if(err) throw err;
  console.log(`Changed ${result.changedRows} row(s)`);
  
  con.query('SELECT * from object_session WHERE id_session = ? ORDER BY id ASC', [req.body.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    return res.json(results);
    });
  
    //return res.json(JSON.parse(results));
  });
  }); //end function

//ADD NEW RULE
router.post('/addRule', (req, res, next) => {
  var results = [];
  var rule_string = {name:req.body.name, type: req.body.typeRule, id_session: req.body.sessionid, id_first_act: req.body.firstAction, id_second_act: req.body.secondAction, magnitude: req.body.magnitude, value_of_mag: req.body.value, feedback_ok: req.body.feedbackCorrect, feedback_wrong: req.body.feedbackWrong};  
  con.query('INSERT INTO rules SET ?', rule_string, (err, result) => {
  if(err) throw err;

  con.query('SELECT * FROM rules WHERE id_session = ? ORDER BY id ASC;', [req.body.sessionid], (err, rows)=>{
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
        //console.log(`${row.name} , ${row.magnitude}`);
      });
      return res.json(results);
  });
  });
}); //end function

//DELETE RULE
router.post('/delete', (req, res, next) => {
  const results = [];
  
  con.query('DELETE FROM rules WHERE rules.id= ?', [req.body.id_rule], (err, rows)=>{
  if(err) throw err;

    con.query('SELECT * FROM rules WHERE id_session = ? ORDER BY id ASC;', [req.body.id_session], (err, rows)=>{
        if(err) throw err;
        rows.forEach( (row) => {
          results.push(row);
          console.log(`${row.name} , ${row.magnitude}`);
        });
        return res.json(results);
    });
  });
});

module.exports = router;
module.exports.getRoles = roles;
