/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
 *
 */

function submit() {
    var action = {
        doing: $('input[name="action.doing"]:checked').val(),
        to: $('input[name="text"]').val().split(',')
    }
    
    if (action.doing == '' || action.to == '') {alert('missing content');return;}

    document.write("Doing stuff. Please wait...");

    $.ajax({
        url: window.location.origin + '/tunein',
        error: function(error) {
            console.log("Couldn't work out which channel to tune in to...")
        },
        success: function(channel) {
            // adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = window.location.origin + '/socket.io/socket.io.js';

            script.onload = function() { 
                var socket = io.connect(window.location.origin); 

                socket.on('connected', function (message) {
                    console.log(message); //display message

                    //var keywords = ['new york', 'lunch'];
                    socket.emit(action.doing, action.to);
                });

                socket.on(channel, function (response) {
                    console.log(response);
                    document.write(JSON.stringify(response));
                });
            };

            // fire
            head.appendChild(script);
        },
    });
}
