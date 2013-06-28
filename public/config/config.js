/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
 *
 */

$(function(){
    // adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = window.location.origin + '/socket.io/socket.io.js';

    script.onload = function() { 
        var socket = io.connect(window.location.origin); 

        socket.on('connected', function (message) {
            console.log(message); //display message

            var keywords = ['new york', 'lunch'];
            socket.emit('stream.track', keywords);
        });
    };

    // fire
    head.appendChild(script);
});