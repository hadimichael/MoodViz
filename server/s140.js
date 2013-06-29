/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
 *
 */

var app_creds 	= require('./app_credentials'), //see app_credentials__template.js
	s140_appId 	= app_creds.getSentiment140AppId();

/* Prepare request for Sentiment140 API */
var s140_requestBuilder = {
	url				: 'http://www.sentiment140.com/api/',
	simpleClassify 	: 'classify',
	bulkClassify 	: 'bulkClassifyJson',
	appId 			: '?appid=' + s140_appId
}

exports.simple = function(tweet) {
	try {
		var text = "?text=" + tweet.text.replace(/\s/g,"+");
		return s140_requestBuilder.url + s140_requestBuilder.simpleClassify + text;
	} catch (err) {
		console.error('Could not build simple request. Error: ' + err);
		return null;
	}		
}

exports.bulk = {
	getUrl: function() {
		return s140_requestBuilder.url + s140_requestBuilder.bulkClassify + s140_requestBuilder.appId;
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
/* /Prepare request for Sentiment140 API */