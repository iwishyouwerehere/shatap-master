// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    getFileContent = require('./../resources/tools/getFileContent');

module.exports = function getChatContent(chatName) {

    // variables declaration
    var chatContentPath = './public/chats/' + chatName + '/chat.txt';

    // check params
    if (!fs.existsSync(chatContentPath)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // get chat content and resolve it
    return getFileContent(chatContentPath).then((chatContent) => {
        chatContent = chatContent.split('\n');
        if (chatContent[chatContent.length - 1] == '') { chatContent.pop(); }
        return chatContent;
    });
};