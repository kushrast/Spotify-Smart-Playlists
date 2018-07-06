//MODULE IMPORTS
var path = require("path"); //Works with file paths
//Routing
var express = require("express"); //Routing
var logger = require("morgan"); //HTTP Logger
//Data
var requests = require("request"); //Used to request data from Spotify's Web API
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser'); //loads cookie parser library
//Spotify Configurations [secret]
var config = require('./config');
var routes = require("./controllers/routes");
var playlists = require("./controllers/playlists");
var session = require('express-session');
var db = require('./db');


//EXPRESS MIDDLEWARE
var app = express();
app.set("views", path.join(__dirname, "views")) //Lets system know that views are in the /views folder
app.set("view engine", "hbs"); //Declares handlebars as the templating engine
app.use(logger('dev')); //Using the morgan logger for HTTP requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'yay area', cookie: { maxAge: 60000}}));


//ROUTING
app.use('/', routes);
app.use('/playlists/', playlists);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('invalid');
});

console.log('Listening on PORT');
app.listen(process.env.PORT);


// //MONGO DB & MONGOOSE
// db.connect(config.MONGODB_URI, function(err){
// 	if(err) {
// 		console.log("Unable to log into Mongo DB");
// 		process.exit(1);
// 	} else {

// 	}
// })