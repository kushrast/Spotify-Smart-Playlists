var express = require("express"); //Routing
var request = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring');
var async = require('async'); //For faster data recovery from Spotify

var config = require('./../config');
var db = require('./../db');
ObjectID = require('mongodb').ObjectID;

var router = express.Router(); //The router matches HTTP requests to frontend views

router.get('/', function(req, res, next) {
  if (!req.session.access_token) {
    res.redirect('/invalid');
  } else {
    db.get().collection("spotify_sessions").find({
      user_id: req.session.userid
    }).toArray(function(err, multi_list) {
      if (err) {
        res.redirect("/invalid");
      }
      data = {
        "data": multi_list
      }
      res.render("multi_home", data);
    })
  }
});

router.get('/:multi_id', function(req, res, next) {

  console.log(req.session);

  if (!req.session.access_token) {
    res.redirect("/invalid");
  } 

  else {
    var playlists = [];
    db.get().collection("spotify_sessions").find({
      user_id: req.session.userid,
      _id: ObjectID(req.params.multi_id)
    }).toArray(function(err, docs) {
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
    _id: new ObjectID(req.params.id)
  }, {
    $addToSet: {
      "data": uri[4]
    }
  },
  function(err, count, status) {
    console.log(err);
    console.log(status);
  });
  res.send();
});

router.post('/:id/remove', function(req, res, next) {
  console.log(req.params);
  var body = JSON.parse(Object.keys(req.body)[0]);
  console.log(body);
  var uri = body.uri.split(":"); //Done like this to parse out the user and playlist out of the uri

  db.get().collection("spotify_sessions").update({
    _id: new ObjectID(req.params.id)
  }, {
    $pull: {
      "data": uri[4]
    }
  },
  function(err, count, status) {
    console.log(err);
    console.log(status);
  });
  res.send();
});

router.post('/:id/create', function(req, res, next) {
    var body = JSON.parse(Object.keys(req.body)[0]);

    var options = {
      url: 'https://api.spotify.com/v1/users/'+req.session.userid+'/playlists/',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token ,
                  'Content-Type': "application/json"},
      body: {
        "name": body.name
      },
      json: true
    };

    request.post(options, function(error, response, playlist) {
      console.log(playlist);
      var body = playlist.uri.split(":");
      db.get().collection("spotify_sessions").update({
        _id: new ObjectID(req.params.id)
      }, {
        $addToSet: {
          "data": body[4]
        }
      },
      function(err, count, status) {
        console.log(err);
        console.log(status);
      });
    });
    res.send();
});

router.post('/:id/delete', function(req, res, next) {
  if (req.session) {
    db.get().collection("spotify_sessions").deleteOne({
      _id: new ObjectID(req.params.id)
    },
    function(err, count, status) {
      console.log(err);
      console.log(status);
    });
  res.send();
  }
});

router.post('/create', function(req, res, next) {
  if (req.session) 
    var body = JSON.parse(Object.keys(req.body)[0]);

    db.get().collection("spotify_sessions").insertOne({
      "name": body.name,
      "user_id": req.session.userid,
      "created": new Date(),
      "data": []
    }, function(err, resp) {
      if (!err) {
        console.log(resp.ops);
      }
    });
    res.send();
});

module.exports = router;