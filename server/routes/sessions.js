const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@138.25.199.243:5432/group-analytics';
//var promise = require('bluebird');

const con = require('../helpers/database');

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

//get all sessions
router.get('/all', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM session ORDER BY id ASC;', (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//create session
router.post('/create', (req, res, next) => {
  var results = '';
  // Grab data from http request
  //const data = {text: req.body.text, complete: false};
  
  var today = new Date();
  var session_d = today.toJSON().slice(0,10).split("-");
  var conversion_utcdate = Date.UTC(session_d[0],session_d[1],session_d[2]);
  var today_utc = today.toJSON().slice(0,10);
  
  const session_string = { name: req.body.name, room: req.body.room, session_date: today_utc, time_start: today};
  console.log(session_string);
  
  // Get mysql client from the connection pool
  con.query('INSERT INTO session SET ?', session_string, (err, res1) => {
  if(err) throw err;

  console.log('Last insert ID:', res1.insertId);
  results = '{"id":"'+res1.insertId+'"}'

  return res.json(JSON.parse(results));
  });


});

//create session
router.post('/stop', (req, res, next) => {
  var results = "";
  

  const session_string = [ new Date(), req.body.id_session];
  console.log(session_string);
  
  // Get mysql client from the connection pool
  con.query('UPDATE session SET time_end = ? WHERE id = ?', session_string, (err, res1) => {
  if(err) throw err;

  console.log(`Changed ${res1.changedRows} row(s)`);
  results = '{"msg": "Changed' + res1.changedRows + 'row(s)" }';

  return res.json(JSON.parse(results));

  });

});



router.delete('/delete:session_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.session_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM session WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM session ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
