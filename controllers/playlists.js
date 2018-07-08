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
      console.log(docs[0]["data"]);
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
        data = {
          "playlists": playlists
        }
        res.render("playlist", data);
      });
    });
  }
});

router.post("/:uri/reorder", function(req, res, next) {
  console.log(req.session);

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

    console.log(options);

    // use the access token to access the Spotify Web API
    request.put(options, function(error, response, playlist) {
      console.log(error);
    });
  }
});

router.post("/:uri/remove", function(req, res, next) {
  if (req.session.access_token) {
    console.log(req.params);
    var body = JSON.parse(Object.keys(req.body)[0]);
    console.log(body.song_id);
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

    console.log(options);

    request.delete(options, function(error, response, playlist) {
      console.log(error);
    });
  } else {
    console.log("can't do that sir");
  }
});

router.post("/:uri/add", function(req, res, next) {
  if (req.session.access_token) {
    console.log(req.params);
    var body = JSON.parse(Object.keys(req.body)[0]);
    console.log(body.song_id);
    var uri = req.params.uri.split(":"); //Done like this to parse out the user and playlist out of the uri
    var options = {
      url: 'https://api.spotify.com/v1/users/'+uri[2]+'/playlists/'+uri[4]+'/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      body: {
        "tracks": [{
          "uris": [body.song_id],
          "positions": body.position
        }]
      },
      json: true
    };

    console.log(options);

    request.post(options, function(error, response, playlist) {
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