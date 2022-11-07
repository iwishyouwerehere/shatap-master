// define module imports
var express = require('express'),
    app = require('express')(),
    http = require('http').Server(app),
    path = require('path'),
    io = require('socket.io')(http),
    child_process = require('child_process'),
    routes = require('./routes/')(app), // defined routes
    favicon = require('serve-favicon'), // favicon
    events = require('./events/'),      // socket events
    emitters = require('./resources/emitters/'),    // internal event emitters
    JsonRPCRequest = require('./resources/types/jsonrpc').request,
    serverProcesses = require('./server/'); // internal server sub processes code

// define global variables
var chatEmitter = emitters.chatEmitter;

// define sub processes
console.log('\x1b[34m' + '{core}[info] creating sub processes');
// create and manage checkChatLifecycle process
var p_checkChatLifecycle = child_process.fork(serverProcesses.checChatLifecycle, [], { execArgv: ['--debug=5859'] });
p_checkChatLifecycle.on('message', function onRemovedChat(chatName) {
    chatEmitter.emit('chat_deleted', chatName);
});
chatEmitter.on('create_chat', function sendToCheckChatLifecycle(chatName, chatLifetime) {
    p_checkChatLifecycle.send({ event: 'create_chat', chatName: chatName, chatLifetime: chatLifetime });
});
// create and manage checkUsersActivity process
var p_checkUsersActivity = child_process.fork(serverProcesses.checkUsersActivity, [], { execArgv: ['--debug=5860'] });
p_checkUsersActivity.on('message', function onChangeStateUser(state) {
    // check if message is 'user_delete' or 'user_inactive'
    if (state.event == 'user_delete') {
        // emit user_leaved event
        chatEmitter.emit('user_leaved', { chatName: state.chatName, userName: state.userName, socketId: state.socketId });
    } else {
        io.to(state.chatName).emit('use_inactive', new JsonRPCRequest('SEND', { userName: state.chatName }));
    }
});
chatEmitter.on('user_joined', function sendToCheckUsersActivity(info) {
    p_checkUsersActivity.send({ event: 'user_joined', data: info });
});
chatEmitter.on('user_active', function sendToCheckUsersActivity(info) {
    p_checkUsersActivity.send({ event: 'user_active', data: info });
    p_checkChatLifecycle.send({ event: 'user_active', data: info });
});

// define favicon
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.ico')));
// define static content
app.use(express.static('public'));

// define routes (by require)

// define socket.io external events
io.on('connection', function (socket) {
    console.log('\x1b[34m' + '{core}[info] socket connected');
    console.log('\x1b[34m' + '{core}[info] defining socket-specific events');
    let socketEvents = events(socket);
    socket.on('create_chat', socketEvents.createChat);
    socket.on('send_message', socketEvents.sendMessage);
    socket.on('get_username', socketEvents.getUsername);
    socket.on('get_chat_content', socketEvents.getChatContent);
    socket.on('get_chat_info', socketEvents.getChatInfo);
    socket.on('get_chat_users', socketEvents.getChatUsers);
    socket.on('exist_chat', socketEvents.existChat);
});
// define socket.io internal events
chatEmitter.on('chat_deleted', function (chatName) {
    io.to(chatName).emit('chat_deleted', new JsonRPCRequest('SEND', { chatName: chatName }));
});
chatEmitter.on('user_joined', function (info) {
    io.to(info.chatName).emit('user_joined', new JsonRPCRequest('SEND', { userName: info.userName, publicKey: info.publicKey }));
});
chatEmitter.on('user_leaved', function (info) {
    io.to(info.chatName).emit('user_leaved', new JsonRPCRequest('SEND', { userName: info.userName }));
    // remove username client by socket room (also check if it is no longer connected)
    if (io.sockets.connected[info.socketId]) {
        io.sockets.connected[info.socketId].leave(info.chatName);
    }
});

// server listen
http.listen(process.env.PORT || 3000, '0.0.0.0', function () {
    console.log('\x1b[34m' + '{core}[info] web server created and listening on *:%s', (process.env.PORT || 3000));
});
