/**
 * Created by Domi on 10.01.2017.
 */

var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.config('general:navdata_demo', true);

client.takeoff();

client.on('navdata', function (d) {
    if (d.demo) {
        console.log("ALT");
        console.log(d.demo.altitude);
    }
})
    .after(10000, function () {
        this.land();
    });