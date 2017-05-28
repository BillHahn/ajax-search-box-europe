//Stackdriver Debug Enabled
require('@google-cloud/debug-agent').start();

var express = require('express');
var mysql = require('mysql');
//var google = require('googleapis');
//var app = express();

const app = express();
//express app needs 'trust proxy' when running in GCP, I think.
//app.enable('trust proxy');

//Get MySQL connection info from environment variables
var config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

//Check environment variables to debug accuracy
/*
console.log("Environment Variables: " + process.env.MYSQL_USER + " / " +
  process.env.MYSQL_PASSWORD + " / " + process.env.MYSQL_DATABASE); */

if (process.env.INSTANCE_CONNECTION_NAME) {
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}
// Connect to the database
const connection = mysql.createConnection(config);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/JS'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  console.log("\n ----------------------------------- \n")
  console.log("\n GAE auto-populated Request Headers: \n")
  console.log("\n ----------------------------------- \n")
  //console.log(JSON.stringify(req.headers));
  var countryHeader = req.get("X-AppEngine-Country");
  var regionHeader = req.get('X-AppEngine-Region');
  var cityHeader = req.get('X-AppEngine-City');
  var cityatlongHeader = req.get('X-AppEngine-CityLatLong');
  var userAgentHeader = req.get('user-agent');
  console.log(
    "\n Country: " + countryHeader +
    "\n Region: " + regionHeader +
    "\n Region: " + cityHeader +
    "\n Region: " + cityatlongHeader +
    "\n Agent from headers: " + userAgentHeader
  );
  
  //Redner index.html and pass location data to it,
  //from GAE populated html req header info!
  res.render('index.html', 
  			{countryinfo: countryHeader,
  			regioninfo: regionHeader,
  			cityinfo: cityHeader,
  			cityatlonginfo: cityatlongHeader}
  );

/*
  res.render('index',{users : [
            { name: 'John' },
            { name: 'Mike' },
            { name: 'Samantha' }
  ]});
 */
});
/*
request.getHeader("X-AppEngine-Country")

request.getHeader("X-AppEngine-Region")

request.getHeader("X-AppEngine-City")

request.getHeader("X-AppEngine-CityLatLong")

*/

app.get('/search', function(req, res) {
  connection.query('SELECT name from products where name like "%' + req.query
    .key + '%"',
    function(err, rows, fields) {
      if (err) throw err;
      var data = [];
      var i = 0;
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].name);
      }
      res.end(JSON.stringify(data));
    });
});

// GCP and localhost compatible multi-purpose way to start Server
const server = app.listen(process.env.PORT || 8081, () => {
  const port = server.address().port;
  console.log(`App listening on port ${port}`);
}); // >>> To start your app (1) Deploy it: "gcloud app deploy" then (2) "gcloud app browse'

//A simpler more hard coded way of starting server localhost
/*
var server = app.listen(3000, function() {
	console.log("We have started our server on port 3000");
});
 */
