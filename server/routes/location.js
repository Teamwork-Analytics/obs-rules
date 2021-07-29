const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');

const mqtt = require('mqtt');
const url = require('url');

const TOPIC = '5af38a1033e8270502daa9a6';
const user = TOPIC;
const api_key = '2c8e1209-e6a5-464a-bc36-8308ad353ac1';


//const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'wss://mqtt.cloud.pozyxlabs.com:443');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wpancwwq:JM7WMMC9MqzM@m14.cloudmqtt.com:11474');
const auth = (mqtt_url.auth || ':').split(':');
var mqtt_client = mqtt.connect('wss://mqtt.cloud.pozyxlabs.com:443', {  
    username: user,
    password: api_key
});


const con = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_database
});

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

//start listening pozyx tags location in session
router.post('/startLocationCapture', (req, res, next) => {
      var location_string = {};
      const results = [];
      con.connect(function(err){});
      
      // // Create a client connection
      mqtt_client.on('connect', function() { // When connected
        console.log("mqtt client connected");
        mqtt_client.subscribe('TOPIC', function() {
          // when a message arrives, send it out to the websockets
          mqtt_client.on('message', function(topic, message, packet) {
              var messageJson = JSON.parse(message);
              //location_string = {id_tag: messageJson.id, x: messageJson.x, y: messageJson.y, timestamp: new Date(messageJson.timestamp*1000), acc: messageJson.acc, id_session:req.body.id_session};
              if(messageJson.success == true){
              location_string = {id_tag: messageJson.tagId, x: messageJson.data.coordinates.x, y: messageJson.data.coordinates.y, z: messageJson.data.coordinates.z, timestamp: new Date(messageJson.timestamp*1000), acc: messageJson.data.acceleration, id_session:req.body.id_session};
              console.log(location_string);
              }
              //console.log(location_string);
            // Get mysql client from the connection pool
              //con.query('INSERT INTO location_data_session SET ?', location_string, (err, res1) => {
              //if(err) throw err;
              //});
          }); // end mqtt_client.on message
        });//subscribe to tag

      }); //end mqtt_client_connect

});

router.post('/stopLocationCapture', (req, res, next) => {
  var results = [];
    mqtt_client.unsubscribe('tag', function() {
      results = '{"msg":"disconnected from topic: tag"}';

      return res.json(JSON.parse(results));
    });
    mqtt_client.end();
});
//insert pozyx tags location in session
router.post('/insertLocationTag', (req, res, next) => {
  var results = [];
  console.log(req.body);
  const location_string = {id_tag: req.body.id_tag, x: req.body.x, y: req.body.y, timestamp: req.body.timestamp, acc: req.body.acc, id_session:req.body.id_session};
  

  con.connect(function(err){});
  // Get mysql client from the connection pool
  con.query('INSERT INTO location_data_session SET ?', location_string, (err, res1) => {
  if(err) throw err;

  console.log('Last insert ID:', res1.insertId);
  results = '{"msg":"Last insert ID: '+res1.insertId+'"}';
  //con.end();
  return res.json(JSON.parse(results));
  });

});

module.exports = router;
