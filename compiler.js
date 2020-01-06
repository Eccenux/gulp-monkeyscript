"use-strict";
const fs = require('fs');

class Compiler {
    constructor(rawConfig, basePad) {
        let type = this.getConfigType(rawConfig);
        let config = this.preProcess(rawConfig, type);
        let base = typeof basePad === 'number' ? basePad : 10;
        this.keysLength = this.getKeysLength(config, base);
        this.rawConfig = rawConfig;
    }

    /**
     * Main compilation.
     * 
     * Creates whole header for a user.script.js.
     */
    compile () {
        let userScript = "// ==UserScript==\n";
        userScript += this.generateMeta();
        userScript += "// ==/UserScript==\n";

        if (this.config.useStrict || this.options.useStrict) {
            userScript += "'use strict';\n";
        }
        if (this.options.prependCSS) {
            let css = this.getFileContents(this.options.prependCSS);
            userScript += "\nvar _css = "+this.prepareTemplateString(css)+";\n";
        }
        
        return userScript += "\n";
    }

    /**
     * Prepare multi-line string for inclusion in JavaScript.
     * 
     * Note! New line characters are added because slash (\) at the end of template string would brake template syntax.
     * Starting new line is added for code beauty ;-).
     * 
     * @param {String} text Some string.
     */
    prepareTemplateString(text) {
        if (text.search(/[`$]/)>=0) {
            text = text.replace(/([`$])/g, '\\$1');
            return "String.raw`\n"+text+"\n`.replace(/\\\\([`$])/g, '\\$1')";
        }
        return "String.raw`\n"+text+"\n`";
    }

    /**
     * Get raw file contents.
     * @param {String} input File path.
     */
    getFileContents(input) {
        try {
            return fs.readFileSync(input).toString();
        } catch (error) {
            console.error("MonkeyScript: Could not load file. ", error.message);
            return false;
        }
    }
    
    /**
     * Get type of configuration.
     * @param {Object} rawConfig Object.
     * @returns {String} "simple" when only meta object was passed; "package" when package.json or monkeyscript with options was passed.
	 * @private
     */
    getConfigType(rawConfig) {
        if ("monkeyscript" in rawConfig) {
            return "package";
        }
        return "simple";
    }

    /**
     * Get type of configuration.
     * @param {Object} object Object.
     * @returns {Number} max length or base.
	 * @private
     */
    preProcess(rawConfig, type) {
        let rawConfigClone = JSON.parse(JSON.stringify(rawConfig));
        // only meta, so not much to do
        if (type === "simple") {
            this.config = rawConfigClone;
            this.options = {};
            return rawConfigClone;
        }

        // start with meta
        let config = {};
        if (rawConfigClone.monkeyscript && rawConfigClone.monkeyscript.meta) {
            config = rawConfigClone.monkeyscript.meta;
        }
        // extract data from package.json
        let keys = [
            'author',
            'name',
            "version",
            "description",
        ];
        keys.forEach(key => {
            if (!(key in config) && (key in rawConfigClone)) {
                config[key] = rawConfigClone[key];
            }
        });
        this.config = config;
        this.options = rawConfigClone.monkeyscript;
        return config;
    }
    
    /**
     * Get top length of keys.
     * @param {Object} object Object.
     * @param {Number} base Base (min) length.
     * @returns {Number} max length or base.
	 * @private
     */
    getKeysLength(object, base) {
        let length = base ? base : 0;
        Object.keys(object).forEach((value)=>{
            if (value.length > length) {
                length = value.length;
            }
        });
        return length;
    }

    /**
     * Get monkey script meta data line.
     * @param {String} key Name of the key.
     * @param {String} value Name of the value.
	 * @private
     */
    getMetaLine(key, value) {
        return "// @"+key.padEnd(this.keysLength)+" " + value + "\n";
    }

    /**
     * Generate meta data from options array and config.
     * @param {Array} options 
	 * @private
     */
    generateMetaOptions(options) {
        let userScript = "";
        const config = this.config;
        options.forEach((element) => {
            if (typeof element === "string") {
                element = {key:element, label:element};
            }
            if (element.key in config) {
                userScript += this.getMetaLine(element.label, config[element.key]);
            }
        });
        return userScript;
    }

    /**
     * Generate all meta data (and configuration) lines for a user.script.js.
	 * @private
     */
    generateMeta () {
        const me = this;
        const config = this.config;
        let userScript = "";

        let options = [
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
        userScript += this.generateMetaOptions(options);
 
        if (config.updateUrl) {
            if (!config.version) {
                console.warn("MonkeyScript: WARNING: version was not present but it is required for updateUrl to work.");
            }

            userScript += me.getMetaLine("updateURL", config.updateUrl);
        }
        
        if (config.downloadUrl) {
            userScript += me.getMetaLine("downloadURL", config.downloadUrl);
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

                userScript += me.getMetaLine("include", includeItem);
            });
        }

        if (config.match) {
            if (typeof config.match === "string") {
                console.error("MonkeyScript: Match expected an array, but got string.");
                process.exit();
            }

            config.match.forEach(function(matchItem) {
                userScript += me.getMetaLine("match", matchItem);
            });
        }

        if (config.exclude) {
            if (typeof config.exclude === "string") {
                console.error("MonkeyScript: Exclude expected an array, but got string.");
                process.exit();
            }

            config.exclude.forEach(function(excludeItem) {
                userScript += me.getMetaLine("exclude", excludeItem);
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
                userScript += me.getMetaLine("require", requireItem);
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

                let key = Object.keys(resourceItem)[0];
                let value = resourceItem[key];
                
                userScript += me.getMetaLine("resource", key + " " + value);
            });
        }

        if (config.connect) {
            if (typeof config.connect === "string") {
                console.error("MonkeyScript: Connect expected an array, but got string.");
                process.exit();
            }

            config.connect.forEach(function(connectItem) {
                userScript += me.getMetaLine("connect", connectItem);
            });
        }

        if (config.domain) {
            if (typeof config.domain === "string") {
                console.error("MonkeyScript: Domain expected an array, but got string.");
                process.exit();
            }

            config.domain.forEach(function(domainItem) {
                userScript += me.getMetaLine("domain", domainItem);
            });
        }

        if (config.grant) {
            if (typeof config.grant === "string") {
                console.error("MonkeyScript: Grant expected an array, but got string.");
                process.exit();
            }

            config.grant.forEach(function(grantItem) {
                userScript += me.getMetaLine("grant", grantItem);
            });
        }

        if (config.noFrames) {
            userScript += "// @noframes\n";
        }

        if (config.unwrap) {
            userScript += "// @unwrap\n";
        }

        return userScript;
    }
}

module.exports = Compiler;