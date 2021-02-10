/**
 * Request handlers
 */

const _data = require("./data");
const helpers = require("./helpers");

let handlers = {};

handlers.users = function(data, callback) {
    let acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._users = {};

handlers._users.post = function(data, callback) {
    let firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        _data.read("users", phone, function(error, data) {
            if (error) {
                // Hash password
                let hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    let userObject = {
                        "firstName": firstName,
                        "lastName": lastName,
                        "phone": phone,
                        "hashedPassword": hashedPassword,
                        "tosAgreement": true,
                    };
                    _data.create("users", phone, userObject, function(error) {
                        if (!error) {
                            callback(200);
                        } else {
                            console.log(error);
                            callback(500, { "Error": "Could no create new user" });
                        }
                    })

                } else {
                    callback(500, { "Error": "Could not has user's password" });
                }
            } else {
                callback(400, { "Error": "A user with that phone number already exists" });
            }
        });
    } else {
        callback(400, { "Error": "Missing required fields" });
    }
}

// TODO: Only let an authenticated user access their objext. Don't let them accss anyone else's
handlers._users.get = function(data, callback) {
    let phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read("users", phone, function(err, data) {
            if (!err && data) {
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { "Error": "Missing required field" });
    }
}

/**
 * Update user
 * @param {object} data User's data
 * @param {callback} callback 
 * @return callback
 */
// TODO: Only let an authenticated user update their objext. Don't let them accss anyone else's
handlers._users.put = function(data, callback) {
    // Required field
    let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    // Optional fields
    let firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            _data.read("users", phone, function(err, userData) {
                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    _data.update("users", phone, userData, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { "Error": "Could not update user" });
                        }
                    });
                } else {
                    callback(400, { "Error": "The specified user does not exist" });
                }
            });
        } else {
            callback(400, { "Error": "Missing fields to update" });
        }
    } else {
        callback(400, { "Error": "Missing required field" });
    }
}

/**
 * Deletes user
 * @param {object} data phone
 * @param {calbackk} callback 
 * @return callback
 */
// TODO: Only let an authenticated user update their objext. Don't let them accss anyone else's
// TODO: Cleanup any other data files associated with this user
handlers._users.delete = function(data, callback) {
    let phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read("users", phone, function(err, data) {
            if (!err && data) {
                _data.delete("users", phone, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, { "Error": "Could not update user" });
                    }
                });
            } else {
                callback(400, { "Error": "Could not find the specified user" });
            }
        });
    } else {
        callback(400, { "Error": "Missing required field" });
    }
};

handlers.ping = function(data, callback) {
    callback(200);
};

handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;