const { Router } = require('express');
var express = require('express');
const controller = require('./../mongo/controller');
var router = express.Router();

router.get('/', function(req, res, next) {

    // Get header information
    var test = req.headers['input'];

    // Get body information
    // var test = req.body.input;
    
    // res.send is used to return to frontend as a response.
    controller.test(test);
    res.send(test);

})

module.exports = router;