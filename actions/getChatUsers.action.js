// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    getFileContent = require('./../resources/tools/getFileContent');

module.exports = function getChatUsers(chatName) {

    // variables declaration
    var chatUsersPath = './public/chats/' + chatName + '/users.json';

    // check params
    if (!fs.existsSync(chatUsersPath)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // get chat info and resolve it
    return getFileContent(chatUsersPath).then((chatUsers) => {
        return Object.keys(JSON.parse(chatUsers));
    });
};