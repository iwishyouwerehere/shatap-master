// define module imports
var createChatAction = require('./../actions/createChat.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error;
// import emitter
var chatEmitter = require('./../resources/emitters/').chatEmitter;

module.exports = function createChatEvent(socket) {
    return function eventHandler(request, response) {
        console.log('\x1b[34m' + '{core}@{createChatEvent}[request]');
        createChatAction().then((chatName) => {
            // emit event for checkChatLifecycle
            chatEmitter.emit('create_chat', chatName, request.params['chatLifetime']);
            // answer back
            response(new JsonRPCResponse({ result: chatName }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        });
    };    
}