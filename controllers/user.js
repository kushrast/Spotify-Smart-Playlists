var express = require("express"); //Routing
var request = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring');
var async = require('async'); //For faster data recovery from Spotify

var config = require('./../config');
var db = require('./../db');

var router = express.Router(); //The router matches HTTP requests to frontend views

router.get("/fetch_all", function(req, res, next) {
  console.log(req.session);
  if (req.session.access_token) {
    var options = {
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + req.session.access_token },
        json: true
      };

      // use the access token to access the Spotify Web API
      request.get(options, function(error, response, playlist) {
        console.log(error)
        res.send(playlist.items);
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