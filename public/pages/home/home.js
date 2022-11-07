/*  GLOBAL VARIABLES DECLARATION   */

var Socket,
    SmoothScroll;
var key = undefined;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};


function domInit() {
    // init smoothScroll
    SmoothScroll = new SmoothScroll('a[href*="#"]');

    // bind Alerter object to dom elements
    Alerter.init(document.getElementById("alert"),
        {
            'edit_key': {
                options: function () {
                    return {
                        icon: 'vpn_key',
                        title: 'Manage key',
                        text: 'Here you can change your key. It will be used to encrypt your message. Choose a secure one!',
                        input: (getKey() || key || '')
                    }
                },
                onShow: function () {
                },
                onClose: function (data) {
                    setKey(data);
                    var $keyView = document.querySelector("#info p");
                    $keyView.innerHTML = key;
                }
            },
            'wrong_chatName': {
                options: function () {
                    return {
                        icon: 'announcement',
                        title: 'Chat doesn\'t exist... yet',
                        text: 'The chat name you entered doesn\'t correspond to anything on our servers. Please retry',
                        button: 'Continue'
                    }
                },
                onShow: function () {
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
        }
    );

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
    });

    // bind on input change the opacity change for arrow button
    document.getElementById("input-chat-name").oninput = function (e) {
        var $arrow = document.querySelector("form button i");
        if (e.target.value != '') {
            $arrow.style.opacity = 1;
        } else {
            $arrow.style.opacity = 0;
        }
    };

    // alternate ? and arrow down icons on the "keep scrolling" round button
    setInterval(function () {
        var $scroll = document.getElementById('scroll').querySelector('i');
        $scroll.style.opacity = 0;
        setTimeout(function () {
            if ($scroll.innerHTML == '?') {
                $scroll.innerHTML = 'keyboard_arrow_down';
                $scroll.classList.remove('help');
            }
            else {
                $scroll.innerHTML = '?';
                $scroll.classList.add('help');
            }
            $scroll.style.opacity = 1;
        }, 200);
    }, 1600);
}

/**
 * 
 * 
 */
function init() {
    Socket = io({ forceNew: true });

    // get saved key if there's one
    key = getKey();
    var $keyView = document.querySelector("#info p");
    if (key) {
        $keyView.innerHTML = key;
        setTimeout(function () { $keyView.style.opacity = 1; }, 0); // for style purpose only
    } else { $keyView.style.display = 'none'; }
}


/**
 * 
 * 
 */
function createChat(chatLifetime) {
    var request = new JsonRPCRequest('POST', { chatLifetime: chatLifetime}, 0);

    Socket.emit("create_chat", request, function (response) {
        if (!response['error']) {
            window.location.href = "/chats/" + response.result + "/chat.html";
        } else {
            Alerter.show('unknown');
        }
    });
}

/**
 * 
 * 
 * @param {any} chatName 
 */
function joinChat(chatName) {
    var request = new JsonRPCRequest('GET', { chatName: chatName }, 0);

    Socket.emit("exist_chat", request, function (response) {
        if (!response['error']) {
            if (response.result) {
                window.location.href = "/chats/" + chatName + "/chat.html";
            } else {
                Alerter.show('wrong_chatName');
            }
        } else {
            Alerter.show('unknown');
        }
    });
}

/**
 * Access chat service by joining a chat or creating a new one
 * Accepted parameters: join, create
 * 
 * @param {string} type 
 */

function access(type) {
    // get key value and set it
    var $inputKey = document.querySelector("form input");
    var chatName = $inputKey.value;
    setTimeout(function () { $inputKey.value = "" }, 0); // for style purpose only

    // switch based on access type
    switch (type) {
        case 'join': {
            // check if chat exist
            if (chatName) {
                joinChat(chatName);
            }
            break;
        }
        case 'create': {
            $inputKey.blur();
            createChat();
            break;
        }
    }
}


/**
 * Get locally saved private key if present
 * 
 * @returns {string|undefined} key if found or undefined otherwise
 */
function getKey() {
    if (typeof (Storage) !== "undefined") {
        return sessionStorage.getItem("key");
    }
    return;
}

/**
 * Set locally the given key
 * 
 * @param {any} key
 */
function setKey(key) {
    this.key = key;
    if (typeof (Storage) !== "undefined") {
        sessionStorage.setItem("key", key);
    }
}
/**
 * Remove locally saved private key
 * 
 * @returns {boolean} if browser supports storage
 */
function removeKey() {
    this.key = undefined;
    if (typeof (Storage) !== "undefined") {
        sessionStorage.removeItem("key");
        return true;
    }

    return false;
}

// DOCUMENT READY
var documentReady = function () {
    // dom init
    domInit();

    // init
    init();

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
