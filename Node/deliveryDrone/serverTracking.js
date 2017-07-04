var express = require('express')
    , app = express()
    , server = require('http').createServer(app)

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    //put in the real wesbsite
    res.sendfile(__dirname + '/indexPNG.html');
});

server.listen(8080);

var io = require('socket.io').listen(server)
io.set('destroy upgrade', false)

io.sockets.on('connection', function (socket) {
    console.log('connection')

    socket.on('control', function (ev) {
        console.log('taking direct control');
        console.log('[control]', JSON.stringify(ev));
        if (ev.action == 'animate') {
            client.animate(ev.animation, ev.duration)
        } else {
            client[ev.action].call(client, ev.speed);
        }
    })

    socket.on('takeoff', function (data) {
        console.log('takeoff', data)
        client.takeoff()
    })
    socket.on('land', function (data) {
        console.log('land', data)
        client.stop()
        client.land()
    })
    socket.on('reset', function (data) {
        console.log('reset', data)
        client.disableEmergency()
    })
    socket.on('tracked', function (data) {
        trackedData = data;
    })
    socket.on('tracking', function (data) {
        handleTrack = true;
    })

    setInterval(function () {
        io.sockets.emit('navData', {
            battery: battery
        })
    }, 1000)
});

var arDrone = require('ar-drone');
var client = arDrone.createClient();
var fs = require('fs');
var number = 0;
var trackedData;
var handleTrack = false;

var pngStream = client.getPngStream();

client.config('video:video_channel', 3);
client.config('general:navdata_demo', 'FALSE');

var battery = 0;
var countofmovign = 0;

var handleNavData = function (data) {
    if (data.demo == null || !handleTrack) {
        if (data.demo != null) {
            console.log("hallo, gar nix da?");

            battery = data.demo.batteryPercentage;
        }
        return;
    }
    if(trackedData == null){
        battery = data.demo.batteryPercentage;
        console.log("hallo, nix da?");

        client.up(0.2);

        return;
    }

    offsetX = calculateXoffset();
    offsetY = calculateYoffset();
    battery = data.demo.batteryPercentage

    console.log(offsetX + " " + offsetY);

    if (offsetX < 0.2 && offsetX > -0.2 && offsetY < 0.2 && offsetY > -0.2) {
        client.down(0.05);
    } else {
        if (countofmovign <= 0) {
            if (offsetX == -0.2) {
                client.left(0.03);
            } else if (offsetX == 0.2){
                client.right(0.001);
            }
            if (offsetY == -0.2) {
                client.front(0.04);
            } else if (offsetY == 0.2){
                client.back(0.01);
            }
            countofmovign = 2;
        } else {
            client.stop();
        }
        countofmovign -= 1;
    }

    if (data.demo.altitude <= 0.5 && data.demo.altitude > 0 && (trackedData != null)) {
        console.log("stop");
        client.stop()
        client.land()
        return;
    }
}

var handlePNGData = function (pngBuffer) {
    fs.writeFile('public/frame/frame' + number + '.png', pngBuffer, function (err) {
        if (err) {
            console.log('Error saving PNG: ' + err);
        }
    })
    io.sockets.emit('frameReceived', number);
    number++;
}

function calculateXoffset() {
    if (trackedData.x != null) {
        dataMiddlePos = trackedData.x + (trackedData.width / 2);
        dataRelativPos = (dataMiddlePos - 320) / 320;
        return within(dataRelativPos, -0.2, 0.2);
    }
}
function calculateYoffset() {
    if (trackedData.y != null) {
        dataMiddlePos = trackedData.y + (trackedData.height / 2);
        dataRelativPos = (dataMiddlePos - 180) / 180;
        return within(dataRelativPos, -0.2, 0.2);
    }
}

function within(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}

client.on('navdata', handleNavData);

pngStream
    .on('error', console.log)
    .on('data', handlePNGData);

