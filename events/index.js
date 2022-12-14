module.exports = function initEvents(socket) {
    return {
        // external per socket events
        createChat: require('./createChat.event')(socket),
        sendMessage: require('./sendMessage.event')(socket),
        getUsername: require('./getUsername.event')(socket),
        getChatContent: require('./getChatContent.event')(socket),
        getChatInfo: require('./getChatInfo.event')(socket),
        getChatUsers: require('./getChatUsers.event')(socket),
        existChat: require('./existChat.event')(socket)
    }
}
