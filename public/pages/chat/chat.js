/*  GLOBAL VARIABLES DECLARATION   */

var Socket,
    SmoothScroll;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};
var initProcess;
var client = {
    key: '',
    publicKey: '',
    userName: ''
},
    chat = {
        name: '',
        timestamp: 0,
        users: [],
        content: ''
    },
    usersColors = {};

/*  EXECUTION   */

/**
 * Execute all dom related initializing actions
 * 
 */
function domInit() {

    // init Alerter and show loading
    Alerter.init(document.getElementById("alert"),
        {
            'loading': {
                options: function () {
                    return {
                        title: 'Loading ...',
                        icon: 'chat'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                }
            },
            'key_not_found': {
                options: function () {
                    return {
                        title: 'Insert a key',
                        text: 'In order to send messages in a chatroom you have to create a private key to crypt your messages. We care about your privacy!',
                        input: '',
                        icon: 'vpn_key'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    client.key = data;
                    StorageWrap.session.setItem('key', data);
                    initProcess();
                }
            },
            'username_error': {
                options: function () {
                    return {
                        title: 'Username Error',
                        text: 'There has been an error retrieving a random username for you. We\'re sorry :(',
                        button: 'Retry',
                        icon: 'error'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    initProcess();
                }
            },
            'chat_gone': {
                options: function () {
                    return {
                        title: 'Chat gone',
                        text: 'The chat lifetime has ended up here. Nice to see you last so long! Grab your things and come back chatting!',
                        button: 'Back to homepage',
                        icon: 'local_shipping'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    window.location.href = '/';
                }
            },
            'edit_key': {
                options: function () {
                    return {
                        icon: 'vpn_key',
                        title: 'Manage key',
                        text: 'Here you can change your key. It will be used to encrypt your message. Choose a secure one!',
                        input: (StorageWrap.session.getItem('key') || client.key || '')
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    client.key = data;
                    StorageWrap.session.setItem('key', data);
                    var $keyView = document.querySelector("#info > p");
                    $keyView.innerHTML = client.key;
                    client.publicKey = Encryptor.encrypt(client.key);
                }
            },
            'user_inactive': {
                options: function () {
                    return {
                        icon: 'notifications_active',
                        title: 'Inactivity Alert',
                        text: 'Hey it seems like you has been disconnected from the chat due to your long inactivity. If you want to rejoin, simply reload the page.',
                        button: 'Reload'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    window.location.reload();
                }
            },
            'unauthorized': {
                options: function () {
                    return {
                        icon: 'lock_outline',
                        title: 'You\'re unauthorized',
                        text: 'We\'re sorry but it\'s true. Maybe you has been logged out just for being inactive or you might be a curious hacker trying to send messages where you can\'t.Reload if you want to keep chatting.',
                        button: 'Reload'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    window.location.reload();
                }
            },
            'help': {
                options: function () {
                    return {
                        icon: 'help',
                        title: 'Let us help you',
                        text: 'This is a chat room. You can write, anyone can write, only people with the same key as you can understand your messages.<br>Want to <a href=\'https://github.com/kristiannotari/shatapp\'>read more</a> ?',
                        button: 'Understood'
                    }
                },
                onShow: function () {
                    Alerter.$title.innerHTML = "Let us help you";
                    Alerter.$text.innerHTML = "This is a chat room. You can write, anyone can write, only people with the same key as you can understand your messages.<br>Want to <a href=\'/faq'>read more</a> ?";
                    Alerter.$button.innerHTML = "Understood";
                },
                onClose: function (data) {
                }
            },
            'unknown': {
                options: function () {
                    return {
                        icon: 'warning',
                        title: 'Unknown Error',
                        text: 'We don\'t know what happened D: <br>Try reloading the page!',
                        button: 'Reload'
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    window.location.reload();
                }
            }
        });
    Alerter.show('loading');

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
    });

    // bind enter key pressed to send button
    var keyMap = {};
    var $input = document.getElementById("input");
    $input.onkeydown =
        $input.onkeyup = function (e) {
            keyMap[e.keyCode] = e.type;
            if (keyMap[13] == 'keydown') {
                e.preventDefault();
                if (keyMap[16] == 'keydown') {
                    $input.value += '\n';
                    var height = $input.style.height ? $input.style.height : getComputedStyle($input).height;
                    $input.style.height = (Number(height.substring(0, height.length - 2)) + 24) + 'px';
                } else {
                    sendMsg();
                    $input.style.height = '42px';
                    keyMap = {};
                }
            }
        };

    // focus cursor on input box
    $input.focus();

    // on input value change
    $input.oninput = function (e) {
        if ($input.value == '') {
            $input.style.height = '42px';
        }
    }

    // on chat messages list scroll
    document.getElementById('chat-messages').addEventListener('scroll', function (e) {
        var scrollHeight = e.target.scrollHeight;
        var scrollTop = e.target.scrollTop;
        var height = (e.target.style.height || getComputedStyle(e.target).height).replace('px', '');

        var $chatInput = document.getElementById("chat-input");

        if ((scrollHeight - 16 - scrollTop) <= height) {
            if ($chatInput.classList.contains('scrolling')) {
                $chatInput.classList.remove('scrolling');
            }
        } else {
            if (!$chatInput.classList.contains('scrolling')) {
                $chatInput.classList.add('scrolling');
            }
        }

    })

    return new Promise(function (resolve, reject) {
        Encryptor.loadDependencies(function () {
            resolve();
        });
    });
}

/**
 * Execute all actions related to initialize the chat service with Socket requests to server and listening for Socket events
 * 
 * @returns <Promise<string>> return a promise that will resolve when all Socket requests are ended succesfully, reject otherwise
 */
function init() {

    // init Socket
    Socket = io({ forceNew: true });

    // get key
    client.key = StorageWrap.session.getItem('key');
    if (!client.key) {
        return Promise.reject('key_not_found');
    }
    var $keyView = document.querySelector("#info > p");
    $keyView.innerHTML = client.key;
    $keyView.style.opacity = 1;

    // init Encryptor
    Encryptor.init({
        mode: 'ECB',
        password: client.key,
        iv: '',
        salt: ''
    });
    client.publicKey = Encryptor.encrypt(client.key);

    // get chatName
    chat.name = window.location.pathname;
    chat.name = chat.name.substring(0, chat.name.lastIndexOf('/'));
    chat.name = chat.name.substring(chat.name.lastIndexOf('/') + 1, chat.name.length);
    document.title = "shatapp@" + chat.name;
    document.getElementById("chat-info").getElementsByTagName("h2")[0].innerHTML = "#" + chat.name;

    // start of asynchronous phase
    var requestPromises = [];

    // load encryptor dependencies
    // get userName
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name, 'publicKey': client.publicKey }, 0);
        Socket.emit("get_username", request, function receiveUsername(response) {
            if (!response['error']) {
                client.userName = response.result;
                resolve();
            } else {
                reject('username_error');
            }
        });
    }));
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        Socket.emit("get_chat_info", request, function (response) {
            if (!response['error']) {
                chat = response.result;
                chat['users'] = [];
                resolve();
            } else {
                reject('chat_info');
            }
        });
    }));
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        Socket.emit("get_chat_users", request, function (response) {
            if (!response['error']) {
                chat.users = response.result;
                chat.users.forEach(function (user) {
                    usersColors[user] = StyleTools.getRandomColor();
                }, this);
                usersColors[client.userName] = '#495ece';
                resolve();
            } else {
                reject('chat_users');
            }
        });
    }));
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        Socket.emit("get_chat_content", request, function (response) {
            if (!response['error']) {
                chat.content = response.result;
                resolve();
            } else {
                reject('chat_content');
            }
        });
    }));

    return Promise.all(requestPromises).then(function registerSocketEvents() {
        // register to Socket events
        Socket.on('new_message', function onNewMessage(request) {
            updateChat(request.params['msg']);
        });
        Socket.on('chat_deleted', function onChatDeleted(request) {
            console.log('chat_deleted');
            Alerter.show('chat_gone');
        });
        Socket.on('user_joined', function onUserJoined(request) {
            chat.users.push(request.params.userName);
            usersColors[request.params.userName] = StyleTools.getRandomColor();
            console.log('usersColors', usersColors);
            console.log('on_user_joined', request.params.userName, request.params.publicKey);
        });
        Socket.on('user_leaved', function onUserLeaved(request) {
            chat.users.splice(chat.users.indexOf(request.params.userName), 1);
            delete usersColors[request.params.userName];
            console.log('usersColors', usersColors);
            console.log('on_user_leaved', request.params.userName);
            if (request.params.userName == client.userName) {
                Alerter.show('user_inactive');
            }
        });
        Socket.on('user_inactive', function onUserLeaved(request) {
            console.log('users_inactive', request.params.userName);
            if (request.params.userName == client.userName) {
                console.log('you\'re now inactive');
            }
        });
    });
}


