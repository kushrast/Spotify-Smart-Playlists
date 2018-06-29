var config = {}

config.client_id = process.env.client_id; // Your client id
config.client_secret = process.env.client_secret; // Your secret
config.redirect_uri = 'https://spotify-sessions-kush.herokuapp.com/authorization'; // Your redirect uri

module.exports = config

