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
	// get ports
	ports 		= require('./ports.js'),
	fileServer_port   	= ports.getFileServerPort(),
	websocket_port    	= ports.getWebsocketPort();

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function(err) {
  	console.error(err.stack);
});
/***** /HANDLE Uncaught Exceptions *****/

/***** STATIC FILE SERVER *****/
// define routes - this will be useful if I choose to use REST in the future
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
	console.log('Static file server listening on port: ' + fileServer_port);
} catch (err) {
	console.error(err);
}
/***** /STATIC FILE SERVER *****/

/***** WEBSOCKETS SERVER *****/
io.set('log level', 2); // reduce logging (Log levels: 0 - error / 1 - warn / 2 - info / 3 - debug)
io.sockets.on('connection', function (socket) {
  	socket.emit('connected', { hello: 'Welcome to the party!' });

  	// create a twitter object using ntwitter
  	console.log('Creating twitter object...');
	var twitter = new ntwitter({
	  	consumer_key: oauth.consumer_key,
	  	consumer_secret: oauth.consumer_secret,
	  	access_token_key: accesstoken.access_token_key,
	  	access_token_secret: accesstoken.access_token_secret
	});

	socket.on('getTweets', function(data) {
		// define topics to watch on twitter
		var keywords = data.keywords;
		var mode = data.mode;
		var respondOn = data.respondOn;

		// verify login details
		console.log('Verifying twitter credentials...');
		twitter.verifyCredentials(function (err, data) {
			if (err == null) {
				console.log('Credentials verified for: ' + data.name + '\n' + 'starting: ' + mode + ' for ' + keywords);

				switch (mode) {
					case 'search':
						// build search query
						var searchQuery = '';
						if (keywords.length > 1) {
							for (key in keywords) { 
								searchQuery += keywords[key];
								// if not specified, use OR by default
								if (key < keywords.length-1) {searchQuery += ' OR '};
							}
						} else {
							searchQuery = keywords[0];
						}

						// search for tweets
						twitter.search(searchQuery, {}, function(err, raw_tweets) {
						  	//console.log(raw_tweets);

						  	//TODO: filter out tweets that are not in English

						  	// POST tweet to Sentiment140 API
				            request.post({
				              	headers: {'content-type' : 'application/x-www-form-urlencoded'},
				              	url:     s140_requestBuilder.bulk.getUrl(),
				              	body:    s140_requestBuilder.bulk.getBody(raw_tweets),
				            }, function(error, response, body){
				            	// handle response from Sentiment140 API
				              	if (!error && response.statusCode == 200) {
				                	try {
				                  		var tweets_polarised = JSON.parse(body);
				                  		socket.emit(respondOn, {'raw_tweets': raw_tweets, 'tweets_polarised': tweets_polarised });
									} catch (err) {
				                		console.error('JSON did not parse. Error: ' + err);
				                	}
				              	} else {
				              		console.log('POST request to Sentiment140 API failed');
				              		console.error('Response:' + response);
							  		console.error('Error:' + error);
							  	}
				            });
						});

						break;

					case 'stream':
						// start streaming tweets
						twitter.stream(
						    'statuses/filter',
						    { track: keywords },
						    function(stream) {
						        stream.on('data', function(raw_tweet) {
						 			//console.log(raw_tweet);

						 			//skip tweets that are not in English
						 			if (raw_tweet.user.lang != 'en') {return; }

						  			// make GET request to Sentiment140 API
						            request(s140_requestBuilder.simple(raw_tweet), function (error, response, body) {
						            	// handle response from Sentiment140 API
						              	if (!error && response.statusCode == 200) {
						                	try {
						                  		var tweet_polarised = JSON.parse(body);
						                  		socket.emit(respondOn, {'raw_tweet': raw_tweet, 'tweet_polarised': tweet_polarised });
											} catch (err) {
						                		console.error('JSON did not parse. Error: ' + err);
						                	}
						              	} else {
						              		console.log('GET request to Sentiment140 API failed');
						              		console.error('Response:' + response);
									  		console.error('Error:' + error);
									  	}
									});
						        });
						    }
						);
						break;

					default:
						console.error('Mode not recognised!');
						break;
				}
			} else {
				console.log('Credential verification failed');
				console.error(err);
			}
		});
	});
});

// start listening for websocket
try {
	server.listen(websocket_port);
	console.log('Websocket listening on port: ' + websocket_port);
} catch (err) {
	console.error(err);
}
/***** /WEBSOCKET *****/

/* Prepare data for Sentiment140 API */
var s140_requestBuilder = {
	// setup links for Sentiment140 API
	sentiment140_API			: 'http://www.sentiment140.com/api/',
	sentiment140_simpleClassify : 'classify',
	sentiment140_bulkClassify 	: 'bulkClassifyJson',
	sentiment140_appId 			: '?appid=' + s140_appId,

	simple: function(tweet) {
		try {
			var text = "?text=" + tweet.text.replace(/\s/g,"+");
			return this.sentiment140_API + this.sentiment140_simpleClassify + text;
		} catch (err) {
			console.error('Could not build simple request. Error: ' + err);
			return null;
		}		
	},

	bulk: {
		getUrl: function() {
			// I can't seem to create a 'super' reference to grab the link components... so I referenced them statically
			return s140_requestBuilder.sentiment140_API + s140_requestBuilder.sentiment140_bulkClassify + s140_requestBuilder.sentiment140_appId;
		},

		getBody: function(tweets) {
			try {
				var data = [];
				for (key in tweets.results) {
					data.push({ "text": tweets.results[key].text });
				}
				return JSON.stringify({ "data": data });
			} catch (err) {
			console.error('Could not build bulk request. Error: ' + err);
			return null;
			}
		},
	}
}
/* /Prepare data for Sentiment140 API */