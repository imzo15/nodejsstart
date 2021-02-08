/**
 * Helpers
 */

var crypto = require("crypto");

var helpers = {};

// Create a SHA256 hash
helpers.hash = function(text) {
    if (typeof("string") && text.length > 0) {
        let hash = crypto.createHmac("sha256", "secret").update(text).digest("hex");
        return hash;
    } else {
        return false;
    }
};


helpers.parseJsonToObject = function(text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return {};
    }
};

module.exports = helpers;