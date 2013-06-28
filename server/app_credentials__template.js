/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
 *
 */

//TODO: 1. Plug in your twitter credentials below: consumer_key, consumer_secret, access_token_key, access_token_secret
//		2. Plug in your Sentiment 140 API App Id
//		3. Rename this file to: app_credentials.js

exports.getOAuthSettings = function (appName) {
	return { 
  		consumer_key: '', 	// TODO: YOUR CONSUMER KEY AS A STRING */
	  	consumer_secret: '' // TODO: YOUR CONSUMER SECRET AS A STRING */
  	};
}

exports.getAccessToken = function (appName) {
	return { 
  		access_token_key: '', 	// TODO: YOUR ACCESS TOKEN KEY AS A STRING */
		access_token_secret: '' // TODO:  YOUR ACCESS TOKEN SECRET AS A STRING */
  	};
}

exports.getSentiment140AppId = function (appName) {
	return ''; // TODO: YOUR SENTIMENT140 APP ID AS A STRING */
}