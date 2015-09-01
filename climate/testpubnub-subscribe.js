var pubnub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-9b38a227-9c98-42dd-af43-bd09a3eff137",
    subscribe_key : "sub-c-6d9eb720-2f24-11e5-bda8-02ee2ddab7fe"
});

  pubnub.subscribe({
        channel  : "my_channel",
        callback : function(message) {
                        console.log( " > ", message );
                        console.log(message.command);
                }
        });