function validXmlMessage(xml) {
    if (xml instanceof Document &&
        xml.children.length == 1) {
        var message = xml.getElementsByTagName('message')[0];
        if (message && message.children.length == 3) {
            var username = message.getElementsByTagName('username')[0];
            var publicKey = message.getElementsByTagName('publicKey')[0];
            var content = message.getElementsByTagName('content')[0];
            if (username && username.children.length == 0 &&
                publicKey && publicKey.children.length == 0 &&
                content && content.children.length == 0) {
                return true;
            }
        }


    }

    return false;
}

/**
 * Get message to be sent then format it with xml
 * i.e.
 * "hello" -> <message>
 *              <username>user</username>
 *              <publicKey>publicKey</publicKey>
 *              <content>hello</content>
 *            </message>
 * 
 * @param {string} msg
 * @returns 
 */
function formatMsg(msg) {
    return "<message>" +
        "<username>" + Encryptor.encrypt(client.userName) + "</username>" +
        "<publicKey>" + client.publicKey + "</publicKey>" +
        "<content>" + Encryptor.encrypt(msg) + "</content>" +
        "</message>";
}

/**
 * Update chat messages graphically
 * 
 * @param {Array} messages
 */
function updateChat(messages) {
    var $chat_messages = document.getElementById('chat-messages'),
        oParser = new DOMParser();
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    // append all messages
    messages.map(function appendMessage(msg) {
        // needs to decrypt message
        if (msg) {
            var $last_chat_message = $chat_messages.lastChild;
            var $xml = oParser.parseFromString(msg, "text\/xml");
            // if xml format is invalid then returns
            if (!validXmlMessage($xml)) { return; }

            var publicKeyToCheck = $xml.getElementsByTagName("publicKey")[0].innerHTML;
            if (publicKeyToCheck == client.publicKey) {
                var username = Encryptor.decrypt($xml.getElementsByTagName("username")[0].innerHTML);
                var text = Encryptor.decrypt($xml.getElementsByTagName("content")[0].innerHTML);
                text = text.replace(/>/g, '&gt;').
                    replace(/</g, '&lt;').
                    replace(/"/g, '&quot;');

                if ($last_chat_message && $last_chat_message.getElementsByTagName("h4")[0].innerHTML == username) {
                    // append on last message
                    $last_chat_message.innerHTML += '<p>' + text + '</p>';
                } else {
                    // append new message
                    $chat_messages.innerHTML += ('<div class="chat-message"><h4 style="color: ' + (usersColors[username] || 'black') + ';">' + username + '</h4><p>' + text + '</p></div>');
                }
            } else {
                // public keys are not the same
            }
        }
    });

    // scroll to last message
    $chat_messages.scrollTop = $chat_messages.scrollHeight - ($chat_messages.style.height || getComputedStyle($chat_messages).height).replace('px', '');
}

/**
 * 
 * 
 * @returns 
 */
function sendMsg() {
    var $input = document.getElementById("input");
    var msg = $input.value.trim();
    if (msg == "") { return; }
    $input.value = "";
    $input.focus();

    msg = formatMsg(msg);
    updateChat(msg);

    var params = {
        'msg': msg,
        'chatName': chat.name,
        'userName': client.userName
    };
    var request = new JsonRPCRequest('POST', params, 0);
    Socket.emit('send_message', request, function messageSent(response) {
        if (!response['error']) {

        } else {
            if (response.error.code == 401) {
                Alerter.show('unauthorized');
            } else {
                Alerter.show('unknown');
            }
        }
    })

}

// DOCUMENT READY
var documentReady = function () {

    // initProcess
    initProcess = function () {
        return init().then(function () {
            Alerter.close(true);

            // update chat content if present
            updateChat(chat.content);

        }).catch(function err(cause) {
            switch (cause) {
                case 'key_not_found': {
                }
                case 'username_error': {
                }
                case 'chat_content': {
                }
                case 'chat_users': {
                }
                case 'chat_info': {
                    Alerter.show(cause);
                    break;
                }
                default: {
                    Alerter.show('unknown');
                }
            }
        });
    }

    // init dom
    domInit()
        .then(initProcess); // init

}.bind(this);


// START JS EXECUTION WHEN DOCUMENT IS READY
if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    documentReady();
} else {
    document.addEventListener("DOMContentLoaded", documentReady);
}