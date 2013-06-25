/*
 * app_credentials__template.js -> getters for app credentials
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

//TODO: 1. Plug in your twitter credentials below: consumer_key, consumer_secret, access_token_key, access_token_secret
//		2. Plug in your Sentiment 140 API App Id
//		3. Rename this file to: app_credentials.js

exports.getOAuthSettings = function (appName) {
	switch (appName) {
		case 'MoodViz':
			return { 
		  		consumer_key: '', // TODO: YOUR CONSUMER KEY AS A STRING */
			  	consumer_secret: '' // TODO: YOUR CONSUMER SECRET AS A STRING */
		  	};
		default:
			throw new Error('No OAuth Settings were found for ' + appName);
			return null;
	};
}

exports.getAccessToken = function (appName) {
	switch (appName) {
		case 'MoodViz':
			return { 
		  		access_token_key: '', // TODO: YOUR ACCESS TOKEN KEY AS A STRING */
	  			access_token_secret: '' // TODO:  YOUR ACCESS TOKEN SECRET AS A STRING */
		  	};
		default:
			throw new Error('No access token was found for ' + appName);
			return null;
	};
}

exports.getSentiment140AppId = function (appName) {
	switch (appName) {
		case 'MoodViz':
			return ''; // TODO: YOUR SENTIMENT140 APP ID AS A STRING */
		default:
			throw new Error('No Sentiment140 App Id was found for ' + appName);
			return null;
	};
}