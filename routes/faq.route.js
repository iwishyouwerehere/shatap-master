var path = require('path');

module.exports = function (app) {
    app.get('/faq', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/pages/faq/faq.html'));
    });
}