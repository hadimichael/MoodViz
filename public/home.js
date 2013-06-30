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
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = window.location.origin + '/socket.io/socket.io.js';

      script.onload = function() { 
          var socket = io.connect(window.location.origin); 

          //
          var tickerCount = 0, tickerSize = 5;
          //

          socket.on('connected', function (message) {
              console.log(message); //display message
              
              //set start time
              $('#doing').text(message.currently.doing);
              $('#to').text(message.currently.to.toString());
              $('#starttime').text(new Date()); //new Date().timeNow() + " on " + new Date().today()

              /* DEBUG THE TICKER */
              counter = 0;
              // for (var i = 0;i<5;i++) {
              //   if (counter > 4) {counter = 0}
              //   var polarity = getPolarity(counter.toString());
              //   var $res = $('<li>');
              //   $res.append('<span class=\'ticker-indicator ' + polarity + '\'></span>')
              //   $res.append('<span class=\'ticker-image\'><img src=\"https://si0.twimg.com/profile_images/3355622120/abe783444f418c35d3aff56f6ba98d6a_bigger.png\" /></span>');
              //   $res.append('<span class=\'ticker-text\'>' + 'This is a short tweet about this cool website This is a short tweet about this cool website This is a short tweet about this cool website This is a short tweet about this cool website This is a short tweet about this cool website' + '</span>');
              //   $res.append('</li>');
              //   $res.prependTo($('#recent_tweets_ticker'));
              //   counter +=2
              // }
              // updateStats(getTweets_data);
              // return;
              /* /DEBUG THE TICKER */

              socket.on(channel, function (response) {
                console.log(response);

                var polarity = getPolarity(response.polarised_tweet.results.polarity.toString());
                
                //
                var $res = $('<li>');
                $res.append('<span class=\'ticker-indicator ' + polarity + '\'></span>')
                $res.append('<span class=\'ticker-image\'><img src=\"' + response.raw_tweet.user.profile_image_url.toString() + '\" /></span>');
                //$res.append('<span class=\'ticker-text\'>@' + response.raw_tweet.user.screen_name.toString() + ': <i>' + response.raw_tweet.text.toString() + '</i></span>');
                $res.append('<span class=\'ticker-text\'>' + response.raw_tweet.text.toString() + '</span>');
                $res.append('</li>');
                $res.prependTo($('#recent_tweets_ticker'));
                tickerCount++;
                if (tickerCount > tickerSize) { $('#recent_tweets_ticker li:last').remove(); } 
                //

                updateUI(message.currently); 
              });
          });
      };

      // adding the script tag to the head
      head.appendChild(script);
    }

    /* manage UI */
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
      $('#positive').text(stats.positives);
      $('#undetermined').text(stats.undetermined);
      $('#negative').text(stats.negatives);
      $('#total').text(stats.positives+stats.undetermined+stats.negatives);

      // adjust scoreboard
      var width = $(window).width();
      $('#scorebar_positive').width(stats.positives*width/(stats.positives+stats.negatives));
      $('#scorebar_negative').width(stats.negatives*width/(stats.positives+stats.negatives));
    }

    Date.prototype.timeNow = function(){
      return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();// +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    };

    Date.prototype.today = function(){ 
      return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear() 
    };
});