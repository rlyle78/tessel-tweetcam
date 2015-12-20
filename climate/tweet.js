// Node requires
var twitter = require('twitter');
var util = require('util')

var twitterHandle = '@technicalhumans';
// The status to tweet
var status = 'Hello ' + twitterHandle + '. This is your #Tessel speaking.';

// Enter the oauth key and secret information
var twit = new twitter({
  consumer_key: 'O7oc0pvsZn4xjgcuHuYdX4FaC',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

// Make a tweet!
twit.updateStatus(status, function(data) {
  if (data.name === 'Error') {
    console.log('error sending tweet!', data.message);
  }
  else {
    console.log('tweet successful!');
  }
});
