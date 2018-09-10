const fs = require('fs');

module.exports = function grabJson(path) {
    return JSON.parse(fs.readFileSync(path));
}