/*
 * server.js -> node.js server for MoodViz
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

/* include and setup required packages */
var appName		= 'MoodViz',
	express 	= require("express"),
    app     	= express(),
    http 		= require('http'),
	server 		= http.createServer(app), 
	io  		= require('socket.io').listen(server),
	request 	= require('request'),
	ntwitter 	= require('ntwitter'),
	app_creds 	= require('./app_credentials.js'), //see app_credentials__template.js
	oauth 		= app_creds.getOAuthSettings(appName),
	accesstoken = app_creds.getAccessToken(appName),
	s140_appId	= app_creds.getSentiment140AppId(appName),
	// define ports
	ports 		= require('./ports.js'),
	fileServer_port   	= ports.getFileServerPort(),
	websocket_port    	= ports.getWebsocketPort();

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function(err) {
  	console.error(err.stack);
});
/***** /HANDLE Uncaught Exceptions *****/

/***** STATIC FILE SERVER *****/
// define routes
app.get('/', function(req, res) {
	res.redirect('/index.html');
});

// configure the server
app.configure(function(){
	app.use(express.bodyParser());
  	app.use(express.static(__dirname));
  	app.use(express.errorHandler({
    	dumpExceptions: true, 
    	showStack: true
	}));
  	app.use(app.router);
});

// start static file server
try {
	app.listen(fileServer_port);
	console.log('Static file server started on port: ' + fileServer_port);
} catch (err) {
	console.error(err);
}
/***** /STATIC FILE SERVER *****/

/***** WEBSOCKETS SERVER *****/
io.sockets.on('connection', function (socket) {
  	socket.emit('alerts', { hello: 'Welcome to the party!' });

  	/* setup twitter */
	// create a twitter object using ntwitter
	var twitter = new ntwitter({
	  	consumer_key: oauth.consumer_key,
	  	consumer_secret: oauth.consumer_secret,
	  	access_token_key: accesstoken.access_token_key,
	  	access_token_secret: accesstoken.access_token_secret
	});

	// verify login details
	console.log('Verifying twitter credentials...');
	twitter.verifyCredentials(function (err, data) {
		if (err == null){
			console.log('Credentials verified for: ' + data.name);

			// define Sentiment140 API
			var sentiment140_API			= 'http://www.sentiment140.com/api/',
				sentiment140_simpleClassify = 'classify',
				sentiment140_bulkClassify 	= 'bulkClassifyJson',
				sentiment140_appId 			= '?appid=' + s140_appId,
				sentiment140_url 			= sentiment140_API + sentiment140_bulkClassify + sentiment140_appId;

			// define topics to watch on twitter
			var topics = ['beiber', 'obama'];

			// start streaming tweets
			twitter.stream(
			    'statuses/filter',
			    { track: topics },
			    function(stream) {
			        stream.on('data', function(tweet) {
			            //console.log(tweet.created_at + ": " + tweet.user.name + " said: " + tweet.text); //preview received tweet
			            
			            // POST tweet to Sentiment140 API
			            request.post({
			              	headers: {'content-type' : 'application/x-www-form-urlencoded'},
			              	url:     sentiment140_url,
			              	//TODO: write a function that will generate this based on whether we are using a bulk or simple classify
			              	body:    "{\"data\": [{\"text\": \"" + tweet.text + "\"}]}"
			            }, function(error, response, body){
			            	// handle response from Sentiment140 API
			              	if (!error && response.statusCode == 200) {
			                	try {
			                  		var obj = JSON.parse(body);
			                  		var tweet_polarised = "Polarity: " + obj.data[0].polarity.toString() + " for: " + obj.data[0].text.toString();
			                  		socket.emit('tweet', tweet_polarised);
								} catch (err) {
			                		console.error(err);
			                	}
			              	}
			            });
			        });
			    }
			);
		} else {
			console.log('Credential verification failed');
			console.error(err);
		}
	});
	/***** /SET UP TWITTER *****/
});

// open websocket
try {
	server.listen(websocket_port);
	console.log('Websocket opened on port: ' + websocket_port);
} catch (err) {
	console.error(err);
}
/***** /WEBSOCKET *****/