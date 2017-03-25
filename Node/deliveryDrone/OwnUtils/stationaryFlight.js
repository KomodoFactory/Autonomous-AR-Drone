var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.takeoff();

client.clockwise(0.5)

client.after(10000, function(){
	this.land();
});