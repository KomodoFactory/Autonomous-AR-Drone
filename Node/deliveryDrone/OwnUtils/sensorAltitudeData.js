/**
 * Created by Domi on 10.01.2017.
 */

var arDrone = require('ar-drone');
var client = arDrone.createClient();
var gpsActivationCode = 77060865;

client.config('general:navdata_demo', false);
//client.config('general:navdata_options', gpsActivationCode);

client.takeoff();

client.on('navdata', function (d) {
    if (d.gps) {
        console.log("Coordinates: ");
        console.log(d.gps.latitude + ', ' + d.gps.longitude);
    } else {
        console.log('no GPS');
    }
})
    .after(10000, function () {
        console.log('end of the line');
        this.land();
    });