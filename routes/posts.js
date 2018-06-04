var express = require('express');
var router = express.Router();
var connection = require('../library/connection');
var cloudinary = require('cloudinary');
var path = require('path');
var fs = require('fs');
cloudinary.config({ 
  cloud_name: 'dsj8mo2gp', 
  api_key: '371839435119439', 
  api_secret: 'XMAuqd7sHvGW6Wpi3FMxjFqv8dg' 
});
/* GET home page. */
router.get('/', function(req, res, next) {
  connection.select('*')
  .from('posts')
  .then(function(response){
    connection.select('*')
    .from('users')
    .then(function(resp){
      var mapResponse = response.map(function(post){
        var findUser = resp.filter(function(user){
          return user.id === post.user_id;
        })[0];
        if(findUser){
          post.user = findUser;
          var currentdate = post.date;
          post.newDate =  currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear();
          post.time = currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
          return post;
        }
      });
      res.send({data:mapResponse});
    });
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});

router.post('/', function(req, res, next) {
  var currentdate = new Date(); 
    connection
    .insert({"image": "", "body": req.body.body, "user_id": req.body.user_id, comments: '[]', reactions : '[]', date: currentdate}, 'post_id')
       .into('posts')
    .then(function(response){
      let data = new Buffer(req.body.image, "base64");
      var extension = path.extname(req.body.filename);
      extension = extension.toLowerCase();
      var image_name = response[0] + '_' + Math.floor(new Date() / 1000) + extension;
      var dir = __dirname + '/../_media';
      var newname = dir + '/' + image_name;
      fs.writeFile(newname, data, function (r,err) {
        if (err) console.log(err);

      cloudinary.uploader.upload(
        newname,
        function(result) {
          console.log(newname, result, response);
        connection('posts')
        .where('post_id', response[0])
        .update({image: result.secure_url})
        .then(function(r){  
      res.send({id:response, file: image_name, url: result.secure_url});
    });
    });
      });
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
    var currentdate = response[0].date;
  //   var datetime = "Last Sync: " + currentdate.getDate() + "/"
  //               + (currentdate.getMonth()+1)  + "/" 
  //               + currentdate.getFullYear() + " @ "  
  //               + currentdate.getHours() + ":"  
  //               + currentdate.getMinutes() + ":" 
  //               + currentdate.getSeconds();
  // console.log(datetime);
  response[0].newDate =  currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear();
  response[0].time = currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
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
