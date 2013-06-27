/*
 * @description: does cool stuff...
 * @author: @hadi_michael
 * @date: May 2013
 *
 */

var request 	= require('request'),
	ntwitter 	= require('ntwitter'),
	// load in app credentials
	app_creds 	= require('./app_credentials'), //see app_credentials__template.js
	oauth 		= app_creds.getOAuthSettings(),
	accesstoken = app_creds.getAccessToken(),
	s140 		= require('./s140');

/* create a twitter object using ntwitter */
console.log('Creating twitter object...');
var twitter = new ntwitter({
	consumer_key: oauth.consumer_key,
	consumer_secret: oauth.consumer_secret,
	access_token_key: accesstoken.access_token_key,
	access_token_secret: accesstoken.access_token_secret
});
/* /create a twitter object using ntwitter */

exports.track = function (socket, keywords) {
	startStream(socket, { track: keywords });
}

exports.follow = function (socket, userIDs) {
	startStream(socket, { follow: userIDs });
}

function startStream(socket, action) {
	var broadcastChannel = 'helloworld';

	// verify login details
	console.log('Verifying twitter credentials...');
	twitter.verifyCredentials(function (err, data) {
		if (err == null) {
			console.log('Credentials verified for: ' + data.name + '\n' + 'Will start to ' + JSON.stringify(action));

			// start streaming tweets
			twitter.stream(
			    'statuses/filter',
			    action,
			    function (stream) {
			    	stream.on('data', function(raw_tweet) {
						//console.log(raw_tweet);

						//skip tweets that are not in English
						if (raw_tweet.user.lang != 'en') {return; }

						// make GET request to Sentiment140 API
				        request(s140.simple(raw_tweet), function (error, response, body) {
				        	// handle response from Sentiment140 API
				          	if (!error && response.statusCode == 200) {
				            	try {
				            		//console.log(body);
				              		var polarised_tweet = JSON.parse(body);
				              		// tell the world!
				              		socket.emit(broadcastChannel, {'raw_tweet': raw_tweet, 'polarised_tweet': polarised_tweet });
								} catch (err) {
				            		console.error('JSON did not parse. ' + err);
				            	}
				          	} else {
				          		console.log('GET request to Sentiment140 API failed');
				          		console.error('Response:' + response + ' | Error:' + error);
						  	}
						});
				    });

				    stream.on('end', function (response) {
						// Handle a disconnection
					});
					
					stream.on('destroy', function (response) {
						// Handle a 'silent' disconnection from Twitter, no end/error event fired
					});
			    }
			);
		} else {
			console.log('Credential verification failed');
			console.error(err);
		}
	});
}