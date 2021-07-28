const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
//const moment = require('moment');
//const {jsPDF} = require("jspdf"); // will automatically load the node version


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

//const database='AllUTSsessions';
const database='MonashAugustDataCollection';
//const database='group_analytics1';
//const database='MonashInterviews';


const con = mysql.createConnection({
  host: 'localhost',
  user: 'gloria',
  password: 'Sj&7u#THDXWihfAy37KqyAu6hmGkLT',
  database: database
});


function createHtml(obj){
	console.log('Yes I am in the creationHtml function');

}

function createPDF(){

}

module.exports = router;