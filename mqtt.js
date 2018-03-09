// 第一版本
var mqtt = require('mqtt');
var crypto = require('crypto');
var deviceId = "cfec121cdbc7a532";
var deviceSecret = "d16034a426bd531fcd982de6c4c0a85e";

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

.on('offline', function() {
    console.log('offline (%s)', mqttURL)
})

.on('error', function(error) {
    console.log('这是错误信息', error.message);

})

.on('reconnect', function() {
    console.log('重新连接 reconnect (%s)', mqttURL);

})

.on('close', function() {
    console.log('关闭close (%s)', mqttURL);

});

io.on('connection', function(socket) {

    client.on('message', function(topic, message) {
        console.log('收到 ' + topic + ' 主題，訊息：' + message.toString());

        socket.emit('mqtt', { 'message': message.toString() });


    });

    socket.broadcast.emit('close');
});





http.listen(3500, function() {
    console.log('服务开始...');
});