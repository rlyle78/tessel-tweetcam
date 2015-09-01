var location = 'Dallas' // Write where you're tweeting from!<br> 
// Node requires
var fs = require('fs');
var https = require('https');
var crypto = require('crypto');
 
// Set up to Tweet
var bound = require('crypto').pseudoRandomBytes(16).toString('hex');
var ctype = 'multipart/form-data; boundary=' + bound;
 
// Tweeting as @TesselTweet
var oauth_consumer_key = "RDlsNYcqYBfOC8srsGm19b1BG";
var oauth_consumer_secret = "v22YyPwXPpILBnsVPLqbyflDi7I1EyFJi8uihrRRZBWSW9ZQ4L";
var oauth_access_token = "23726093-1WMMGPjqpMMeDC8NBOpD2cd4uRUfmh8cvusSqcnOK";
var oauth_access_secret = "Fnst4LZp1M83JmHXglIwHfAePL3D4nIhaCibvfErhoH5u";
 
// Get time
var curtime = parseInt(process.env.DEPLOY_TIMESTAMP || Date.now());
 
// Set up OAuth
var oauth_data = {
    oauth_consumer_key: oauth_consumer_key,
    oauth_nonce: require('crypto').pseudoRandomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(curtime / 1000),
    oauth_token: oauth_access_token,
    oauth_version: '1.0'
};
 
var out = [].concat(
    ['POST', 'https://api.twitter.com/1.1/statuses/update_with_media.json'],
    (Object.keys(oauth_data).sort().map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(oauth_data[k]);
    }).join('&'))
).map(encodeURIComponent).join('&');
 
oauth_data.oauth_signature = crypto
  .createHmac('sha1', [oauth_consumer_secret, oauth_access_secret].join('&'))
  .update(out)
  .digest('base64');
 
var auth_header = 'OAuth ' + Object.keys(oauth_data).sort().map(function (key) {
    return key + '="' + encodeURIComponent(oauth_data[key]) + '"';
}).join(', ');
 
function post (status, file) {
    var req = https.request({
        port: 443,
        method: 'POST',
        hostname: 'api.twitter.com',
        path: '/1.1/statuses/update_with_media.json',
        headers: {
            Host: 'api.twitter.com',
            'Accept': '*/*',
            "User-Agent": "tessel",
            'Authorization': auth_header,
            'Content-Type': ctype,
            'Connection': 'keep-alive'
        }
    }, function (res) {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);
 
      res.on('data', function(d) {
        console.log(' ');
        console.log(' ');
        console.log(String(d));
      });
    });
 
    req.write('--' + bound + '\r\n');
    req.write('Content-Disposition: form-data; name="status"\r\n');
    req.write('\r\n');
    req.write(status + '\r\n');
    req.write('--' + bound + '\r\n');
    req.write('Content-Type: application/octet-stream\r\n');
    req.write('Content-Disposition: form-data; name="media[]"; filename="test.jpg"\r\n');
    req.write('\r\n');
    req.write(file);
    req.write('\r\n');
    req.write('--' + bound + '--\r\n');
    req.end();
 
    req.on('error', function(e) {
      console.error(e);
    });
}
 

var pubnub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-9b38a227-9c98-42dd-af43-bd09a3eff137",
    subscribe_key : "sub-c-6d9eb720-2f24-11e5-bda8-02ee2ddab7fe"
});

var tessel = require('tessel');
var camera = require('camera-vc0706').use(tessel.port['A']);

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

// Wait for the camera module to say it's ready
camera.on('ready', function() {
  console.log("ready");
  notificationLED.high();
  
    pubnub.subscribe({
        channel  : "my_channel",
        callback : function(message) {
                        console.log( " > ", message );
                        console.log(message.command);
                        
                        camera.takePicture(function(err, image) {
                        if (err) {
                            console.log('error taking image', err);
                        } else {
                            notificationLED.low();
                            // Name the image
                            var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
                            // Save the image
                            console.log('Picture saving as', name, '...');
                            //process.sendfile(name, image);
                            
                            //post('Tweeting from @rondagdag #tesselcam! @atthack ' + location, image);
                            post('Tweeting from @rondagdag #tesselcam! ' + location, image);
                            
                            console.log('done.');
                            // Turn the camera off to end the script
                            //camera.disable();
                        }
                        });
                }
        });
        
  // Take the picture
  tessel.button.on('press', function () {
    camera.takePicture(function(err, image) {
      if (err) {
        console.log('error taking image', err);
      } else {
        notificationLED.low();
        // Name the image
        var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
        // Save the image
        console.log('Picture saving as', name, '...');
        //process.sendfile(name, image);
        
        //post('Tweeting from @rondagdag #tesselcam! @atthack ' + location, image);
        post('Tweeting from @rondagdag #tesselcam! ' + location, image);
        
        console.log('done.');
        // Turn the camera off to end the script
        //camera.disable();
      }
    });
  });
});

camera.on('error', function(err) {
  console.error(err);
});

