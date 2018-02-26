var mqtt = require('mqtt');
var crypto = require('crypto');
var deviceId = "设备账号";
var deviceSecret = "设备密码";
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



var mqttURL = '服务器地址及端口号';

var client = mqtt.connect(mqttURL, options);
client.on('connect', function(connack) {

    console.log('连接成功,connected (%s): %j', mqttURL, connack);
    var topic = '/DataPort/' + deviceId + '/Rcv';
    client.subscribe(topic);


})

client.on('message', function(topic, message) { // Here we got a message!
    console.log('这是获取项目信息： topic[%s]: %s', topic, message.toString());
    // socket.emit('mqtt', { 'message': message.toString() });

})
io.on('connection', function(socket) {

    client.on('message', function(topic, message) {
        console.log('收到讯息 ' + topic + ' 主題，訊息：' + message.toString());
        socket.emit('mqtt', { 'message': message.toString() });

    });
});
// sio.on('connection', function(socket) {

// });


http.listen(需要监听的端口号, function() {
    console.log('服务开始...');
});