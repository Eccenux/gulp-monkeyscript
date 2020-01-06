/* eslint-disable no-prototype-builtins */
/* global it, describe */
const assert = require('chai').assert;
//const fs = require('fs');

const Compiler = require('../compiler');

const monkeySchema = require("../schema.json")

describe('Compiler', function () {
    
    describe('getKeysLength', function () {
        let compiler = new Compiler({});
        it('Should have base lenght', function () {
            let result = 0;
            result = compiler.getKeysLength({}, 10);
            assert.equal(result, 10);
            result = compiler.getKeysLength({}, 20);
            assert.equal(result, 20);
        });
        it('Should find max', function () {
            let result = 0;
            result = compiler.getKeysLength({a:1,bb:1,ccc:1});
            assert.equal(result, 3);
            result = compiler.getKeysLength({a:1,ccc:1,bb:1});
            assert.equal(result, 3);
        });
        it('Should consider base', function () {
            let result = 0;
            result = compiler.getKeysLength({a:1,bb:1,ccc:1}, 1);
            assert.equal(result, 3);
            result = compiler.getKeysLength({a:1,ccc:1,bb:1}, 5);
            assert.equal(result, 5);
        });
    });

    // getMetaLine function
    describe('getMetaLine', function () {
        it('Should start with key', function () {
            let compiler = new Compiler({abc:123});
            let result = "";
            result = compiler.getMetaLine('abc', 123);
            assert.isTrue(result.startsWith('// @abc'));
        });
        it('Should be aligned with spaces', function () {
            let compiler = new Compiler({abc:123, abcdef:234}, 0);
            assert.equal(compiler.keysLength, 6);
            let result = "";
            result = compiler.getMetaLine('abcdef', 234);
            assert.equal(result, '// @abcdef 234\n');
            result = compiler.getMetaLine('abc', 123);
            assert.equal(result, '// @abc    123\n');
        });
    });

    // compiler function
    describe('compiler', function () {
        it('Should support all string values from schema', function () {
            // create config from schema
            let config = {};
            for (const key in monkeySchema.properties) {
                if (monkeySchema.properties.hasOwnProperty(key)) {
                    const element = monkeySchema.properties[key];
                    if (element.type === 'string') {
                        // Note! The `element.title` seem to be the actual value used for monkeyscript.
                        // E.g. for key `homepageUrl` actual key in user.script is `@homepageURL`.
                        config[key] = element.title.replace(/@/, ''); 
                    }    
                }
            }
            let compiler = new Compiler(config);
            let result = "";
            result = compiler.compile();
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    const element = config[key];
                    assert.isTrue(result.indexOf("@" + element + " ")>=0, `result must contain @${element}\n\n` + result);    
                }
            }
            //assert.isTrue(false, `todo\n` + result);
        });
        it('Should support match array', function () {
            let config = {
                "match": [
                    "https://*.example.com/abc*",
                    "http://*.example.com/abc*"
                ]
            };
            let compiler = new Compiler(config);
            let result = "";
            result = compiler.compile();
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    //const element = config[key];
                    assert.isTrue(result.indexOf("@" + key + " ")>=0, `result must contain @${key}\n\n` + result);    
                }
            }
            //assert.isTrue(false, `todo\n` + result);
        });
        it('Should support package style config', function () {
            let config = {
                "author": "Johnny be Good",
                "monkeyscript": {
                    "meta": {
                        "match": [
                            "https://*.example.com/abc*",
                            "http://*.example.com/abc*",
                        ],
                    }
                }
            };
            let expectedConfig = {
                "author": config.author,
                "match": config.monkeyscript.meta.match,
            }
            let compiler = new Compiler(config);
            let result = "";
            result = compiler.compile();
            for (const key in expectedConfig) {
                const element = expectedConfig[key];
                const values = Array.isArray(element) ? element : [element];
                values.forEach(value => {
                    assert.isTrue(result.indexOf("@" + key + " ")>=0, `result must contain @${key}\n\n` + result);
                    assert.isTrue(result.search(new RegExp("@" + regExpEscape(key) + "\\s+" + regExpEscape(value)))>=0, `result must contain @${key} ${value}\n\n` + result);
                });
            }
            //assert.isTrue(false, `todo\n` + result);
        });
        it('Should prefer monkeyscript meta over package config', function () {
            let config = {
                "author": "Johnny be Good",
                "version": "1.2.3",
                "monkeyscript": {
                    "meta": {
                        "author": "Johnny Alias",
                        "match": [
                            "https://*.example.com/abc*",
                            "http://*.example.com/abc*",
                        ],
                    }
                }
            };
            let expectedConfig = {
                "author": config.monkeyscript.meta.author,
                "match": config.monkeyscript.meta.match,
                "version": config.version,
            }
            let compiler = new Compiler(config);
            let result = "";
            result = compiler.compile();
            for (const key in expectedConfig) {
                const element = expectedConfig[key];
                const values = Array.isArray(element) ? element : [element];
                values.forEach(value => {
                    assert.isTrue(result.indexOf("@" + key + " ")>=0, `result must contain @${key}\n\n` + result);
                    assert.isTrue(result.search(new RegExp("@" + regExpEscape(key) + "\\s+" + regExpEscape(value)))>=0, `result must contain @${key} ${value}\n\n` + result);
                });
            }
            //assert.isTrue(false, `todo\n` + result);
        });
        it('Should prepend CSS as variable', function () {
            let config = {
                "author": "Johnny be Good",
                "version": "1.2.3",
                "monkeyscript": {
                    "prependCSS": "test/test.css",
                    "meta": {}
                }
            };
            let compiler = new Compiler(config);
            let result = "";
            result = compiler.compile();
            assert.isTrue(result.indexOf("#just-for-tests")>=0, `result must contain #just-for-tests selector from CSS\n\n` + result);
            //assert.isTrue(false, `todo\n` + result);
        });
    });

});

function regExpEscape(literal_string) {
    return literal_string.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
}