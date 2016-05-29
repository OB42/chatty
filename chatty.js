var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var config = require("./config");
app.get('/*', function (req, res) {
    res.sendFile(__dirname + "/index.html");
})
.use(function(err, req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Error 404');
})
server.listen(config.port, config.ip);
require('mongodb').MongoClient.connect(config.dbUrl(), function(err, db) {
    if (err) throw err;
    io.sockets.on("connection", function(socket){
        var lastroom;
        var lastTime = new Date().getTime() - 1000;
        var chat;
        socket.on("joinChat", function(data){
            var pseudo = data.pseudo;
            var room = data.chat;
            if(lastroom){
                socket.leave(lastroom);
            }
            lastroom = room;
            socket.join(room);
            chat = db.collection(room);
            chat.find().sort({_id:1}).limit(config.messagesToFetch).toArray(function(err, msg){
                if(err) throw err;
                socket.emit("newChat", msg);
            });

        });
        socket.on("sendMessage", function(msg){
            var time = new Date().getTime();
            if(time - lastTime > config.rateLimit){
                msg.timestamp = time;
                if(msg.content.length > config.maxMessageLength){
                    msg.content = msg.content.substr(0, config.maxMessageLength);
                }
                chat.insert(msg, function(err){
                    if(err) throw err;
                    io.sockets.in(lastroom).emit("newMessage", msg);
                });
            }
            else{
                socket.emit("postingTooFast", config.rateLimit);
            }
            lastTime = time;
        });
    });
});
