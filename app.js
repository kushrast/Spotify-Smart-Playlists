var path = use("path"); //Works with file paths
//Routing
var express = use("express"); //Routing
var logger = use("morgan"); //HTTP Logger
//Data
var requests = use("request"); //Used to request data from Spotify's Web API

var app = express();
app.set("views", path.join(__dirname, "views")) //Lets system know that views are in the /views folder
app.set("view engine", "hbs"); //Declares handlebars as the templating engine
app.use(logger('dev')); //Using the morgan logger for HTTP requests

var router = express.Router(); //The router matches HTTP requests to frontend views

router.get("/playlist", function(req, res, next) {
	res.render("playlist")
});