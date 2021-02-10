const config = require("./lib/config");
const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const StringDecoder = require("string_decoder").StringDecoder;
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// Instantiate HTTP server
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
    console.log(`Server listening on port ${config.httpPort}`);
});

// Instantiate HTTPS server
let httpsServerOptions = {
    "key": fs.readFileSync("./https/key.pem"),
    "cert": fs.readFileSync("./https/cert.pem")
}
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
    console.log(`Server listening on port ${config.httpsPort}`);
});

var unifiedServer = function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    var queryStringObject = parsedUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;

    // Get payload if there is any
    var decoder = new StringDecoder("utf-8");
    var buffer = "";
    req.on("data", function(data) {
        buffer += decoder.write(data);
    });

    req.on("end", function() {
        buffer += decoder.end();
        // Choose the handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler
        var data = {
            "trimmedPath": trimmedPath,
            "queryStringObject": queryStringObject,
            "method": method,
            "headers": headers,
            "payload": helpers.parseJsonToObject(buffer),
        };

        // Route the request to the handler specified in the router

        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called back by the handler, or default to 200 OK
            statusCode = typeof(statusCode) == "number" ? statusCode : 200;
            // Use the payload called back by the handler, or default to an empty ''
            payload = typeof(payload) == "object" ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            // Return the response
            res.end(payloadString);


            console.log(`Request received on path: ${trimmedPath} with method: ${method} and with these query string parameters `);
            console.log(queryStringObject);
            console.log(`Request received with these headers`);
            console.log(headers);
            console.log(`Request received with this payload`);
            console.log(buffer);
            console.log(`Returning this response: ${statusCode} : ${payloadString}`);
        });

    });
};



var router = {
    'ping': handlers.ping,
    'users': handlers.users
};