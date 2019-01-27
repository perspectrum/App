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
  encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
  "message": "hello world"
});

var newsNetworks = ["cbs-news","abc-news","the-new-york-times","cnn,the-guardian-uk","newsweek","bloomberg","politico","bbc-news","nbc-news","associated-press","the-economist","reuters,usa-today","fox-news","national-review"];
var app = express();

var comments = [];
app.get('/getComments', function(req, res){
  res.json(comments);
});

var mongoose = require("mongoose");

mongoose.connect(( process.env.MONGOURL || config.MONGOURL ), function(err, client) {
    if(err) {
        console.log(err);
    }

    client.db.listCollections().toArray(function(err, collections) {
        if(isEmptyObject(collections) == true){
            getDailyArticle();
        }
    });
});

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


app.post('/comment', function(req, res) {

    var newComment = {
      name: req.body.name,
      email: req.body.email,
      comment: req.body.comment
    };
    comments.push(newComment);
    pusher.trigger('flash-comments', 'new_comment', newComment);
    res.json({ created: true });
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
    console.log(req);
    error404.status = 404;
    next(error404);
});

setInterval(function(){
    getDailyArticle();
}, 1000 * 60 * 60 * 24);
  

function getDailyArticle(){
    var randomNetwork = newsNetworks[Math.floor(Math.random() * newsNetworks.length)];
    newsapi.v2.topHeadlines({
    sources: randomNetwork,
    language: 'en',
  }).then(response => {
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
}

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }
  

module.exports = app;
var port = 80;
app.listen(port, function(){
  console.log('Example app listening on port ' + port + "!");
});
