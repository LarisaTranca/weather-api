var express = require('express');
var router = express.Router();
var connection = require('../library/connection');
/* GET users listing. */
router.get('/', function(req, res, next) {
  connection.select('*')
  .from('users')
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({data:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});

module.exports = router;
