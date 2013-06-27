/*
 * @description: node.js server
 * @author: @hadi_michael
 * @date: May 2013
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

// start the server
try {
	server.listen(8080);
	console.log('Server is listening on port: ' + 8080);
} catch (err) {
	console.error('Server didn\'t start: ' + err);
}
/***** /SETUP AND START SERVER *****/

/***** MANAGE SOCKETS *****/
io.set('log level', 2); // set socket.io logging (Log levels: 0 - error / 1 - warn / 2 - info / 3 - debug)
io.sockets.on('connection', function (socket) {

	console.log('New user connected: ' + socket.id);
  	socket.emit('connected', { hello: 'Welcome to the party!' });

  	/* define socket events */
  	socket.on('tunein', function(something) {
		//TODO: add this person the list of people listening to the stream...
	});
	
	socket.on('stream.track', function(keywords) {
		require('./server/stream').track(socket, keywords);
	});
	
	socket.on('stream.follow', function(userIDs) {
		require('./server/stream').follow(socket, userIDs);
	});

	socket.on('search', function(keywords) {
		//COMING SOON!
		//require('./server/search').search(keywords);
	});

	socket.on('disconnect', function () {
    	console.log('User disconnected - Damn... I thought they liked us!');
  	});

});
/***** /MANAGE SOCKETS *****/