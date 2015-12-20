require('events').EventEmitter.prototype._maxListeners = 100;
var location = 'Dallas' // Write where you're tweeting from!<br> 
// Node requires
var fs = require('fs');
var https = require('https');
var crypto = require('crypto');
 
// Set up to Tweet
var bound = require('crypto').pseudoRandomBytes(16).toString('hex');
var ctype = 'multipart/form-data; boundary=' + bound;
 
// Tweeting as @TesselTweet

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
 



var mqtt = require('mqtt');
var fs = require('fs');
//var configFile = "./device.cfg";
//var caCerts = ["./IoTFoundation.pem", "./IoTFoundation-CA.pem"];

var qs_mode = true;
var port = 1883;
var s_port = 8883;
var broker = "quickstart.messaging.internetofthings.ibmcloud.com";
var topic;
var client;

//var options = {};
var clientId;
// Set the configuration used when no device.cfg is present
var organization = "kcrmbp";
var deviceType = "tessel";

//options.username = "use-token-auth"; // Actual value of options.username can be set to any string
var password = "m!VgS09&Xn&DtfcNos";
var macAddress = "myTessel";


broker = organization + ".messaging.internetofthings.ibmcloud.com";
        clientId = "d:" + organization + ":" + deviceType + ":" + macAddress;

        client = mqtt.connect("mqtt://" + broker + ":" + port, {
            "clientId": clientId,
            "keepalive": 10000,
            "username": "use-token-auth",
            "password": password
        });
        
topic = "iot-2/evt/status/fmt/json";

// Subscribe and Publish
client.subscribe('iot-2/cmd/+/fmt/+', {
    qos: 1
}, function(err, granted) {
    if (err) throw err;
    console.log("subscribed");
});

/*client.on('error', function(err) {
    console.error('client error ' + err);
    process.exit(1);
});*/


        
        
var tessel = require('tessel');
var camera = require('camera-vc0706').use(tessel.port['A']);
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port['B']);


ambient.on('ready', function () {
 // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, ldata) {
      if (err) throw err;
      ambient.getSoundLevel( function(err, sdata) {
        if (err) throw err;
        console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
        
            /*var message = {};
            message.d = {};
            message.d.Message = "Hello";
            message.d.LightLevel = ldata.toFixed(8);
            message.d.SoundLevel = sdata.toFixed(8);
            *///console.log(message);
            //client.publish(topic, JSON.stringify(message));
            //console.log(message);
    });
  })}, 10000); // The readings will happen every .5 seconds unless the trigger is hit

  ambient.setLightTrigger(0.5);

  // Set a light level trigger
  // The trigger is a float between 0 and 1
 /* ambient.on('light-trigger', function(data) {
    console.log("Our light trigger was hit:", data);

    // Clear the trigger so it stops firing
    ambient.clearLightTrigger();
    //After 1.5 seconds reset light trigger
    setTimeout(function () {

        ambient.setLightTrigger(0.1);

    },1500);
  });*/

  // Set a sound level trigger
  // The trigger is a float between 0 and 1
  ambient.setSoundTrigger(0.5);

  /*ambient.on('sound-trigger', function(data) {
    console.log("Something happened with sound: ", data);

    // Clear it
    ambient.clearSoundTrigger();

    //After 1.5 seconds reset sound trigger
    setTimeout(function () {

        ambient.setSoundTrigger(0.1);

    },1500);

  });*/
});

/*ambient.on('error', function (err) {
  console.log(err)
});*/

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

// Wait for the camera module to say it's ready
camera.on('ready', function() {
  notificationLED.high();
  //camera.setCompression(1, null);
  
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
        post('Live Tweeting from @rondagdag #tesselcamhack! #atthack' + location, image);
        
        console.log('done.');
        // Turn the camera off to end the script
        //camera.disable();
      }
    });
  });
  


  ambient.on('sound-trigger', function(data) {
    console.log("Something happened with sound: ", data);
    camera.setCompression(1, null);
  
    camera.takePicture(function(err, image) {
      if (err) {
        console.log('error taking image', err);
      } else {
        notificationLED.low();
        // Name the image
        var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
        // Save the image
        console.log('Picture saving as', name, '...');
        post('Live Tweeting from @rondagdag #tesselcamhack! #atthack ' + location, image);
        //post('Tweeting from @rondagdag #tesselcam! ' + location, image);
        
        console.log('done.');
      }
    });
    // Clear it
    ambient.clearSoundTrigger();

    //After 1.5 seconds reset sound trigger
    setTimeout(function () {

        ambient.setSoundTrigger(0.5);

    },1500);

  });
  
  
  client.on('message', function(topic, message, packet) {
    console.log('Message received on topic: ' + topic);
    //var msg = JSON.parse(message.toString());
    //console.log(msg);
    //camera.setCompression(1, null);
    camera.takePicture(function(err, image) {
      if (err) {
        console.log('error taking image', err);
      } else {
        notificationLED.low();
        // Name the image
        var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
        // Save the image
        console.log('Picture saving as', name, '...');
        post('Live Tweeting from @rondagdag #tesselcamhack! #atthack ' + location, image);
        //post('Tweeting from @rondagdag #tesselcam! ' + location, image);
        
        console.log('done.');
      }
    });
  });
  
});

camera.on('error', function(err) {
  console.error(err);
});


