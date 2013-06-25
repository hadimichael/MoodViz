/*
 * getTweets.js -> does the cool stuff...
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

var request 	= require('request'),
	ntwitter 	= require('ntwitter'),
	//load app credentials
	app_creds 	= require('./app_credentials'), //see app_credentials__template.js
	oauth 		= app_creds.getOAuthSettings(),
	accesstoken = app_creds.getAccessToken(),
	s140_appId	= app_creds.getSentiment140AppId();

/* create a twitter object using ntwitter */
console.log('Creating twitter object...');
var twitter = new ntwitter({
	consumer_key: oauth.consumer_key,
	consumer_secret: oauth.consumer_secret,
	access_token_key: accesstoken.access_token_key,
	access_token_secret: accesstoken.access_token_secret
});
/* /create a twitter object using ntwitter */

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

/* get and polarise tweets */
exports.getTweets = function (socket, data) {
	// define topics to watch on twitter
	var keywords = data.keywords;
	var mode = data.mode;
	var respondOn = data.respondOn;

	// verify login details
	console.log('Verifying twitter credentials...');

	twitter.verifyCredentials(function (err, data) {
		if (err == null) {
			console.log('Credentials verified for: ' + data.name + '\n' + 'starting: ' + mode + ' for ' + keywords);

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
			                		//console.log(body);

			                  		var tweet_polarised = JSON.parse(body);
			                  		socket.emit(respondOn, {'raw_tweet': raw_tweet, 'tweet_polarised': tweet_polarised });
								} catch (err) {
			                		console.error('JSON did not parse. Error: ' + err);
			                	}
			              	} else {
			              		console.log('GET request to Sentiment140 API failed');
			              		console.error('Response:' + response + ' | Error:' + error);
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
}
/* /get and polarise tweets */