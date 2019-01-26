var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '700488',
    key: '7e702683ef693aa93027',
    secret: '031dc5769c6550b2d9c8',
    cluster: 'us2',
    useTLS: true
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/comment', function(req, res){
  console.log("fuck u");    
  console.log(req.body);
  console.log(req.body.comment);
  
  var newComment = {
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment
  };
  pusher.trigger('flash-comments', 'new_comment', newComment);
  res.json({ created: true });
});

// Error Handler for 404 Pages
app.use(function(req, res, next) {
    var error404 = new Error('Route Not Found');
    error404.status = 404;
    next(error404);
});

module.exports = app;

app.listen(9000, function(){
  console.log('Example app listening on port 9000!');
});