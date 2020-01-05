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
     * Append options array config.
     * @param {Array} options 
     */
    appendOptions(options) {
        let userScript = "";
        const config = this.config;
        options.forEach((element) => {
            if (typeof element === "string") {
                element = {key:element, label:element};
            }
            if (element.key in config) {
                userScript += this.geConfigLine(element.label, config[element.key]);
            }
        });
        return userScript;
    }

    /**
     * Get whole header for a user.script.js.
     */
    compile () {
        var me = this;
        var config = this.config;
        var userScript = "// ==UserScript==\n";

        var options = [
            'author',
            'name',
            'id',
            'category',
            'namespace',
            "version",
            "description",
            "copyright",
            "homepage",
            {"label":"homepageURL","key":"homepageUrl"},
            {"label":"supportURL","key":"supportUrl"},
            "website",
            "source",
            "icon",
            {"label":"iconURL","key":"iconUrl"},
            {"label":"defaulticon","key":"defaultIcon"},
            "icon64",
            {"label":"icon64URL","key":"icon64Url"},
            {"label":"nocompat","key":"noCompat"},
            {"label":"run-at","key":"runAt"},
        ];
        userScript += this.appendOptions(options);
 
        if (config.updateUrl) {
            if (!config.version) {
                console.warn("MonkeyScript: WARNING: version was not present but it is required for updateUrl to work.");
            }

            userScript += me.geConfigLine("updateURL", config.updateUrl);
        }
        
        if (config.downloadUrl) {
            userScript += me.geConfigLine("downloadURL", config.downloadUrl);
        }
        
        if (config.include) {
            if (typeof config.include === "string") {
                console.error("MonkeyScript: Include expected an array, but got string.");
            }
            
            config.include.forEach(function(includeItem) {
                if (includeItem.indexOf("#") > -1) {
                    console.error("MonkeyScript: Include contains a URL with a hash parameter which is not supported.");
                    process.exit();
                }

                userScript += me.geConfigLine("include", includeItem);
            });
        }

        if (config.match) {
            if (typeof config.match === "string") {
                console.error("MonkeyScript: Match expected an array, but got string.");
                process.exit();
            }

            config.match.forEach(function(matchItem) {
                userScript += me.geConfigLine("match", matchItem);
            });
        }

        if (config.exclude) {
            if (typeof config.exclude === "string") {
                console.error("MonkeyScript: Exclude expected an array, but got string.");
                process.exit();
            }

            config.exclude.forEach(function(excludeItem) {
                userScript += me.geConfigLine("exclude", excludeItem);
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
                userScript += me.geConfigLine("require", requireItem);
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
                
                userScript += me.geConfigLine("resource", key + " " + value);
            });
        }

        if (config.connect) {
            if (typeof config.connect === "string") {
                console.error("MonkeyScript: Connect expected an array, but got string.");
                process.exit();
            }

            config.connect.forEach(function(connectItem) {
                userScript += me.geConfigLine("connect", connectItem);
            });
        }

        if (config.domain) {
            if (typeof config.domain === "string") {
                console.error("MonkeyScript: Domain expected an array, but got string.");
                process.exit();
            }

            config.domain.forEach(function(domainItem) {
                userScript += me.geConfigLine("domain", domainItem);
            });
        }

        if (config.grant) {
            if (typeof config.grant === "string") {
                console.error("MonkeyScript: Grant expected an array, but got string.");
                process.exit();
            }

            config.grant.forEach(function(grantItem) {
                userScript += me.geConfigLine("grant", grantItem);
            });
        }

        if (config.noFrames) {
            userScript += "// @noframes\n";
        }

        if (config.unwrap) {
            userScript += "// @unwrap\n";
        }

        userScript += "// ==/UserScript==\n";

        if (config.useStrict) {
            userScript += "'use strict';\n";
        }
        
        return userScript += "\n";
    }
}

module.exports = Compiler;