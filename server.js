'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var Schema = mongoose.Schema;

var URLSchema = new Schema({
  id:  Number,
  url: String
});

var URL = mongoose.model('URL', URLSchema);

URL.estimatedDocumentCount(function (err, data) {
  console.log(data);
});

app.post("/api/shorturl/new", function (req, res, next) {
  
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});