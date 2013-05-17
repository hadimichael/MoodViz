/*
 * scripts.js -> primary JavaScript code
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

var socket = io.connect('http://localhost:' + ports.getWebsocketPort());

var data = {
    keywords: ['obama AND health care'], // in an array format
    mode: 'search',
    respondOn: 'tweet',
}

socket.on('connected', function (message) {
    console.log(message); //display message

    //socket.emit('getTweets', data);
});

socket.on(data.respondOn, function (data) {
    var tweet = "Polarity: " + data.results.polarity.toString() + " for: " + data.results.text.toString();
    addtext(tweet);
});

var isMobile = {
      Android: function() {
            return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
};