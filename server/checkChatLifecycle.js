// define module imports
var sleep = require('sleep-async')(),
    fs = require('fs-extra'),
    getFileContent = require('./../resources/tools/getFileContent');
// define global varibles
const DEFAULT_CHAT_LIFETIME = 320000,
    CHAT_LIFETIMES = [
        60000       /* 1 minute */,
        300000      /* 5 minutes */,
        86400000    /* 24 hours */
    ],
    chatsPath = './public/chats',
    activeChatsPath = chatsPath + '/chats.txt';

module.exports = function checkChatLifecycle() {
    console.log('\x1b[35m' + '{checkChatLifecycle}[info] subprocess started');

    let inactivityRegister = {};

    function removeChat(chatName) {
        if (inactivityRegister[chatName]) {
            delete inactivityRegister[chatName];
        }

        let chatDir = './public/chats/' + chatName;

        console.log('\x1b[35m' + '{checkChatLifecycle}[info] deleting chat (%s)', chatName);
        // delete chat folder and files
        if (fs.existsSync(chatDir)) {
            fs.removeSync(chatDir);
            // remove deleted chat name from active chats file
            let activeChats = fs.readFileSync(activeChatsPath, { encoding: 'UTF-8' });
            activeChats = activeChats.split('\n').map((activeChat) => { return activeChat.trim(); });
            activeChats.splice(activeChats.indexOf(chatName), 1);
            activeChats = activeChats.join('\n');
            fs.writeFileSync(activeChatsPath, activeChats);
        }
        // answer back when chat has been deleted
        process.send(chatName);
    }

    // reset chats folder while init
    if (fs.existsSync(chatsPath)) {
        console.log('\x1b[35m' + '{checkChatLifecycle}[info] initial chats reset');
        let chatsDirectories = fs.readdirSync(chatsPath);
        if (chatsDirectories.length != 0) {
            chatsDirectories.forEach(function (dir) {
                if (dir != 'chats.txt') {
                    fs.removeSync(chatsPath + '/' + dir);
                }
            }, this);
        }
        fs.writeFileSync(activeChatsPath, '');
    }

    // bind to create_chat event
    process.on('message', function handleChatLifetime(message) {

        if (message.event == 'create_chat') {
            // check if chat lifetime is set
            if (message.chatLifetime) {
                let chatDir = './public/chats/' + message.chatName;
                // sleep for set chat lifetime
                sleep.sleepWithCondition(function condition() {
                    // break sleep if chat folder no longer exists
                    return !fs.existsSync(chatDir);
                }, CHAT_LIFETIMES.indexOf(message.chatLifetime) == -1 ? DEFAULT_CHAT_LIFETIME : message.chatLifetime, function () { removeChat(message.chatName); });
            } else {
                let timeout = setTimeout(removeChat, DEFAULT_CHAT_LIFETIME, message.chatName);
                inactivityRegister[message.chatName] = timeout;
            }
        } else {
            // message.event == 'user_active'
            if (inactivityRegister[message.chatName]) {
                clearTimeout(inactivityRegister[message.chatName]);
                let timeout = setTimeout(removeChat, DEFAULT_CHAT_LIFETIME, message.chatName);
                inactivityRegister[message.chatName] = timeout;
            }
        }
    });
}();