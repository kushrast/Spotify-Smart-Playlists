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
      console.log(docs);
      async.each(docs["data"], function(item, callback) {
        var options = {
          url: 'https://api.spotify.com/v1/users/' + req.session.userid + '/playlists/' + item,
          headers: { 'Authorization': 'Bearer ' + req.session.access_token }
        };

        console.log(options);

        request.get(options, function(error, response, playlist) {
          playlists.push.apply(playlists, playlist);
        });
        callback();
      }, function(err) {
        if (err) return console.log('ERROR', err);

        data = {
          "playlists": playlists
        }
        res.render("playlist", data);
      });
    });
  }
});

router.post("/:uri/update", function(req, res, next) {
  console.log(req.session);

  if (req.session.access_token) {
    var body = JSON.parse(Object.keys(req.body)[0]);
    var uri = req.params.uri.split(":"); //Done like this to parse out the user and playlist out of the uri
    var options = {
      url: 'https://api.spotify.com/v1/users/'+uri[2]+'/playlists/'+uri[4]+'/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      body: {
        'uris': body.uris
      },
      json: true
    };

    console.log(options);

    // use the access token to access the Spotify Web API
    request.put(options, function(error, response, playlist) {
      console.log(error);
    });
  }
});

router.post("/play", function(req, res, next) {
  console.log(req.session);
  if (req.session.access_token) {
    var body = JSON.parse(Object.keys(req.body)[0]);
    var options = {
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: { 'Authorization': 'Bearer ' + req.session.access_token },
        body: {
          'uris': body.uris
        },
        json: true
      };

      console.log(options);
      console.log(req.body);

      // use the access token to access the Spotify Web API
      request.put(options, function(error, response, playlist) {
        console.log(error)
    });
  }
});

module.exports = router;