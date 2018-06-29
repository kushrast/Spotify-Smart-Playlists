var express = require("express"); //Routing
var request = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring')

var config = require('./../config');

var router = express.Router(); //The router matches HTTP requests to frontend views

router.get('/', function(req, res, next) {

  console.log(req.session);

  if (!req.session.access_token) {
    res.redirect("/invalid");
  } 

  else {
    var options = {
      url: 'https://api.spotify.com/v1/users/spotify/playlists/37i9dQZF1DX3PIPIT6lEg5/tracks',
      headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      json: true
    };

    console.log(options);

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, playlist) {
      data = {
        'tracks': playlist,
        'access_token': req.session.access_token
      }
      res.render('playlist', data);
    });
  }
});

module.exports = router;