var path = require('path');

module.exports = function (app) {
    require('./home.route')(app);
    require('./chat.route')(app);
    require('./faq.route')(app);
}