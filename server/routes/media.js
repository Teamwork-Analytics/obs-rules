const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');

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


router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

//get all datatypes
router.get('/all', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM datatype ORDER BY id ASC;', (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });

    return res.json(results);
  });

});

//insert source in session
router.post('/addsourceSession', (req, res, next) => {
  var results = [];


  const dtsession_string = {name: req.body.name, id_session: req.body.id_session, id_datatype: req.body.id_datatype, id_session_datatype: req.body.id_datatype_session};
  //console.log(dtsession_string);
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  con.query('INSERT INTO datatype_session SET ?', dtsession_string, (err, res1) => {
  if(err) throw err;
  });

  con.query('SELECT * from datatype_session WHERE id_session = ?', [req.body.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });

    return res.json(results);
  });
  
    //return res.json(JSON.parse(results));
});

//get all datatypes per session
router.get('/datasession/:session_id', (req, res, next) => {
  const results = [];

  const dtsession_string = [req.params.session_id];
  //console.log(dtsession_string);
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  con.query('SELECT * from datatype_session WHERE id_session = ?', dtsession_string, (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });

    return res.json(results);
  });

});

//get all objects per datatype and per session
router.post('/datasession', (req, res, next) => {
  const results = [];
  const dtsession_string = [req.body.id_session, req.body.id_datatype];
  //console.log(dtsession_string);
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  con.query('SELECT * FROM datatype_session WHERE id_session = ? AND id_datatype = ? ORDER BY id_datatype ASC', dtsession_string, (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    //console.log(results);
    return res.json(results);
  });

});

//get all objects per datatype and per session
router.post('/updateSourceSession', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  con.connect(function(err){});
    // Handle connection errors
    
    if (req.body.status == 1){
    // SQL Query > Select Data
      var string_query = 'UPDATE datatype_session SET start_capture = ?, status = ? WHERE id_session = ? AND id_datatype = ? AND id_session_datatype = ? ';
      var session_vars = [new Date(), req.body.status, req.body.id_session, req.body.id_datatype, req.body.id_datatype_session];
      con.query(string_query, session_vars, (err, result) => {
        if (err) throw err;
        console.log(`Changed ${result.changedRows} row(s)`);

            con.query('SELECT * FROM datatype_session WHERE id_session = ? ORDER BY id_datatype ASC', [req.body.id_session], (err, rows) => {
            if(err) throw err;

            rows.forEach( (row) => {
            results.push(row);
            //console.log(`${row.id_session} , ${row.id_datatype}`);
            });
            //console.log(results);
            return res.json(results);
          });
      });

    }

    else if (req.body.status == 0) {
      var string_query = 'UPDATE datatype_session SET end_capture = ?, status = ? WHERE id_session = ? AND id_datatype = ? AND id_session_datatype = ?'
      var session_vars = [new Date(), req.body.status, req.body.id_session, req.body.id_datatype, req.body.id_datatype_session];
      con.query(string_query, session_vars, (err, result) => {
        if (err) throw err;
        console.log(`Changed ${result.changedRows} row(s)`);

        con.query('SELECT * FROM datatype_session WHERE id_session = ? ORDER BY id_datatype ASC', [req.body.id_session], (err, rows) => {
          if(err) throw err;

          rows.forEach( (row) => {
          results.push(row);
          //console.log(`${row.id_session} , ${row.id_datatype}`);
          });
          //console.log(results);
          return res.json(results);
        });
      });
    }

});

//delete actions with objects associated
//added 24-04-2019
router.post('/deletesourcesession', (req, res, next) => {
    const results = [];
    
    const query_string1 = 'DELETE FROM datatype_session WHERE datatype_session.id_datatype = ? AND datatype_session.id_session_datatype = ? AND datatype_session.id_session = ? '
    con.query(query_string1, 
    [req.body.id_datatype,req.body.id_session_datatype,req.body.id_session], (err, result) => {
      if(err) throw err;
      console.log(`Deleted ${result.affectedRows} row(s)`);

      const query_string2 = 'SELECT * FROM datatype_session WHERE id_session = ? ORDER BY id_datatype ASC';
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

//update empatica serial with data source
//added 1-05-2019
router.post('/updateempatica', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  con.connect(function(err){});
    // Handle connection errors
    // SQL Query > Select Data
      var string_query = 'UPDATE datatype_session SET id_empatica = ? WHERE id_session = ? AND id_datatype = ? AND id_session_datatype = ? ';
      var session_vars = [req.body.serial, req.body.id_session, req.body.id_datatype, req.body.id_session_datatype];
      con.query(string_query, session_vars, (err, result) => {
        if (err) throw err;
        console.log(`Changed ${result.changedRows} row(s)`);

            con.query('SELECT * FROM datatype_session WHERE id_session = ? ORDER BY id_datatype ASC', [req.body.id_session], (err, rows) => {
            if(err) throw err;

            rows.forEach( (row) => {
            results.push(row);
            //console.log(`${row.id_session} , ${row.id_datatype}`);
            });
            //console.log(results);
            return res.json(results);
          });
      });

});

module.exports = router;