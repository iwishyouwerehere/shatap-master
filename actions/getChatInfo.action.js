// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    getFileContent = require('./../resources/tools/getFileContent');

module.exports = function getChatContent(chatName) {

    // variables declaration
    var chatInfoPath = './public/chats/' + chatName + '/info.json';

    // check params
    if (!fs.existsSync(chatInfoPath)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // get chat info and resolve it
    return getFileContent(chatInfoPath).then((chatInfo) => {
        return JSON.parse(chatInfo);
    });
};