var express = require('express');
var router = express.Router();
var connection = require('../library/connection');

router.post('/', function(req, res, next) {
  var currentdate = new Date(); 
  var data = {
  	user_id: req.body.user_id,
  	temperature: req.body.temperature,
    precipitation: req.body.precipitation,
    speed: req.body.speed,
    push_notification: req.body.push_notification,
    send_time: req.body.send_time,
  	location: req.body.location
  }
  connection
  .insert(data, 'id')
  .into('settings')
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
  .from('settings')
  .then(function(response){
    res.send({settings:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});
router.put('/', function(req, res, next) {
  var currentdate = new Date(); 
  var data = {
    temperature: req.body.temperature,
    precipitation: req.body.precipitation,
    speed: req.body.speed,
    push_notification: req.body.push_notification,
    send_time: req.body.send_time,
    location: req.body.location
  }
  connection('settings')
  .where('user_id', req.body.id)
  .update(data)
  .then(function(response){
    res.send({message:"Successfully updated!"});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});
module.exports = router;