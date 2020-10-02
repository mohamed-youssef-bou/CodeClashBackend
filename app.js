const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express()

app.set('port', (process.env.PORT || 80000));
app.use(cors());
app.use(bodyParser.json());



app.get('/test', function(req, res){

    // Get header information
    var test = req.headers['input'];

    // Get body information
    // var test = req.body.input;
    
    // res.send is used to return to frontend as a response.
    res.send(test);
    return;
})



var server = app.listen(process.env.PORT || 8000, function () {
    console.log('Server started...')
})