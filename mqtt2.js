var http = require('http');
var querystring = require('querystring');
var moment = require('moment');
var time = moment().format();

var contents = querystring.stringify({
    "deviceid": 'SC1710251381e530',
    "type": 'dat',
    "devicetype": 'JTQ-BF-06TW',
    "batterylevel": null,
    "temperature": 30,
    "humidity": 0,
    "level": '测试告警',
    "time": time,
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

var req = http.request(optionsUrl, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        console.log("data:", data); //如果成功，显示：操作成功
    });
});

req.write(contents);
req.end;