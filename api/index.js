const app = require('../backend_api/server');

module.exports = (req, res) => {
    return app(req, res);
};
