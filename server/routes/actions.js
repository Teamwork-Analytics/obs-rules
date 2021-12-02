const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');

const mqtt = require('mqtt');
const url = require('url');
var fs = require('fs');

const con = require('../helpers/database');

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

//insert new actions
router.post('/newaction', (req, res, next) => {
  var results = [];
    var action_string = {name: req.body.newactionname, action_type:req.body.newactiontype};
  //}
  
  con.query('INSERT INTO actions SET ?', action_string, (err, result) => {
  if(err) throw err;
    console.log(`Inserted ${result.affectedRows} row(s)`);
    const query_string2 = 'SELECT * FROM actions WHERE action_type = "event" OR action_type = "critical" ORDER BY name ASC;';
    con.query(query_string2,[req.body.id_session], (err,rows) => {
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
      });
      return res.json(results);
    });
  });
});
//get all sessions
router.get('/all', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM actions WHERE action_type = "event" OR action_type = "critical" ORDER BY name ASC;', (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//get all actions sessions
router.post('/allactionssession', (req, res, next) => {
  const results = [];
    const query_string = 'SELECT action_session.id, action_session.id_action, action_session.action_desc, actions.action_type FROM action_session, actions WHERE action_session.id_action=actions.id AND (actions.action_type = "event" OR actions.action_type = "critical") AND action_session.id_session = ? order by action_session.action_desc ASC;';
    con.query(query_string,[req.body.id_session], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//get all actions with objects associated - left join
router.post('/allactionswithobjects', (req, res, next) => {
  const results = [];
    const query_string = 'SELECT actions.id, actions.name, actions.action_type, action_session.id_object, action_session.time_action FROM actions left join action_session on (actions.id=action_session.id_action) and action_session.id_session = ? order by actions.name ASC;';
    con.query(query_string,[req.body.id_session], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//get actions with objects associated
router.post('/actionswithobjects', (req, res, next) => {
  const results = [];
    const query_string = 'SELECT actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id WHERE action_session_object.id_session = ? ORDER BY action_session_object.id DESC;';
    con.query(query_string,[req.body.id_session], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//update action session object with notes
// added 25-04-2019
router.post('/updatenotes', (req, res, next) => {
  const results = [];
    con.query('UPDATE action_session_object set notes = ? WHERE action_session_object.id = ?',[req.body.notes, req.body.id_actionsessionobject], (err,rows) => {
    if(err) throw err;
    console.log(`Changed ${rows.changedRows} row(s)`);
    return res.json(rows.changedRows);
  });
});

//get note by id
// added 25-04-2019
router.post('/getnotebyid', (req, res, next) => {
  const results = [];
    const query_string = 'SELECT action_session_object.notes FROM action_session_object WHERE action_session_object.id = ? ;'
    con.query(query_string,[req.body.id_actionsessionobject], (err,rows) => {
    if(err) throw err;
     rows.forEach( (row) => {
      results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results[0]);
  });
});

//insert object in session
router.post('/insertactionsession', (req, res, next) => {
  var results = [];
  //if(req.body.desc == 'Lose Conciousness' || req.body.desc == 'Ask for help'){
   // var action_string = {id_session: req.body.id_session, id_action: req.body.id_action, param_value: 'alert', action_desc: req.body.desc, time_action: new Date()};
  //}
  //else{
    var action_string = {id_session: req.body.id_session, id_action: req.body.id_action, id_object: req.body.id_object, action_desc: req.body.desc, time_action: new Date()};
  //}
  
  con.query('INSERT INTO action_session SET ?', action_string, (err, result) => {
  if(err) throw err;
    console.log(`Inserted ${result.affectedRows} row(s)`);
    const query_string2 = 'SELECT action_session.id, action_session.action_desc, action_session.id_object, action_session.time_action, object_session.name FROM action_session, object_session where action_session.id_object=object_session.id and action_session.id_session=object_session.id_session and action_session.id_session = ? order by action_session.id DESC;';
    con.query(query_string2,[req.body.id_session], (err,rows) => {
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
      });
      return res.json(results);
    });
  });
});

//add object in action - session
//new table created to allow multiplicity
//added 25-04-2019
router.post('/addactionsectionobject', (req, res, next) => {
  var results = [];
  var action_string = {id_session:req.body.id_session, id_actionsession: req.body.id_actionsession, id_action: req.body.id_action, action_desc: req.body.desc, id_object: req.body.id_object, time_action: new Date()};
  con.query('INSERT INTO action_session_object SET ?', action_string, (err, result) => {
  
  if(err) throw err;
    console.log(`inserted ${result.affectedRows} row(s)`);
   
    const query_string2 = 'SELECT actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id WHERE action_session_object.id_session = ? ORDER BY action_session_object.id DESC;';
   
    con.query(query_string2,[req.body.id_session], (err,rows) => {
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
      });
      return res.json(results);
    });
  });
});

//add object in action - session
//new table created to allow multiplicity
//added 26-04-2019
router.post('/addstartstopaction', (req, res, next) => {
  var results = [];
  var error='';
  var action_string = {id_session:req.body.id_session, id_action: req.body.id_action, action_desc: req.body.desc, time_action: new Date()};

  console.log('Here it is??? ', action_string);
  try{
    con.query('INSERT INTO action_session_object SET ?', action_string, (err, result) => {
      if(err){
        error='Error in action.js: '+ err;
        return res.json({'error':error});
      } 
      console.log(`inserted ${result.affectedRows} row(s)`);
       
      const query_string2 = 'SELECT actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id WHERE action_session_object.id_session = ? ORDER BY action_session_object.id DESC;';
       
      con.query(query_string2,[req.body.id_session], (err,rows) => {
        if(err){
          error='Error in action.js: '+ err;
          return res.json({'error':error});
        } 
        rows.forEach( (row) => {
          results.push(row);
        });
        return res.json({'results':  results, 'error':error});
      });
    });
  }
  catch{
    var  error=1;
    return res.json(results);
  }
});


//get all actions sessions
router.post('/allactionsinDB', (req, res, next) => {
  const results = [];
    const query_string = 'SELECT actions.id, actions.name, actions.action_type order by actions.name ASC;';
    con.query(query_string,[req.body.id_session], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//verify if selected actions is in session
//added 24-04-2019
router.post('/actionsessionexists', (req, res, next) => {
  const results = [];
  //const exists = 1;
    const query_string = 'SELECT * FROM action_session where action_session.id_action = ? and action_session.id_session = ?;';
    con.query(query_string,[req.body.id_action, req.body.id_session], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    //console.log(results);
    if(results.length > 0)  return res.json(1);
    else  return res.json(0);
  });
});
//insert selected action in session
//added 24-04-2019
router.post('/addactiontothissession', (req, res, next) => {
  var results = [];
  
  var action_string = {id_session: req.body.id_session, id_action: req.body.id_action, action_desc: req.body.action_name};
  
  con.query('INSERT INTO action_session SET ?', action_string, (err, result) => {
  if(err) throw err;
    console.log(`Inserted ${result.affectedRows} row(s)`);
    const query_string2 = 'SELECT action_session.id, action_session.id_action, action_session.action_desc, actions.action_type FROM action_session, actions WHERE action_session.id_action=actions.id AND (actions.action_type = "event" OR actions.action_type = "critical") AND action_session.id_session = ? order by action_session.action_desc ASC;';
    con.query(query_string2,[req.body.id_session], (err,rows) => {
      if(err) throw err;
      rows.forEach( (row) => {
        results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
      });
      return res.json(results);
    });
  });
});


//delete actions with objects associated
//added 24-04-2019
router.post('/deleteactionsession', (req, res, next) => {
    const results = [];
    
    const query_string1 = 'DELETE FROM action_session WHERE action_session.id = ?'
    con.query(query_string1, 
    [req.body.id_actionsession], (err, result) => {
      if(err) throw err;
      console.log(`Deleted ${result.affectedRows} row(s)`);

      const query_string2 = 'SELECT action_session.id, action_session.id_action, action_session.action_desc, actions.action_type FROM action_session, actions WHERE action_session.id_action=actions.id AND (actions.action_type = "event" OR actions.action_type = "critical") AND action_session.id_session = ? order by action_session.action_desc ASC;';
        con.query(query_string2,[req.body.id_session], (err,rows) => {
        if(err) throw err;

            rows.forEach( (row) => {
            results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
            });
        return res.json(results);
        });
     });
});
//insert action per object in session
router.post('/addactionobject', (req, res, next) => {
  const results = [];

  con.query('SELECT count(*) as total from action_session WHERE id_session = ? AND id_action = ? ORDER BY id ASC', 
    [req.body.id_session,req.body.id_action], (err, result) => {
  if(err) throw err;

    console.log("Total Records:- " + result[0].total);

    if(result[0].total == 0){
      const action_string = {id_session: req.body.id_session, id_action: req.body.id_action, action_desc: req.body.desc, time_action: new Date()};
      con.query('INSERT INTO action_session SET ?', action_string, (err, res1) => {
      if(err) throw err;
      //console.log(`Changed ${res1.changedRows} row(s)`);
      });
    }
      
        const obj_string = [req.body.id_object,req.body.id_session,req.body.id_action];
        //console.log(obj_string);
        con.query('UPDATE action_session SET id_object = ? WHERE id_session = ? AND id_action = ?', obj_string, (err, result) => {
        if(err) throw err;
        console.log(`Changed ${result.deletedRows} row(s)`);
        });

        const query_string = 'SELECT actions.id, actions.name, actions.action_type, action_session.id_object, action_session.time_action FROM actions left join action_session on (actions.id=action_session.id_action) and action_session.id_session = ?';
        con.query(query_string, [req.body.id_session], (err, rows) => {
        if(err) throw err;

        rows.forEach( (row) => {
          results.push(row);
          //console.log(`${row.id_session} , ${row.id_datatype}`);
          });
          return res.json(results);
        });
  });

  
  
    //return res.json(JSON.parse(results));
});

//get actions in session
router.get('/getactionobjects/:id_session', (req, res, next) => {
  const results = [];
  con.query('SELECT * from action_session WHERE id_session = ? ORDER BY id ASC', [req.params.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    return res.json(results);
  });
  
    //return res.json(JSON.parse(results));
});

//delete actions
//added 01-05-2019
router.post('/deleteaction', (req, res, next) => {
  const results = [];
  var error='';
  try{
    const query_string1 = 'DELETE FROM actions WHERE actions.id = ?'
    con.query(query_string1, 
    [req.body.id_action], (err, result) => {
      if(err){
        //throw err;
        error='Error deleting an actions.js: '+err;
        return res.json({'error':error});
      } 
      console.log(`Deleted ${result.affectedRows} row(s)`);

      const query_string2 = 'SELECT * FROM actions WHERE action_type = "event" OR action_type = "critical" ORDER BY name ASC;';
        con.query(query_string2,[req.body.id_session], (err,rows) => {
        if(err){
          error='Error selecting in actions.js: '+ err;
          return res.json({'error':error});
        } 

        rows.forEach( (row) => {
          results.push(row);
        });
        return res.json({'results':results, 'error':error});
        });
     });
  }
  catch{
    return res.json({'error':'An error occured in action.js /deleteaction'});
  }    
});

//delete actions sessions with objects associated
//added 25-04-2019
router.post('/deleteactionobject', (req, res, next) => {
    const results = [];
    
    const query_string1 = 'DELETE FROM action_session_object WHERE action_session_object.id = ?'
    con.query(query_string1, 
    [req.body.id_actionsessionobject], (err, result) => {
      if(err) throw err;
      console.log(`Deleted ${result.affectedRows} row(s)`);

      const query_string2 = 'SELECT actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id WHERE action_session_object.id_session = ? ORDER BY action_session_object.id DESC;';
        con.query(query_string2,[req.body.id_session], (err,rows) => {
        if(err) throw err;

            rows.forEach( (row) => {
            results.push(row);
            //console.log(`${row.name} started at ${row.time_start}`);
            });
        return res.json(results);
        });
     });
});

// //start listening pozyx tags location in session
// router.post('/startActionsCapture', (req, res, next) => {
//       var location_string = {};
//       const results = [];
//       con.connect(function(err){});
//       console.log('start capture');
//       mqtt_client = mqtt.connect(mqtt_url);
//       // // Create a client connection
//       mqtt_client.on('connect', function() { // When connected
//         console.log("mqtt client connected");
//         mqtt_client.subscribe('topic/manikin', function() {
//           // when a message arrives, send it out to the websockets
//           mqtt_client.on('message', function(topic, message, packet) {
//               var messageJson = JSON.parse(message);
//               console.log("Received '" + message + "' on '" + topic + "'");
//               //console.log(Date.parse(messageJson.actionTime));
//               if(messageJson.actionName == "Session started"){
//                 con.query('select * from action_session where id_session =  ? and id_action = ?', [req.body.id_session,8], (err, res1) => {
//                 if(err) throw err;
//                   if(res1.length < 1){
                    
//                     const action_string = {id_session: req.body.id_session, id_action: messageJson.id, action_desc: messageJson.actionName, time_action: new Date()};
//                     console.log(action_string);
//                     con.query('INSERT INTO action_session SET ?', action_string, (err, result) => {
//                     if(err) throw err;
//                     console.log(`Inserted ${result.affectedRows} row(s)`);
//                     return res.json(JSON.parse('{"msg":"`Inserted ${result.affectedRows} row(s)`"}'));
//                     });
//                   }
//                   else{
//                     console.log('Ya esta en la bd');
//                     return res.json(JSON.parse('{"msg":"Nothing inserted"}'));
//                   }
//                 });

                
//               }//end if
// /*
//               else{
//                 //parse each line coming from manikin
//                 const action_string = {id_tag: messageJson.id, x: messageJson.x, y: messageJson.y, timestamp: new Date(messageJson.timestamp*1000), acc: messageJson.acc, id_session:req.body.id_session};
//                 con.query('INSERT INTO location_data_session SET ?', location_string, (err, res1) => {
//                 if(err) throw err;
//                 });
//               }*/
              
//               //console.log(location_string);
//             // Get mysql client from the connection pool
              
//           }); // end mqtt_client.on message
//         });//subscribe to tag

//       }); //end mqtt_client_connect

// });


// router.post('/stopActionsCapture', (req, res, next) => { 
//     var endmessage = "";
//     mqtt_client.unsubscribe('topic/manikin', function() {
//       console.log('mqtt client unsubscribed');
//       endmessage = '{"msg":"disconnected from topic: topic/manikin"}';
//     });
//     mqtt_client.end();
    
//     const action_string = {id_session: req.body.id_session, id_action: 9, action_desc: "Session ended", time_action: new Date()};
//     con.query('INSERT INTO action_session SET ?', action_string, (err, result) => {
//                     if(err) throw err;
//                     console.log(`Inserted ${result.affectedRows} row(s)`);
//                     return res.json(JSON.parse('{"msg":"`Inserted ${result.affectedRows} row(s)`"}'));
//      });
// });

// //test actions from manikin

// //start listening pozyx tags location in session
// router.post('/teststartActionsCapture', (req, res, next) => {
//       var location_string = {};
//       var actionType = "";
//       var results = [];
//       var end = "";
//       con.connect(function(err){});
//       const msgJson1 ='{"DebriefComment":null,"LogItem":{"Item":{"EventValue":null,"EventId":"Laerdal.Event.Attach pulse oximeter2","Lang":null,"Alias":null,"Role":"","Reporter":"InstructorApplication.exe✂nmhwlb100760029✂5656","NotInScenario":false,"NotInScenarioSpecified":false,"NumericGrade":0,"NumericGradeSpecified":false,"StringGrade":null},"ItemElementName":3},"OriginalLogElement":null,"Id":7,"When_msec":32000,"Timestamp":0,"TimestampSpecified":false,"EditStatus":0,"Level":1}';
//       const msgJson2 = '{"DebriefComment":null,"LogItem":{"Item":{"ParameterValue":[{"ParamId":"Laerdal.Response.Convulsions.Type5","ParamValue":"CLONIC","NumericGrade":0,"NumericGradeSpecified":false,"StringGrade":null}],"Reporter":"InstructorApplication.exe✂nmhwlb100760029✂5656"},"ItemElementName":8},"OriginalLogElement":null,"Id":11,"When_msec":81400,"Timestamp":0,"TimestampSpecified":false,"EditStatus":0,"Level":3}';
//       const msgJson3 = '{"DebriefComment":null,"LogItem":{"Item":{"ParameterValue":[{"ParamId":"Laerdal.Response.Ecg.HeartRate_bpm","ParamValue":"170","NumericGrade":0,"NumericGradeSpecified":false,"StringGrade":null}],"Reporter":"InstructorApplication.exe✂nmhwlb100760029✂5656"},"ItemElementName":8},"OriginalLogElement":null,"Id":16,"When_msec":198000,"Timestamp":0,"TimestampSpecified":false,"EditStatus":0,"Level":3}';
//       var msg = JSON.parse(msgJson3);

//       for(var key in msg.LogItem.Item ){
//         //console.log(key);
//         if (key == "ParameterValue" ) {actionType = "response";break;}
//         else if (key == "EventValue" ) {actionType = "event";break;}
//         else {actionType = "none";}
//       }

//       if (actionType == "response"){

//           var mseconds = msg.When_msec;
//           var actionName = msg.LogItem.Item.ParameterValue[0].ParamId.split(".").slice(-2).join(" ");
//           var param_value = msg.LogItem.Item.ParameterValue[0].ParamValue;
      
//       } //end response
      
//       if (actionType == "event"){

//           var mseconds = msg.When_msec;
//           var actionName = msg.LogItem.Item.EventId.split(".").slice(-1).join(" ");
      
//       } //end event

//       //check if the action exists in the table
//       var checkAction = false;
//       var idAction = 0;
//       const query_string = 'SELECT * FROM actions WHERE name = ?;';
//       con.query(query_string,[actionName], (err,rows) => {
//         if(err) throw err;
//           rows.forEach( (row) => {
//           results.push(row);
//           });

//         if(results.length == 0){
//             //insert action
//             //results = [];
//             console.log("Hola");
//             const query_string2 = {name: actionName, action_type:actionType};
//             con.query('INSERT INTO actions SET ?', query_string2, (err, result) => {
//             if(err) throw err;
//             //con.pause();
//             idAction =  result.insertId;
//             console.log(`Inserted ${result.affectedRows} row(s)`);
            
//               const query_string4 = {id_session:req.body.id_session, id_action:idAction, action_desc:actionName, param_value:param_value, mseconds:mseconds};
//               con.query('INSERT INTO action_session SET ?', query_string4, (err, result) => {
//               if(err) throw err;
//               console.log(`Inserted ${result.affectedRows} row(s)`);
              
//               end = '{"msg":"done!"}';
//               return res.json(JSON.parse(end));
//               });//end query4

//             });//end query2
//           } //end if checkAction

//           else{
//             //console.log(results);
//             idAction = results[0].id;
//             const query_string4 = {id_session:req.body.id_session, id_action:idAction, action_desc:actionName, param_value:param_value, mseconds:mseconds};
//             con.query('INSERT INTO action_session SET ?', query_string4, (err, result) => {
//             if(err) throw err;
//             console.log(`Inserted ${result.affectedRows} row(s)`);
//             end = '{"msg":"done!"}';
//             return res.json(JSON.parse(end));
//             });//end query4
//           }
//           });//end query1



//         });

module.exports = router;
