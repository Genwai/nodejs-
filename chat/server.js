// 引入http 模块
var http = require('http');
var express = require('express');
var app = express();
// 创建一个服务器
var server = http.createServer(app);
var io = require('socket.io').listen(server); // 引入socket.io 模块并绑定到服务器
var users = []; //用来保存所有用户的昵称


app.use('/', express.static(__dirname + '/www')); // 指定静态文件html 的位置

// 监听8035端口
server.listen(8035);
console.log('server started')

io.on('connection', function(socket) { // connetion 中socket 表示当前连接到服务器的那个客户端。所以 socket.emit('foo'):表示只有自己受到这个时
    // 间;，而socket.broadcast.emit('foo')表示除了自己向其他人发送该事件 ,另外代码中io 代表的是服务器 整个socket 连接
    // 所以 io.socket.emit('foo');表示所有人都能收到该事件
    // 接受并处理客户端发送的foo事件
    console.log('connection:连接成功')
    socket.on('login', function(name) {
            // 将消息输出在控制台
            console.log('name', name);
            if (users.indexOf(name) > -1) {
                socket.emit('NameExisted'); //发送给所有客户端
            } else {
                // 用户离开 要移除该用户啊，显示在线人数
                socket.userIndex = users.length; //很巧妙是的，第一个用户，对应users 下标为0
                socket.name = name;

                users.push(name);
                socket.emit('loginSuccess');
                io.sockets.emit('system', name, users.length, 'login'); // 像所有连接到服务器的客户端发送当前登录的用户昵称
                // 表示 两个参数
            }
        })
        // 接收新的消息
    socket.on('postMsg',function (msg) {  
        console.log(msg);
        socket.broadcast.emit('newMsg',socket.name,msg);
    })

    socket.on('img',function(imgData){
        socket.broadcast.emit('newImg',socket.name,imgData);
    })

        // socket 提供的 disconnect 表示 当用户断开连接，会有提示；
        // 主要做两件事：一是将用户从users数组删除，二是发送一个system事件：“某某人 离开了聊天室”
    socket.on('disconnect', function() {
        // 将断开的时候该用户从users数组中删除
        users.splice(socket.userIndex, 1);
        // 通知除了自己以外的所有人
        socket.broadcast.emit('system', socket.name, users.length, 'logout');

    })

})