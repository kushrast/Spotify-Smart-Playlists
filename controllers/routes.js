var express = require("express"); //Routing
var requests = require("request"); //Used to request data from Spotify's Web API
var querystring = require('querystring')

var config = require('./config');

var router = express.Router(); //The router matches HTTP requests to frontend views
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

router.get('/', function(req, res, next) {
  if (req.session.access_token) {
    res.redirect('/authenticated');
  } else {
    res.redirect('/login'); //incorporate session data soon
  }
});

router.get('/login', function(req, res, next) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: config.client_id,
      scope: scope,
      redirect_uri: config.redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res, next) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: config.redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(config.client_id + ':' + config.client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        res.redirect('/authenticated');
      } else {
        res.redirect('/invalid');
      }
    });
  }
});

router.get("/authenticated", function(req, res, next) {
  res.render("authenticated");
});

router.get("/playlist", function(req, res, next) {
  res.render("playlist");
});

router.get("/invalid", function(req, res, next) {
  res.render("invalid");
});