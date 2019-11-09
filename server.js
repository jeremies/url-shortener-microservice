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
  short_url:  Number,
  url: String
});

var URL = mongoose.model('URL', URLSchema);

var countURLs = function (done) {
  URL.estimatedDocumentCount(function (err, count) {
    if (err) {
      done(err);
    }
    else {
      done(null, count);
    }
  });
}

var createURL = function (url, done) {
  countURLs(function (err, count) {
    if (err) { done(err); }
    else {
      var url = new URL({ short_url: count, url: url});
      url.save(function (err, data) {
        if (err) {
          done(err);
        }
        else {
          done(null, data);
        }
      });
    }
  });
}

app.post("/api/shorturl/new", function (req, res, next) {
  console.log(req.body.url);
  
  createURL(req.body.url, function (err, data) {
    if (err) {
      return (next(err));
    }
    res.json(data);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});