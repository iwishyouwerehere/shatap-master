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

    // bind on select change the opacity change for bottom border-radius
    document.getElementById("faq-filter").querySelector('select').onchange = function (e) {
        var $defaultOption = document.getElementById('faq-filter-default-option');
        if ($defaultOption) {
            $defaultOption.parentElement.removeChild($defaultOption);
            e.target.classList.remove('default-selected');
        }
        e.target.blur();
    };
}

/**
 * 
 * 
 */
function init() {
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
