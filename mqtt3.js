var mqtt = require('mqtt');
var crypto = require('crypto');
var deviceId = "cfec121cdbc7a532";
var deviceSecret = "d16034a426bd531fcd982de6c4c0a85e";
var querystring = require('querystring');
var moment = require('moment');
var time = moment().format();
var https = require('http');

var username = deviceId + ';' + new Date().getTime();
var password = crypto.createHash('md5').update(username + deviceSecret).digest('hex');
var options = {
    protocol: 'MQTT',
    protocolId: 'MQTT',
    protocolVersion: 4,
    username: username,
    password: password

};
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
// var sio = io.listen(server);

var mqttURL = 'tcp://iot.3jyun.com:1884';
var client = mqtt.connect(mqttURL, options);
client.on('connect', function(connack) {
    console.log('连接成功,connected (%s): %j', mqttURL, connack);
    var topic = '/DataPort/' + deviceId + '/Rcv';
    client.subscribe(topic);
})
io.on('connection', function(socket) {
    client.on('message', function(topic, message) {
        console.log('收到 ' + topic + ' 主題，訊息：' + message.toString());
        socket.emit('mqtt', { 'message': message.toString() });
        var json = JSON.parse(message.toString());
        console.log('json', json.streamId, json)
        if (json.streamId == 'gas') {
            global.gas = json.data;
            global.Dates = "正常";
        } else if (json.streamId == 'temp') {
            global.temperature = json.data;
        }
        if (json.streamId == "selfCheck" && json.data == "设备自检") {
            global.Dates = "设备自检"; //按下按钮 设备自检
            global.gas = 0;
            global.temperature = 0;
        } else if (json.streamId == "selfCheck" && json.data == "设备自检结束") {
            global.Dates = "设备自检结束";
            global.gas = 0;
            global.temperature = 0;
        }
        if (json.type == "alarm" && json.level == 0 && json.streamId != "selfCheck") {
            global.Dates = json.data; //设备自检
            global.gas = 0;
            global.temperature = 0;
        }

        if (global.gas && global.temperature) {
            var contents = querystring.stringify({
                "deviceid": json.deviceId,
                "type": json.type,
                "devicetype": json.deviceType,
                "batterylevel": null,
                "temperature": global.temperature,
                "humidity": global.gas,
                "level": global.Dates,
                "time": json.at,
            });
            var optionsUrl = {

                host: '39.108.214.140',
                port: '8011',
                method: 'POST',
                path: '/AccidentRQ/AddAccident',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "Content-Length": contents.length
                }
            }
            var req = https.request(optionsUrl, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(data) {
                    console.log("data:", data); //如果成功，显示：操作成功
                });
            });

            req.write(contents);
            req.end;

            global.gas = null;
            global.temperature = null;
        }

    });

    socket.broadcast.emit('close');
});

http.listen(3500, function() {
    console.log('服务开始...');
});