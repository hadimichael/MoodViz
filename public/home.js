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

    $.ajax({
      url: FB_ACCESS_TOKEN_QUERY_URL,
      error: function(error) {
        //response.write("{\"response\": false, \"message\": \"Could not secure an access token.\"}");
        //response.end(); 
        //TODO: maybe send us an email or issue an admin dashboard notification
      },
      success: function(accesstoken) {
        // fire the loading
    head.appendChild(script);
  }

    // adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    //script.src = window.location.origin.replace(ports.getFileServerPort().toString(),ports.getWebsocketPort().toString()) + '/socket.io/socket.io.js';
    script.src = window.location.origin + '/socket.io/socket.io.js';

    script.onload = function() { 
        var socket = io.connect(window.location.origin); 

        socket.on('connected', function (message) {
            console.log(message); //display message

            socket.on('helloworld', function (data) {
                console.log(data);
            });
        });
        };

        
        /*
        var getTweets_data = {
          keywords: ['telstra', 'new york'], // in an array format
          mode: 'stream',
          respondOn: 'tweet',
        }

        socket.on('connected', function (message) {
            console.log(message); //display message
            console.log("asdfasdfasdF: " + socket.id)
            // //USE THIS TO DEBUG THE UI!
            // counter = 0;
            // for (var i = 0;i<5;i++) {
            //   if (counter > 4) {counter = 0}
            //   var polarity = getPolarity(counter.toString());
            //   var $res = $('<li class=\'' + polarity + '\'>');
            //   $res.append('<img src=\"https://si0.twimg.com/profile_images/3355622120/abe783444f418c35d3aff56f6ba98d6a_bigger.png\" />');
            //   $res.append('<span class=\'ticker-text\'>' + 'This is a short tweet about this cool website' + '</span>');
            //   $res.prependTo($('#recent_tweets_ticker'));
            //   counter += 2;
            // }
            // updateStats(getTweets_data);
            // return;

            //set start time
            var starttime = new Date();
            $('#starttime').text(starttime.today() + " at " + starttime.timeNow());

            // make a request for tweets
            //socket.emit('getTweets', getTweets_data);
            socket.emit('stream.track', getTweets_data.respondOn, getTweets_data.keywords);
        });

        var tickerCount = 0, tickerSize = 5;
        socket.on(getTweets_data.respondOn, function (response) {
            //var tweet = "Polarity: " + response.tweet_polarised.results.polarity.toString() + " for: " + response.tweet_polarised.results.text.toString();
            console.log(response);

            var polarity = getPolarity(response.tweet_polarised.results.polarity.toString());
            var $res = $('<li class=\'' + polarity + '\'><span class=\'ticker-image\'>');
            $res.append('<img src="' + response.raw_tweet.user.profile_image_url.toString() + '" /></span>');
            $res.append('<span class=\'ticker-text\'>' + response.tweet_polarised.results.text.toString() + '</span>');
            $res.prependTo($('#recent_tweets_ticker'));
            tickerCount++;

            if (tickerCount > tickerSize) { $('#recent_tweets_ticker li:last').remove(); } 

            updateStats(getTweets_data);           
        });
        */


    

    function getPolarity(polarity) {
      switch (polarity) {
        case '0':
          stats.negatives++;
          return 'negative';
          break;

        case '2':
          stats.neutrals++;
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

    function updateStats(getTweets_data) {
      $('#keywords').text(getTweets_data.keywords);

      $('#positive').text(stats.positives);
      $('#neutral').text(stats.neutrals);
      $('#negative').text(stats.negatives);
      $('#total').text(stats.positives+stats.neutrals+stats.negatives);

      //prepare data for graph
      var data = [
        { label: "Positive",  data: stats.positives, color: 'rgba(0, 255, 0, .5)'},
        { label: "Negative",  data: stats.negatives, color: 'rgba(255, 0, 0, .5)'},
      ];

      var width = $(window).width();
      $('#scoreboard_positive').width(stats.positives*width/(stats.positives+stats.negatives));
      $('#scoreboard_negative').width(stats.negatives*width/(stats.positives+stats.negatives));

      // plot on DONUT
      /*plot($("#donut"), data, 
      {
        series: {
          pie: { 
            innerRadius: 0.3,
            show: true,
            stroke: {
              width: 0
            },
          }
        },
      });*/
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