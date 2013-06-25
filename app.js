/*
 * app.js -> node.js server for MoodViz
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

/* include and setup required packages */
var appName		= 'MoodViz',
	express 	= require('express'),
    app     	= express(),
    http 		= require('http'),
	server 		= http.createServer(app), 
	io  		= require('socket.io').listen(server);

/***** HANDLE Uncaught Exceptions *****/
process.on('uncaughtException', function(err) {
  	console.error(err.stack);
});
/***** /HANDLE Uncaught Exceptions *****/

/***** SETUP AND START SERVER *****/
// configure the server
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
  	app.use(express.errorHandler({
    	dumpExceptions: true, 
    	showStack: true
	}));
});

try {
	server.listen(8080);
	console.log('Server is listening on port: ' + 8080);
} catch (err) {
	console.error(err);
}
/***** /SETUP AND START SERVER *****/

/***** MANAGE SOCKETS *****/
io.set('log level', 2); // reduce logging (Log levels: 0 - error / 1 - warn / 2 - info / 3 - debug)
io.sockets.on('connection', function (socket) {

  	socket.emit('connected', { hello: 'Welcome to the party!' });

  	socket.on('getTweets', function(data) {
		require('./server/getTweets').getTweets(socket, data);
	});

	socket.on('disconnect', function () {
    	console.log('user disconnected - I know... I also thought they liked us!');
  	});

});
/***** /MANAGE SOCKETS *****/