var express = require('express');
var controller = require('./../mongo/controller');
var router = express.Router();
var validator = require("validator");


router.post('/', function(req, res) {
  // Get values from request
  var username = req.headers['username'];
  var useremail = req.headers['useremail'];
  var password = req.headers['password'];

  //Error handling
  if (validator.isEmpty(username)) {
    return res.status(400).send('Empty username');
  } 
  else if (!validator.matches(username, '^[a-zA-Z0-9_.-]*$')) {
    return res.status(400).send('Invalid username');
  } 

  if (!validator.isEmail(useremail)) {
    return res.status(400).send('Invalid email address');
  }

  if (validator.isEmpty(password)) {
    return res.status(400).send('Empty password');
  } 
  
  var response = controller.create_user(username, useremail, password);

  // Upon resolve of the promise
  response.then(function(result) {
    console.log(result);
    if (result === "500") {
      return res.status(result).send('Unsuccesful');
    }
    return res.status(result).send('Success');
  });

});

module.exports = router;
