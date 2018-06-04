var express = require('express');
var router = express.Router();
var connection = require('../library/connection');

router.post('/', function(req, res, next) {
  var currentdate = new Date(); 
  var data = {
  	user_id: req.body.user_id,
  	timestamp: Math.floor(Date.now() / 1000),
  	location: req.body.location,
  	temperature: req.body.temperature,
  	unit: req.body.unit
  }
  connection
  .insert(data, 'id')
  .into('locations')
  .then(function(response){
    res.send({id:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});
router.get('/', function(req, res, next) {
  connection.select('*')
  .where('user_id', req.query.user_id)
  .from('locations')
  .then(function(response){
    res.send({locations:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});
module.exports = router;