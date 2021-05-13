var express = require('express');
var router = express.Router();
path = require("path");

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.get('/timeline/:id', (req, res, next) => {
  var options = {
    headers: {
        'id_session': req.params.id
    }
  };
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'timeline.html'), options);
});

router.get('/proxies/:id', (req, res, next) => {
  var options = {
    headers: {
        'group_n': req.params.id
    }
  };
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'physical_proxy.html'), options);
});

router.get('/social/:id', (req, res, next) => {
  var options = {
    headers: {
        'group_n': req.params.id
    }
  };
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'social_proxy.html'), options);
});

router.use('/api/v1/sessions', require('./sessions'));
router.use('/api/v1/media', require('./media'));
router.use('/api/v1/location', require('./location'));
router.use('/api/v1/actions', require('./actions'));
router.use('/api/v1/objects', require('./objects'));
//change for Carmen's subject
//router.use('/api/v1/visualisations', require('./visualisations_Carmen'));
router.use('/api/v1/visualisations', require('./visualisations'));
router.use('/api/v2/rules', require('./rules'));
router.use('/api/v2/rules', require('./reports'));
//router.use('/api/v2/rules', require('./timeLine'));
//router.use('/profiles', require('./profiles'));
//router.use('/articles', require('./articles'));
//router.use('/tags', require('./tags'));

/*router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});*/

module.exports = router;