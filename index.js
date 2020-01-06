"use strict";
var fs = require('fs');
var Stream = require('readable-stream');
var StreamQueue = require('streamqueue');
var Compiler = require('./compiler');

function MonkeyScript(config) {
    this.createProject(config);
}

MonkeyScript.createProject = function(input) {
    if (!input) {
        console.error("MonkeyScript: Could not create a new project: No configuration was given.");
        process.exit();
    }

    // read from file
    var config = getConfiguration(input);
    
    if (!config || typeof config !== "object") {
        console.error("MonkeyScript: Could not create a new project: The provided configuration must be a JSON file path or an object.");
        process.exit();
    }
	
    // check if "package.json" was passed to make sure raw "package.json" can be used
    if (input === "package.json") {
        if (!("monkeyscript" in config)) {
            config.monkeyscript = {meta:{}};
        }
    }

    var compiler = new Compiler(config);
    var userScript = compiler.compile();

    return () => {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function(file, unused, cb) {
            if (file.isNull()) {
                return cb(null, file);
            }
            var prependedBuffer = new Buffer(getInsertString(userScript, file));
            if (file.isStream()) {
                file.contents = new StreamQueue(
                    getStreamFromBuffer(prependedBuffer),
                    file.contents
                );
                return cb(null, file);
            }
            file.contents = Buffer.concat([prependedBuffer, file.contents],
                prependedBuffer.length + file.contents.length);
            cb(null, file);
        };
		
        function getStreamFromBuffer(string) {
            var stream = new Stream.Readable();
            stream._read = function() {
                stream.push(new Buffer(string));
                stream._read = stream.push.bind(stream, null);
            };
            return stream;
        }

        function getInsertString(arg, file) {
            if(typeof arg === 'function') {
                return arg(file);
            } else {
                return arg;
            }
        }

        return stream;
    }
};

function getConfiguration(input) {
    if (typeof input === "string") {
        try {
            var configText = fs.readFileSync(input).toString();
            return JSON.parse(configText);
        } catch (error) {
            console.error("MonkeyScript: Could not parse JSON file.", error.message);
            return false;
        }
    } else if (typeof input === "object") {
        // clone
        return JSON.parse(JSON.stringify(input));
    }
}

module.exports = MonkeyScript;