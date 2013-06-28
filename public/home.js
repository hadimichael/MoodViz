/*
 *
 * @author: @hadi_michael
 * @date: May-July 2013
 *
 */

$(function(){
    $.ajax({
      url: window.location.origin + '/tunein',
      error: function(error) {
        console.log("Couldn't work out which channel to tune in to...")
      },
      success: function(channel) {
        startSockets(channel);
      }
    });

    function startSockets(channel) {
      // adding the script tag to the head as suggested before
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      //script.src = window.location.origin.replace(ports.getFileServerPort().toString(),ports.getWebsocketPort().toString()) + '/socket.io/socket.io.js';
      script.src = window.location.origin + '/socket.io/socket.io.js';

      script.onload = function() { 
          var socket = io.connect(window.location.origin); 

          var tickerCount = 0, tickerSize = 5;
          
          socket.on('connected', function (message) {
              console.log(message); //display message
              
              //set start time
              var starttime = new Date();
              $('#starttime').text(starttime.today() + " at " + starttime.timeNow());

              socket.on(channel, function (response) {
                console.log(response);

                var polarity = getPolarity(response.polarised_tweet.results.polarity.toString());
                
                //
                var $res = $('<li class=\'' + polarity + '\'><span class=\'ticker-image\'>');
                $res.append('<img src="' + response.raw_tweet.user.profile_image_url.toString() + '" /></span>');
                $res.append('<span class=\'ticker-text\'>' + response.polarised_tweet.results.text.toString() + '</span>');
                $res.prependTo($('#recent_tweets_ticker'));
                tickerCount++;

                if (tickerCount > tickerSize) { $('#recent_tweets_ticker li:last').remove(); } 
                //

                updateUI(message.currently); 
              });
          });
      };

      head.appendChild(script);
    }

    /* manage UI */
    Date.prototype.today = function(){ 
      return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear() 
    };

    Date.prototype.timeNow = function(){
      return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();// +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    };

    var stats = {
      positives: 0,
      undetermined: 0,
      negatives: 0
    }

    function getPolarity(polarity) {
      switch (polarity) {
        case '0':
          stats.negatives++;
          return 'negative';
          break;

        case '2':
          stats.undetermined++;
          return 'undetermined';
          break;

        case '4':
          stats.positives++;
          return 'positive';
          break;

        default:
          console.log('Polarity not understood');
          return null;
      }
    }

    function updateUI(action) {
      $('#doing').text(action.doing);
      $('#what').text(action.what.toString());

      $('#positive').text(stats.positives);
      $('#undetermined').text(stats.undetermined);
      $('#negative').text(stats.negatives);
      //$('#total').text(stats.positives+stats.undetermined+stats.negatives);

      // adjust scoreboard
      var width = $(window).width();
      $('#scoreboard_positive').width(stats.positives*width/(stats.positives+stats.negatives));
      $('#scoreboard_negative').width(stats.negatives*width/(stats.positives+stats.negatives));
    }
});