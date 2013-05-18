/*
 * scripts.js -> primary JavaScript code
 *
 * Author: @hadi_michael
 * Date: May 2013
 *
 */

$(function(){
    var stats = {
      positives: 0,
      neutrals: 0,
      negatives: 0,
      total: 0,
    }

    Date.prototype.today = function(){ 
      return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear() 
    };

    Date.prototype.timeNow = function(){
      return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();// +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    };

    // adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://localhost:' + ports.getWebsocketPort() + '/socket.io/socket.io.js';
    //script.onreadystatechange = MoodViz.init();

    script.onload = function() { 
        var socket = io.connect('http://localhost:' + ports.getWebsocketPort()); 

        var getTweets_data = {
          keywords: ['obama', 'new york'], // in an array format
          mode: 'stream',
          respondOn: 'tweet',
        }

        socket.on('connected', function (message) {
            console.log(message); //display message

            socket.emit('getTweets', getTweets_data);
        });

        var tickerCount = 0, tickerSize = 5;
        socket.on(getTweets_data.respondOn, function (response) {
            //var tweet = "Polarity: " + response.tweet_polarised.results.polarity.toString() + " for: " + response.tweet_polarised.results.text.toString();
            //addtext(tweet);
            //console.log(response);
            var polarity = getPolarity(response.tweet_polarised.results.polarity.toString());
            var $res = $('<li class=\'' +  + '\'><span class=\'ticker-image\'>');
            $res.append('<img src="' + response.raw_tweet.user.profile_image_url.toString() + '" /></span>');
            $res.append('<span class=\'ticker-text\'>' + response.tweet_polarised.results.text.toString() + '</span>');
            $res.prependTo($('#recent_tweets_ticker'));
            tickerCount++;

            if (tickerCount > tickerSize) { $('#recent_tweets_ticker li:last').remove(); }

            
        });
    };

    // fire the loading
    head.appendChild(script);

    function getPolarity(polarity) {
      switch (polarity) {
        case '0':
          stats.negative++;
          return 'negative';
          break;

        case '2':
          stats.neutral++;
          return 'neutral';
          break;

        case '4':
          stats.positives++;
          return 'positive';
          break;

        default:
          console.log('Polarity unknown');
          return null;
      }
    }

    function updateStats() {
      $('positive').text(stats.positive);
      $('neutral').text(stats.neutral);
      $('negative').text(stats.negative);
      $('positive').text(stats.positive+stats.neutral+stats.negative);
    }
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