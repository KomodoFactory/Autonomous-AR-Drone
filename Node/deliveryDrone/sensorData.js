/**
 * Created by Domi on 10.01.2017.
 */

var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
    .after(10000, function() {
        this.stop();
        this.land();
    });