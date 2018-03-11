window.onload = function() {
    // 实例化，并初始化我们的hichat程序

    // 定义我们的自己的hichat类
    function HiChat() {
        this.socket = null;
    }

    // 原型添加业务的方法
    HiChat.prototype = {
        inits: function() { //此方法初始化程序
            var that = this;

            // 建立服务器socket 连接
            that.socket = io.connect('');
            // 页面监听socket的connect事件，此事件表示连接已经建立
            that.socket.on('connect', function() {
                console.log('连接服务器成功');
                // 连接到服务器，显示昵称输入框
                document.getElementById('info').textContent = '请输入你的昵称';
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();
            })

            // 昵称设置的确认按钮
            document.getElementById('loginBtn').addEventListener('click', function() {
                var nickName = document.getElementById('nicknameInput').value;
                // 检查昵称是否为空，是的话，把data传给服务器。服务器进行存储，然后，后面显示页面要用到
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                } else {
                    document.getElementById('nicknameInput').focus();
                }
            })

            // 服务端发送过来是否重名
            this.socket.on('NameExisted', function() {
                document.getElementById('info').textContent('该用户昵称已经存在'); //显示用户的昵称已经存在了
            })

            this.socket.on('loginSuccess', function() {
                document.title = "hichat| " + document.getElementById('nicknameInput').value;
                document.getElementById('loginWrapper').style.display = 'none';
                document.getElementById('messageInput').focus();
            })

            // 在顶部显示 用户登陆与离开 并显示 在线人数
            this.socket.on('system', function(name, userCount, type) {
        
                var state = (type == "login") ? "登录" : "离开";

                var msg = name + state;
              
                //var p = document.createElement('p');
                //p.textContent=msg;

                //document.getElementById('historyMsg').appendChild(p);

                that._displayNewMsg('system',msg,'red')
                //显示在线人数
                document.getElementById('status').textContent = userCount + '在线';


            })

            document.getElementById('sendBtn').addEventListener('click',function () {  
                var messageInput = document.getElementById('messageInput');
                var msg = messageInput.value;//此时 信息已经存在变量中了。所以下面清空的时候，还是能判断的
                messageInput.value ="";
                if(msg.trim().length!=0){
                    that.socket.emit('postMsg',msg);
                    console.log(msg)

                    that._displayNewMsg('me',msg,)
                }

            },false)

            this.socket.on('newMsg',function (name,msg) {  
                that._displayNewMsg(name,msg,'black')
            })
            this.socket.on('newImg',function (user,img) {
                that._displayImg(user,img);
              })

            document.getElementById('sendImage').addEventListener('change',function () {  
                // 检查文件是否被选中
                if(this.files.length != 0){

                    var files =this.files[0];
                    var reader = new FileReader();
                    if(!reader){
                        this._displayNewMsg('systme','你的浏览器不支持filreader','red');
                        this.value ="";
                        return;
                    }
                    reader.onload =function(e){
                        //  读取成功，显示到页面发送到服务器
                        this.value ="";
                        that.socket.emit('img',e.target.result);
                        that._displayNewMsg('me',e.target.result);

                    }
                    reader.readAsDataURL(file)
                }
            },false)

        },
        _displayNewMsg:function (user,msg,color) {  
            var container = document.getElementById('historyMsg');
            var msgToDisplay =document.createElement('p');
            // var data = new Data().toTimeString().substr(0,8); date
            var date = new Date().toTimeString().substr(0, 8);
            var color = document.getElementById('messageInput').style.color = color || "#000";
            msgToDisplay.innerHTML = user + '<span class="timespan">'+ date +'</span>' +msg;
            container.appendChild(msgToDisplay);
            container.scrollTop =container.scrollHeight;
        },
        _displayImg:function (user,imgData,color) {
            var container = document.getElementById('historyMsg');
            var msgToDisplay =document.createElement('p');
            // var data = new Data().toTimeString().substr(0,8); date
            var date = new Date().toTimeString().substr(0, 8);
            var color = document.getElementById('messageInput').style.color = color || "#000";
            msgToDisplay.innerHTML = user + '<span class="timespan">'+ date +'</span><br/>' +'<a href="'+ imgData +' target="_blank" "><img src="'+ imgData +'"></a>';
            
            container.appendChild(msgToDisplay);
            container.scrollTop =container.scrollHeight;
          }
        
    }

    var hichat = new HiChat();
    hichat.inits();




}