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
        console.log("Coordinates: " + d.gps.latitude + ', ' + d.gps.longitude + ', ' + navdata.gps.elevation);
        console.log("Satelites: " + navdata.gps.nbSatellites);
        console.log("Error: " + d.gps.pdop + ', ' + d.gps.hdop + ', ' + d.gps.vdop)
    } else {
        console.log('no GPS');
    }
})
    .after(20000, function () {
        console.log('end of the line');
        this.land();
    });