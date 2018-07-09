var express = require("express"); //Routing
var request = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring');
var async = require('async'); //For faster data recovery from Spotify

var config = require('./../config');
var db = require('./../db');

var router = express.Router(); //The router matches HTTP requests to frontend views

router.post("/:uri/reorder", function(req, res, next) {
  if (req.session.access_token) {
    var body = JSON.parse(Object.keys(req.body)[0]);
    console.log(body["song_id"]);
    var uri = req.params.uri.split(":"); //Done like this to parse out the user and playlist out of the uri
    var options = {
      url: 'https://api.spotify.com/v1/users/'+uri[2]+'/playlists/'+uri[4]+'/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      body: {
        'range_start': body.old_position,
        'insert_before': body.new_position
      },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.put(options, function(error, response, playlist) {
      console.log(options.url);
    });
  }
  res.send();
});

router.post("/:uri/remove", function(req, res, next) {
  if (req.session.access_token) {
    var body = JSON.parse(Object.keys(req.body)[0]);
    var uri = req.params.uri.split(":"); //Done like this to parse out the user and playlist out of the uri
    var options = {
      url: 'https://api.spotify.com/v1/users/'+uri[2]+'/playlists/'+uri[4]+'/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      body: {
        "tracks": [{
          "uri": body.song_id,
          "positions": [body.position]
        }]
      },
      json: true
    };

    request.delete(options, function(error, response, playlist) {
      console.log(error);
    });
  } else {
    console.log("can't do that sir");
  }
  res.send();
});

router.post("/:uri/add", function(req, res, next) {
  if (req.session.access_token) {
    console.log(req.params);
    var body = JSON.parse(Object.keys(req.body)[0]);

    console.log(body);

    console.log(body.song_id);
    var uri = req.params.uri.split(":"); //Done like this to parse out the user and playlist out of the uri
    var options = {
      url: 'https://api.spotify.com/v1/users/'+uri[2]+'/playlists/'+uri[4]+'/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token ,
                  'Content-Type': "application/json"},
      body: {
        "uris": [body.song_id],
        "position": body.position
      },
      json: true
    };

    request.post(options, function(error, response, playlist) {
      console.log(playlist);
    });
  }
  res.send();
});

module.exports = router;