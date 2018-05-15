var express = require('express');
var router = express.Router();
var connection = require('../library/connection');

/* GET home page. */
router.get('/', function(req, res, next) {
  connection.select('*')
  .from('posts')
  .then(function(response){
    res.send({data:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});

router.post('/', function(req, res, next) {
  connection
  .insert({"image": req.body.image, "body": req.body.body, "user_id": req.body.user_id, comments: '[]', reactions : '[]'}, 'post_id')
     .into('posts')
  .then(function(response){
    res.send({id:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});

router.get('/post', function(req, res, next) {
  connection.select('*')
  .where({'post_id':req.query.id})
  .from('posts')
  .then(function(response){
    res.send({data:response[0]});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});

router.delete('/post', function(req, res, next) {
  connection('posts')
  .where('post_id', req.body.id)
  .del()
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({message:"Successfully deleted!"});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});

router.put('/post', function(req, res, next) {
  connection('posts')
  .where('post_id', req.body.id)
  .update({comments: req.body.comments, body: req.body.body, reactions:req.body.reactions})
  .then(function(response){
    res.send({message:"Successfully updated!"});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});

module.exports = router;
