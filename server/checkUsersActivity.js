// define module imports
var sleep = require('sleep-async')(),
    fs = require('fs'),
    getFileContent = require('./../resources/tools/getFileContent');
// define global varibles
const MAX_USER_INACTIVITY = 300000,
    USER_INACTIVITY_LOWER_BOUND = 60000

module.exports = function checkUsersActivity() {
    console.log('\x1b[31m' + '{checkUsersActivity}[info] subprocess started');
    let inactivityRegister = {};

    function deleteInactiveUser(chatName, userName) {
        console.log('\x1b[31m' + '{checkUsersActivity}[info] deleting user (%s) in (%s)', userName, chatName);
        let chatUsersPath = './public/chats/' + chatName + '/users.json';
        if (!fs.existsSync(chatUsersPath)) { return; }
        // delete user from active users file
        getFileContent(chatUsersPath).then(activeUsers => {
            activeUsers = JSON.parse(activeUsers);
            if (!activeUsers[userName]) { return; }
            let socketId = activeUsers[userName].socketId;
            delete activeUsers[userName];
            fs.writeFileSync(chatUsersPath, JSON.stringify(activeUsers));
            // delete item from inactivityRegister
            delete inactivityRegister[chatName][userName];
            // answer back
            process.send({ event: 'user_delete', chatName: chatName, userName: userName, socketId: socketId });
        });
    }

    function emitInactiveUser(chatName, userName) {
        console.log('\x1b[31m' + '{checkUsersActivity}[info] inactive user (%s) in (%s)', userName, chatName);
        let deleteTimeout = setTimeout(deleteInactiveUser, MAX_USER_INACTIVITY, chatName, userName);
        inactivityRegister[chatName][userName] = deleteTimeout;
        process.send({ event: 'user_inactive', chatName: chatName, userName: userName });
    }

    // bind to user_joined or user_active event
    process.on('message', function setUserTimeout(message) {
        let inactivityTimeout = setTimeout(emitInactiveUser, USER_INACTIVITY_LOWER_BOUND, message.data.chatName, message.data.userName);
        if (message.event == 'user_joined') {
            if (!inactivityRegister[message.data.chatName]) { inactivityRegister[message.data.chatName] = {} };
            inactivityRegister[message.data.chatName][message.data.userName] = inactivityTimeout;
        } else {
            let registeredTimeout = inactivityRegister[message.data.chatName][message.data.userName];
            clearTimeout(registeredTimeout);
            inactivityRegister[message.data.chatName][message.data.userName] = inactivityTimeout;
        }
    });
}();