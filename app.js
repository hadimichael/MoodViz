/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
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
// route to allow front-end to retrieve broadcast channel
app.get('/tunein', function(req,res) {
	res.send(require('./server/tunein').getChannel());
});

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
var action = { doing: 'doing', to: 'no one :(' };
io.set('log level', 2); // set socket.io logging (Log levels: 0 - error / 1 - warn / 2 - info / 3 - debug)
io.sockets.on('connection', function (socket) {

	console.log('New user connected: ' + socket.id);
  	socket.emit('connected', { hello: 'Welcome to the party!', currently: action });

  	/* define socket events */	
	socket.on('stream.track', function(keywords) {
		require('./server/stream').track(io, keywords);
		action = { doing: 'Tracking', to: keywords };
	});
	
	socket.on('stream.follow', function(userIDs) {
		require('./server/stream').follow(io, userIDs);
		action = { doing: 'Following', to: userIDs };
	});

	socket.on('search', function(keywords) {
		//COMING SOON!
		//require('./server/search').search(keywords);
		//action.doing = "searching";
		//action.what = keywords;
	});

	socket.on('disconnect', function () {
    	console.log('User disconnected - Damn... I thought they liked us!');
  	});

});
/***** /MANAGE SOCKETS *****/