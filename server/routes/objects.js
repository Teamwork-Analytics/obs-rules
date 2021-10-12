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
//const database='MonashAugustDataCollection';
//const database='group_analytics1';
const database='MonashInterviews';
//const database='testMonash';

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
//get all objects
router.get('/all', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM objects ORDER BY id ASC;', (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });

    return res.json(results);
  });

});
router.post('/countobjssession', (req, res, next) => {
  const new_name = [];
  const objString = [req.body.id_obj, req.body.id_session];
  con.connect(function(err){});
  con.query('SELECT count(*) as count FROM object_session where id_object = ? and id_session = ?', objString, (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    c = row.count;
    
    });
    return res.send(req.body.name+(c+1));
  });
});

//insert object in session
router.post('/addobjsession', (req, res, next) => {
  var results = [];
  const dtsession_string = {id_object: req.body.id_obj, id_session: req.body.id_session, name: req.body.name};
  
  con.query('INSERT INTO object_session SET ?', dtsession_string, (err, res1) => {
  if(err) throw err;
  });

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

//get objects per session
router.get('/objectsession/:ids', (req, res, next) => {
  const results = [];

    con.query('SELECT * FROM object_session WHERE id_session = ? ORDER BY id ASC;',[req.params.ids], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//get objects per session per type
router.get('/studentsession/:ids', (req, res, next) => {
  const results = [];
    //id_object = 1 = students
    con.query('SELECT * FROM object_session WHERE id_session = ? AND id_object != 4 ORDER BY name ASC;',[req.params.ids], (err,rows) => {
    if(err) throw err;

    rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.name} started at ${row.time_start}`);
    });
    return res.json(results);
  });
});

//get serial trackers per type
router.post('/trackers/', (req, res, next) => {
  const results = [];
    if(req.body.type == 'pozyx')
    {  
    con.query('SELECT * FROM trackers WHERE type = ?',[req.body.type], (err,rows) => {
    if(err) throw err;

      rows.forEach( (row) => {
      results.push(row);
      //console.log(`${row.name} started at ${row.time_start}`);
         });
    
        return res.json(results);
     });
    }
    else if(req.body.type == 'empatica')
    {  
    con.query('SELECT * FROM datatype_session WHERE id_session = ? AND id_datatype = 3;',[req.body.id_session], (err,rows) => {
    if(err) throw err;

      rows.forEach( (row) => {
      results.push(row);
      //console.log(`${row.name} started at ${row.time_start}`);
         });
    
        return res.json(results);
     });
    }
});

//get trackers - pozyx or empatica
router.get('/trackers/:type', (req, res, next) => {
   const results = [];
    con.query('SELECT * FROM trackers WHERE type = ?',[req.params.type], (err,rows) => {
      if(err) throw err;

      rows.forEach( (row) => {
      results.push(row);
      //console.log(`${row.name} started at ${row.time_start}`);
      });
    
        return res.json(results);
    });
});// end get

// update serial from object-session
router.post('/updateserial', (req, res, next) => {
  var results = [];
  const dtobj_string = [req.body.serial, req.body.type, req.body.id_objs,req.body.id_session];
  
  if(req.body.type == 'pozyx'){
  con.query('UPDATE object_session SET serial = ?, type = ? WHERE id = ? AND id_session = ?', dtobj_string, (err, result) => {
  if(err) throw err;
  console.log(`Changed ${result.changedRows} row(s)`);
  });
  }
  else if(req.body.type == 'empatica'){
    con.query('UPDATE object_session SET empatica = ?, type = ? WHERE id = ? AND id_session = ?', dtobj_string, (err, result) => {
  if(err) throw err;
  console.log(`Changed ${result.changedRows} row(s)`);
  });
  }

  
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

// update object name
//added 30-04-2019
router.post('/updateobjname', (req, res, next) => {
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


router.post('/updateobjcoordinates', (req, res, next) => {
    var results = [];
    const dtobj_string = [req.body.coordinates, req.body.id_objsession];
    
    con.query('UPDATE object_session SET coordinates = ? WHERE id = ?', dtobj_string, (err, result) => {
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

//Bring all coordinates of a session

const coordinates = (id_session, callback) => {
  
  const results = [];
  console.log('The value for the rule you are querying is: ',id_session);
  con.query('SELECT coordinates, name FROM object_session where id_session =? and name like \'bed%\' ORDER BY name ASC;', [id_session], (err,rows) => {
    if(err) throw err;
    rows.forEach( (row) => {
      results.push(row);
      console.log(`${row.coordinates}`);
    });
    callback (results);
  });
};

//get coordinates from session
router.get('/coordinates/:id_session', (req, res, next) => {
  return coordinates(req.params.id_session, (results)=>{ 
    return res.json(results);
  });
});

//delete actions with objects associated
//added 24-04-2019
router.post('/deleteobjectsession', (req, res, next) => {
    const results = [];
    
    const query_string1 = 'DELETE FROM object_session WHERE object_session.id = ?'
    con.query(query_string1, 
    [req.body.id_objectsession], (err, result) => {
      if(err) throw err;
      console.log(`Deleted ${result.affectedRows} row(s)`);

      const query_string2 = 'SELECT * from object_session WHERE id_session = ? ORDER BY id ASC';
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

module.exports = router;
module.exports.getCoordinates = coordinates;
