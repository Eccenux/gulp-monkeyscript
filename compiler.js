"use-strict";

class Compiler {
    constructor(config, basePad) {
        this.config = config;
        let base = typeof basePad === 'number' ? basePad : 10;
        this.keysLength = this.getKeysLength(config, base);
    }

    /**
     * Get top length of keys.
     * @param {Object} object Object.
     * @param {Number} base Base (min) length.
     * @returns {Number} max length or base.
     */
    getKeysLength(object, base) {
        var length = base ? base : 0;
        Object.keys(object).forEach((value)=>{
            if (value.length > length) {
                length = value.length;
            }
        });
        return length;
    }

    /**
     * Get monkey script config line.
     * @param {String} key Name of the key.
     * @param {String} value Name of the value.
     */
    geConfigLine(key, value) {
        return "// @"+key.padEnd(this.keysLength)+" " + value + "\n";
    }

    /**
     * Get whole header for a user.script.js.
     */
    compile () {
        var config = this.config;
        var userScript = "// ==UserScript==\n";

        if (config.author) {
            userScript += this.geConfigLine("author", config.author);
        }
        
        if (config.name) {
            userScript += this.geConfigLine("name", config.name);
        }

        var options = ['id', 'category', 'namespace'];
        options.forEach((key) => {
            if (key in config) {
                userScript += `// @${key}\t\t${config[key]}\n`;
            }
        });

        if (config.version) {
            userScript += this.geConfigLine("version", config.version);
        }

        if (config.description) {
            userScript += this.geConfigLine("description", config.description);
        }

        if (config.homepage) {
            userScript += this.geConfigLine("homepage", config.homepage);
        }

        if (config.homepageUrl) {
            userScript += this.geConfigLine("homepageURL", config.homepageUrl);
        }

        if (config.website) {
            userScript += this.geConfigLine("website", config.website);
        }

        if (config.source) {
            userScript += this.geConfigLine("source", config.source);
        }

        if (config.icon) {
            userScript += this.geConfigLine("icon", config.icon);
        }

        if (config.iconUrl) {
            userScript += this.geConfigLine("iconURL", config.iconUrl);
        }

        if (config.defaultIcon) {
            userScript += this.geConfigLine("defaulticon", config.defaultIcon);
        }

        if (config.icon64) {
            userScript += this.geConfigLine("icon64", config.icon64);
        }

        if (config.icon64Url) {
            userScript += this.geConfigLine("icon64URL", config.icon64Url);
        }

        if (config.updateUrl) {
            if (!config.version) {
                console.warn("MonkeyScript: WARNING: version was not present but it is required for updateUrl to work.");
            }

            userScript += this.geConfigLine("updateURL", config.updateUrl);
        }
        
        if (config.downloadUrl) {
            userScript += this.geConfigLine("downloadURL", config.downloadUrl);
        }
        
        if (config.supportUrl) {
            userScript += this.geConfigLine("supportURL", config.supportUrl);
        }
        
        if (config.include) {
            if (typeof config.include === "string") {
                console.error("MonkeyScript: Include expected an array, but got string.");
            }

            var hasStringIncludesSupport = typeof String.prototype.includes !== 'undefined'
            
            config.include.forEach(function(includeItem) {
                var logError = function() {
                    console.error("MonkeyScript: Include contains a URL with a hash parameter which is not supported.");
                    process.exit();
                };

                if (hasStringIncludesSupport) {
                    if (includeItem.includes("#")) {
                        logError();
                    }
                } else {
                    if (includeItem.indexOf("#") > -1) {
                        logError();
                    }
                }

                userScript += this.geConfigLine("include", includeItem);
            });
        }

        if (config.match) {
            if (typeof config.match === "string") {
                console.error("MonkeyScript: Match expected an array, but got string.");
                process.exit();
            }

            config.match.forEach(function(matchItem) {
                userScript += this.geConfigLine("match", matchItem);
            });
        }

        if (config.exclude) {
            if (typeof config.exclude === "string") {
                console.error("MonkeyScript: Exclude expected an array, but got string.");
                process.exit();
            }

            config.exclude.forEach(function(excludeItem) {
                userScript += this.geConfigLine("exclude", excludeItem);
            });
        }

        if (config.require) {
            if (typeof config.require === "string") {
                console.error("MonkeyScript: Require expected an array, but got string.");
                process.exit();
            }

            if (config.useStrict) {
                console.warn("MonkeyScript: WARNING: useStrict might influence the @require scripts.");
            }

            config.require.forEach(function(requireItem) {
                userScript += this.geConfigLine("require", requireItem);
            });
        }

        if (config.resource) {
            if (typeof config.resource === "string") {
                console.error("MonkeyScript: Resource expected an array, but got string.");
                process.exit();
            }

            config.resource.forEach(function(resourceItem) {
                if (typeof resourceItem !== "object") {
                    console.error("MonkeyScript: A resource should be of type array containing objects with key/value pairs.");
                    process.exit();
                }

                var key = Object.keys(resourceItem)[0];
                var value = resourceItem[key];
                
                userScript += this.geConfigLine("resource", key + " " + value);
            });
        }

        if (config.connect) {
            if (typeof config.connect === "string") {
                console.error("MonkeyScript: Connect expected an array, but got string.");
                process.exit();
            }

            config.connect.forEach(function(connectItem) {
                userScript += this.geConfigLine("connect", connectItem);
            });
        }

        if (config.domain) {
            if (typeof config.domain === "string") {
                console.error("MonkeyScript: Domain expected an array, but got string.");
                process.exit();
            }

            config.domain.forEach(function(domainItem) {
                userScript += this.geConfigLine("domain", domainItem);
            });
        }

        if (config.runAt) {
            userScript += this.geConfigLine("run-at", config.runAt);
        }

        if (config.grant) {
            if (typeof config.grant === "string") {
                console.error("MonkeyScript: Grant expected an array, but got string.");
                process.exit();
            }

            config.grant.forEach(function(grantItem) {
                userScript += this.geConfigLine("grant", grantItem);
            });
        }

        if (config.noFrames) {
            userScript += "// @noframes\n";
        }

        if (config.unwrap) {
            userScript += "// @unwrap\n";
        }

        if (config.noCompat) {
            userScript += this.geConfigLine("nocompat", config.noCompat);
        }

        if (config.copyright) {
            userScript += this.geConfigLine("copyright", config.copyright);
        }

        userScript += "// ==/UserScript==\n";

        if (config.useStrict) {
            userScript += "'use strict';\n";
        }
        
        return userScript += "\n";
    }
}

module.exports = Compiler;