var express = require("express"); //Routing
var request = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring');
var async = require('async'); //For faster data recovery from Spotify

var config = require('./../config');
var db = require('./../db');

var router = express.Router(); //The router matches HTTP requests to frontend views

router.get('/', function(req, res, next) {

  console.log(req.session);

  if (!req.session.access_token) {
    res.redirect("/invalid");
  } 

  else {
    var playlists = [];
    db.get().collection("spotify_sessions").find().toArray(function(err, docs) {
      let requests = docs[0]["data"].map((item) => {
        return new Promise((resolve) => {
          var options = {
            url: 'https://api.spotify.com/v1/users/' + req.session.userid + '/playlists/' + item,
            headers: { 'Authorization': 'Bearer ' + req.session.access_token }
          };

          request.get(options, function(error, response, playlist) {
            resolve(JSON.parse(playlist));
          });
        });
      });

      Promise.all(requests).then(function(playlists) {
        docs[0]["data"] = playlists
        console.log(docs[0]);
        res.render("playlist", docs[0]);
      });
    });
  }
});

router.post('/:id/add', function(req, res, next) {
  console.log(req.params);
  var body = JSON.parse(Object.keys(req.body)[0]);
  console.log(body);
  var uri = body.uri.split(":"); //Done like this to parse out the user and playlist out of the uri

  db.get().collection("spotify_sessions").update({
    _id: req.params.id
  }, {
    $addToSet: {
      "data": uri[4]
    }
  },
  function(err, count, status) {
    console.log(err);
    console.log(status);
  });
});

router.post('/:id/remove', function(req, res, next) {
  console.log(req.params);
  var body = JSON.parse(Object.keys(req.body)[0]);
  console.log(body);
  var uri = body.uri.split(":"); //Done like this to parse out the user and playlist out of the uri

  db.get().collection("spotify_sessions").update({
    _id: req.params.id
  }, {
    $pull: {
      "data": [uri[4]]
    }
  },
  function(err, count, status) {
    console.log(err);
    console.log(status);
  })
});

module.exports = router;