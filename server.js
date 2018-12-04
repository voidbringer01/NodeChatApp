let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io=require("socket.io").listen(server);
let path=require('path');
let port=8000;
users=[];
connections=[];

app.use('/cssFiles',express.static(__dirname + '/public'));
server.listen(process.env.PORT || port);
console.log('Server running on port '+port+'...');

app.get('/',function(req,res){
    res.sendFile(__dirname+ '/index.html');
});

io.sockets.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected: '+connections.length+' sockets connected');

    // on Disconnect
    socket.on('disconnect',function(){
        if(!socket.username)
            return;
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: '+connections.length +'sockets connected');
    });

    socket.on('send message', function (data){
        io.sockets.emit('new message',{msg:data,user:socket.username});
    });

    socket.on('new user',function(data,callback){
        callback(true);
        socket.username=data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames(){
        io.sockets.emit('get users',users);
    }
});