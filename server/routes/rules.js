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

const con = mysql.createConnection({
  host: 'localhost',
  user: 'gloria',
  password: 'Sj&7u#THDXWihfAy37KqyAu6hmGkLT',
  database: 'group_analytics1'
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

//get types of rules
router.get('/types', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM rules_obs;', (err,rows) => {
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

    con.query('SELECT * FROM object_session WHERE id_session = ? ORDER BY id ASC;', [id_session], (err,rows) => {
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

  start='';

  find = false;
  find2=false;
  console.log(rule[0].magnitude, 'AQUI MAGNITUD');
  //console.log(rule[0].second_action, 'AQUI');
  //&& find != true && find2!=true
  for (var i = 0; i < actions.length && (find != true || find2!=true); i++) {
    var point = {};
    console.log(rule[0].second_action, actions[i].action_desc);
    console.log(rule[0].first_action, actions[i].action_desc);

    //VALITATION OF SEQUENCE RULES

    if(rule[0].magnitude =='Sequence' || rule[0].magnitude =='Time'){
       // 2 is before 1 is after
      //if(rule[0].value_of_mag =='After'){
        if (actions[i].action_desc != null && actions[i].action_desc == rule[0].second_action){
          console.log('Si  entro');
          find=true;
          //point["id"] = actions[i].id;
          point["id"] = actions[i].id;
          point["content"] = 'Description @@@ : '+actions[i].action_desc;
          point["start"] = actions[i].time_action+0.1;
          point["type"] = 'box';
          point["group"] = actions[i].id_object;
          point["className"] = 'magenta';
          actionMessage=actions[i].id;
          groupMessage=actions[i].id_object;
          start=actions[i].time_action;
          rulesValidated["points"].push(point);
        }  
        if (actions[i].action_desc != null && actions[i].action_desc == rule[0].first_action && find==true){
          console.log('Si  entro second validation');
          find2=true;
          point["id"] = actions[i].id;
          point["content"] = 'Perform this actions is important'+actions[i].action_desc;
          point["start"] = actions[i].time_action;
          point["className"] = 'magenta';
          point["group"] = actions[i].id_object;
          point["type"] = 'box';
          actionMessage=actions[i].id;
          groupMessage=actions[i].id_object;
          end=actions[i].time_action;
          rulesValidated["points"].push(point);
        }
    } 
  }
  var point = {};
  console.log('validating rules');
  console.log(find, find2);
  pointMessage['type'] = 'box';
  pointMessage['id'] = actionMessage;
  pointMessage['group'] = groupMessage;

  
  point["id"] = rule[0].id;
  if(find == true && find2==true){
    point["start"] = start;
    point["end"] = end;
    point["type"] = 'background';
    pointMessage["className"] = 'feedbackok';
    pointMessage['start'] = end;
    pointMessage["content"] = 'Well done the team perform this critical action';

    if(rule[0].magnitude =='Time'){
      start_time = (new Date(start)).getTime() / 1000;
      end_time = (new Date(end)).getTime() / 1000;
      var difSeconds= end_time-start_time;
      
      if( difSeconds > (parseInt(rule[0].value_of_mag) * 60)){
        rulesValidated["title"] = rule[0].feedback_wrong + '<span style="color:orange">' + ' Time response: '+parseFloat(difSeconds/60).toFixed(2) +'</span>';
        point["className"] = 'negative';  
        rulesValidated['status'] = 'wrong';
        pointMessage["className"] = 'feedbackwrong';
        pointMessage["content"] = 'The team reacted slow';
      }else{
        rulesValidated["title"] = rule[0].feedback_ok + '<span style="color:blue">'+ ' Time response: '+parseFloat(difSeconds/60).toFixed(2)+'</span>';
        point["className"] = 'vis-time-response';  
        rulesValidated['status'] = 'ok';
        pointMessage["className"] = 'feedbackok';
        pointMessage["content"] = 'The team reacted timely';
      }
    }else{
      //point["content"] =  rule[0].feedback_ok;
      rulesValidated["title"] = rule[0].feedback_ok;
      point["className"] = 'vis-time-response';  
      rulesValidated['status'] = 'ok';
    }
  } else if(find == true && find2==false){
    //point["content"] = rule[0].feedback_wrong;
    pointMessage["className"] = 'feedbackwrong';
    pointMessage["content"] = 'The team missed an action';

    rulesValidated["title"] = rule[0].feedback_wrong;
    point["start"] = start;
    point["type"] = 'background';
    point["end"] = actions[actions.length-1].time_action;
    //point["style"] = "color: red; background-color: pink;";
    point["className"] = 'negative';
    rulesValidated['status'] = 'wrong';
  }else if(find == false && find2==true){
    pointMessage["className"] = 'feedbackwrong';
    pointMessage["content"] = 'The team missed an action';
    //point["content"] = rule[0].feedback_wrong;
    classMessage["className"] = 'feedbackwrong';
    contentMessage["content"] = 'The team missed an action';
    rulesValidated["title"] = rule[0].feedback_wrong;
    point["end"] = end;
    point["start"] = actions[0].time_action; 
    point["type"] = 'background';
    //point["style"] = "color: red; background-color: pink;";
    point["className"] = 'negative';
    rulesValidated['status'] = 'wrong';
  }
  rulesValidated["points"].push(point);
  //create an additional point with type box, to plot an additional message

  console.log('This is the last point of the array ####: ',  rulesValidated["points"]);

  var options = {};
  options ['start']=actions[0].time_action; 
  options ['end']=actions[actions.length-1].time_action;
  options ['editable']=false;
  //options ['autoResize'] = false;
  options ['moveable'] = false; 
  rulesValidated["options"].push(options);
  if(rule[0].magnitude =='Proximity'){
    rulesValidated['title']=rule[0].feedback_wrong;
    rulesValidated['status']='reflect';
  }
  rulesValidated['message'].push(pointMessage);  
  
  console.log(rulesValidated);
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
        console.log(`${row.name} , ${row.magnitude}`);
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
