/*
 * ports.js -> getters for ports
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

// define global getters within a ports object
var ports = {
	getFileServerPort: function() {
		return 8080;
	},

	getWebsocketPort: function() {
		return 3000;
	}
}

// if an exports object exists, then we're probably on node - create the getters
if (typeof exports == 'object') {
	exports.getFileServerPort = function (appName) {
		return ports.getFileServerPort();
	}

	exports.getWebsocketPort = function (appName) {
		return ports.getWebsocketPort();
	}
}
