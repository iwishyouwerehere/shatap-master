// define module imports
var getChatInfoAction = require('./../actions/getChatInfo.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error;

module.exports = function getChatInfoEvent(socket) {
    return function eventHandler(request, response) {
        console.log('\x1b[34m' + '{core}@{getChatInfoEvent}[request]');
        // check params
        if (!(request.params
            && request.params['chatName'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName parameter' }) }, request.id)); }

        // get chat content and answer back
        getChatInfoAction(request.params['chatName']).then((chatInfo) => {
            response(new JsonRPCResponse({ result: chatInfo }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        });
    };
}