// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic climate example logs a stream
of temperature and humidity to the console.
*********************************************/

var tessel = require('tessel');
// if you're using a si7020 replace this lib with climate-si7020
var climatelib = require('climate-si7020');

var climate = climatelib.use(tessel.port['A']);


//*****************************************************************************
// Copyright (c) 2014 IBM Corporation and other Contributors.
//
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v1.0
// which accompanies this distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html 
//
// Contributors:
//  IBM - Initial Contribution
//*****************************************************************************

// IoT Cloud QuickStart Driver
// A sample IBM Internet of Things Cloud Quickstart Service client for Intel Galileo

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

//var wifi = require('wifi-cc3000');
    //macAddress = wifi.macAddress();
    //macAddress = macAddress.toString().replace(/:/g, '').toLowerCase();

    //console.log(macAddress);
    //require('properties').parse(configFile, { path: true }, function (err, config){
        var options = {};
        
        // Set the configuration used when no device.cfg is present
        var organization = "kcrmbp";
        var deviceType = "tessel";
        
        options.username = "use-token-auth"; // Actual value of options.username can be set to any string
        options.password = "m!VgS09&Xn&DtfcNos";
        macAddress = "myTessel";

        broker = organization + ".messaging.internetofthings.ibmcloud.com";
        qs_mode = true;
    
        
        options.clientId = "d:" + organization + ":" + deviceType + ":" + macAddress;
        if (qs_mode) {
            client = mqtt.createClient(port, broker, options);
        } else {
            options.ca = caCerts;
            options.rejectUnauthorized = true;
            client = mqtt.createSecureClient(s_port, broker, options);
        }
        topic = "iot-2/evt/status/fmt/json";

        //var interval = setInterval(sendMessage,1000);

        /*    client.subscribe('iot-2/cmd/+/fmt/json');

            client.on('message', function(topic, message) {
                console.log('Received command on topic: ' + topic);
                
                var msg;
                try {
                    msg = JSON.parse(message);
                }
                catch (e) {
                    msg = {};
                    console.log("Couldn't parse recieved command. Please ensure it is valid JSON.");
                }

                if(msg.hasOwnProperty('send-status')){
                    if(msg['send-status']){
                        if(!interval){
                            interval = setInterval(sendMessage,1000);
                        }
                    }
                    else {
                        clearInterval(interval);
                        interval = false;
                    }
                }
            });
          
        
        console.log("Broker: " + broker);
        console.log("Device ID: " + macAddress);
        console.log("Topic: " + topic);
        console.log("Connection options: ");
        console.log(options);*/
    //});


var lastTemp = 0;
var lastHumid = 0;
function sendMessage() {
    var message = {};
    message.d = {};
    //read the CPU temp from sysfs
    /*fs.readFile('/sys/class/thermal/thermal_zone0/temp','utf8', function (err, data) {
        if (err) throw err;
        message.d.cputemp = data/1000;
        console.log(message);
        client.publish(topic, JSON.stringify(message));
    });*/
    message.d.Message = "Hello";
/*	message.d.Temperature = lastTemp;
    message.d.Humidity = lastHumid;*/
    console.log(message);
    client.publish(topic, JSON.stringify(message));
}


climate.on('ready', function () {
  console.log('Connected to si7020');

  // Loop forever
  setImmediate(function loop () {
    climate.readTemperature('f', function (err, temp) {
      climate.readHumidity(function (err, humid) {
          
        var message = {};
        message.d = {};
        message.d.Temperature = temp.toFixed(4);
        message.d.Humidity = humid.toFixed(4);
        console.log(message);
        client.publish(topic, JSON.stringify(message));
        //console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
        setTimeout(loop, 300);
        //lastTemp = temp.toFixed(4);
        //lastHumid = humid.toFixed(4);
      });
    });
  });
});

climate.on('error', function(err) {
  console.log('error connecting module', err);
});
