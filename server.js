var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var Pusher = require('pusher');

var config = require('./config.json');
var newsApiKey = config.newsapi.apikey;

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(newsApiKey);


var pusher = new Pusher({
    appId: '700488',
    key: '7e702683ef693aa93027',
    secret: '031dc5769c6550b2d9c8',
    cluster: 'us2',
    useTLS: true
});

var comments = [];

var app = express();

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/perspectrum");

var articleSchema = new mongoose.Schema({
    source : {id: String, name: String},
    author : String,
    title : String,
    description : String,
    url : String,
    urlToImage : String,
    publishedAt : String,
   });

var Article = mongoose.model("Article", articleSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/comment', function(req, res){
  console.log(req.body);  
  var newComment = {
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment
  };
  comments.push(newComment);
  pusher.trigger('flash-comments', 'new_comment', newComment);
  res.json({ created: true });
});

app.get('/getComments', function(req, res){
  res.json(comments);
});

app.get('/getarticle', function(req, res){
    var dateNow = new Date();
    var somedate= (dateNow.getMonth()+1).toString() + "-" + dateNow.getDate().toString() + "-" + dateNow.getFullYear().toString();

    Article.find({publishedAt: somedate}, function(err,article){
        if(err) throw err;
        console.log(article);
        res.json(article);
    });
    
  });
// Error Handler for 404 Pages
app.use(function(req, res, next) {
    var error404 = new Error('Route Not Found');
    error404.status = 404;
    next(error404);
});

// Article.find({publishedAt: somedate}, function(err,article){
//     if(err) throw err;
//     console.log(article);
// });

newsapi.v2.topHeadlines({
    sources: 'breitbart-news,bbc-news,the-verge',
    language: 'en',
  }).then(response => {
    //console.log(response.articles[0]);
    var dateNow = new Date();
    var stringDate =  (dateNow.getMonth()+1).toString() + "-" + dateNow.getDate().toString() + "-" + dateNow.getFullYear().toString();
    var myData = new Article({
        source : {id: response.articles[0].source.id, name: response.articles[0].source.name},
        author : response.articles[0].author,
        title : response.articles[0].title,
        description : response.articles[0].description,
        url : response.articles[0].url,
        urlToImage : response.articles[0].urlToImage,
        publishedAt : stringDate});
    myData.save(function(error) {
        console.log("Your article has been saved!");
    if (error) {
        console.error(error);
    }
    });
  });

module.exports = app;

app.listen(9000, function(){
  console.log('Example app listening on port 9000!');
});