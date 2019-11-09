'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

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
  original_url: String  
});

var URL = mongoose.model('URL', URLSchema);

var checkURL = function (url, done) {
  var regex = "/^https?:\/\/\w+\.\w+(\/\w*)*$/"
  var error = { error: "Invalid URL" };
  if (!regex.test(url)) {
    return done(error)
  }
  var hostname = 
  dns.lookup(url, function(err) {
    console.log(err);
    if (err) {
      done(error);
    }
    else {
      done(null, url);
    }
  });
};

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

var createURL = function (original_url, done) {
  countURLs(function (err, count) {
    if (err) { done(err); }
    else {
      var url = new URL({ short_url: count, original_url: original_url});
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
  checkURL(req.body.url, function(err, url) {
    if (err) {
      res.json(err);
    }
    else {
      createURL(url, function (err, data) {
        if (err) {
          return (next(err));
        }

        var res_url = {
          original_url: data.original_url,
          short_url: data.short_url
        }
        res.json(res_url);
      });
    }
  });
});

var findURLByShortURL = function (short_url, done) {
  URL.findOne({ short_url: short_url }, function (err, data) {
    if (err) {
      done(err);
    }
    else {
      done(null, data);
    }
  });  
}

app.get("/api/shorturl/:short_url", function (req, res, next) {
  findURLByShortURL(req.params["short_url"], function (err, data) {
    if (err) {
      return next(err);
    }
    res.redirect(data.original_url);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});