var express = require('express');
var router = express.Router();
var connection = require('../library/connection');
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
      auth: {
          user: "weather.predict1",
          pass: "secret10!"
      }
});
var rand,mailOptions,host,link;
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
router.get('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link= req.query.forgot ? "http://"+req.get('host')+"/users/forgot-password?email=" + req.query.to+ "&id="+rand  : "http://"+req.get('host')+"/users/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
});
});
router.get('/verify',function(req,res){
  console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://"+req.get('host'))==("http://"+host))
  {
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id==rand)
      {
          console.log("email is verified");
          res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
      }
      else
      {
          console.log("email is not verified");
          res.end("<h1>Bad Request</h1>");
      }
  }
  else
  {
      res.end("<h1>Request is from unknown source");
  }
})
router.get('/user', function(req, res, next) {
  connection.select('*')
  .where({id: req.query.id})
  .from('users')
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({user:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
  });
});
router.post('/', function(req, res, next) {
  const saltRounds = 10;
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(req.body.password, salt);
  connection
  .insert({email: req.body.email, password: hash,
     location: req.body.location, first_name: req.body.first_name, last_name: req.body.last_name}, 'id')
     .into('users')
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({id:response});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});

router.put('/', function(req, res, next) {
  connection('users')
  .where('id', req.body.id)
  .update({first_name: req.body.first_name, last_name: req.body.last_name})
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({message:"Successfully updated!"});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});

router.delete('/', function(req, res, next) {
  connection('users')
  .where('id', req.body.id)
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

router.get('/auth', function(req,res,next){
  connection.select('*')
  .where({email: req.query.email})
  .from('users')
  .then(function(response){
    if(bcrypt.compareSync(req.query.password, response[0].password)){
      res.send({"data": response, "found":1});
    }else{
      res.send({"found":0});
    }

  });
});

router.get('/forgot-password', function(req, res, next) {
  console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://"+req.get('host'))==("http://"+host))
  {
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id==rand)
      {
          console.log("email is verified");
          res.writeHeader(200, {"Content-Type": "text/html"});
          res.write("<form action='http://"+req.get('host')+"/users/update-password' method='post'>" +
            "<p> New password: </p> <input type='hidden' name='email' value='"+req.query.email+"'/><input type='password' name='password' placeholder='New Password'/>"+
            "<input type='submit' value='Change Password'/></form>");
          res.end();
      }
      else
      {
          console.log("email is not verified");
          res.end("<h1>Bad Request</h1>");
      }
  }
  else
  {
      res.end("<h1>Request is from unknown source");
  }
});

router.post('/update-password', function(req,res,next){
  const saltRounds = 10;
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(req.body.password, salt);
  connection('users')
  .where('email', req.body.email)
  .update({password: hash})
  .then(function(response){
    // if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
    console.log(response);
    res.send({message:"Successfully updated!"});
  }).
  catch(function(err){
    if (err) return console.error("Uh oh! Couldn't get results: " + err);
  });
});

module.exports = router;
