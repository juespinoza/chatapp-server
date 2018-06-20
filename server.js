require('dotenv').config()

const server = require('http').createServer()
const io = require('socket.io')(server)

let usernames = [];
let roomHistory = [];
const historyMax = 10;

io.on('connection', (client) => {
    console.log('Socket connected...');

    // new user event listener
    client.on('new user', function(user, callback){
        if(usernames.indexOf(user) != -1){
            //user already exists
            callback(false, roomHistory, usernames);
        }else{
            //user added
            client.username = user;
            usernames.push(client.username);
            //send event to the client
            io.emit('user logged in', user, usernames);
            callback(true, roomHistory, usernames);
        }
        console.log('User logged in: ', user);
    });

    // user logout event listener
    client.on('user logout', function(user, callback){
        console.log('usernames: ', usernames)
        if(usernames.indexOf(user) != -1){
            //user removed
            usernames.splice(usernames.indexOf(user), 1);
            //send event to the client
            io.emit('user logged out', user, usernames);
            callback(true, roomHistory, usernames);
        }else{
            //user does not exist
            callback(false, roomHistory, usernames);
        }
        console.log('User logged out: ', user);
    });

    // send message event listener
    client.on('send message', function(message, user, callback){
        let messageData = { msg: message, user: user || client.username }
        if(roomHistory.length == historyMax){
            roomHistory.shift();
        }
        roomHistory.push(messageData);
        io.emit('new message received', roomHistory);
        callback(true, roomHistory, usernames);
        console.log('New message: ', message);
    });

    // disconnect event listener
    client.on('disconnect', function(){
        if(!client.username){
        } 
        usernames.splice(usernames.indexOf(client.username), 1);
    });
});

const port = 80
io.listen(port);
console.log('Listening on port ', port);