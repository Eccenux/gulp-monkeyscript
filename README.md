## Install

```
$ npm install gulp-monkeyscript --save-dev
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for details on customizing gulp-monkeyscript.

## Usage

Either use `package.json` directly or use separate `monkeyscript.json`.

If you use `monkeyscript.json` you can and add the following line in it to get Intellisense working:
```
"$schema": "./node_modules/gulp-monkeyscript/schema.json",
```
Add the key-value pairs to your needs. See <a href="#showcase">Showcase</a> for an example.

`gulpfile.js`:

```js
var ms = require('gulp-monkeyscript');
var msProject = ms.createProject("monkeyscript.json");

gulp.src("src/**/*.js")
	.pipe(concat("script.user.js"))
    .pipe(msProject())
	.pipe(gulp.dest("dist/"));

```

## Showcase
This `monkeyscript.json`:
```json
{
    "$schema": "./node_modules/gulp-monkeyscript/schema.json",
    "name": "My Awesome Userscript!",
    "version": "1.0.0",
    "author": "Tom",
    "description": "This userscript adds new functionality!",
    "match": [
        "http://www.website.com/page1/",
        "http://www.website-alter.com/*"
    ],
    "runAt": "document-start",
    "useStrict": true
}
```

Becomes:

```js
// ==UserScript==
// @name        My Awesome Userscript!
// @version     1.0.0
// @author      Tom
// @description This userscript adds new functionality!
// @match       http://www.website.com/page1/
// @match       http://www.website-alter.com/*
// @run-at      document-start
// ==/UserScript==
'use strict';

<other source>
```

Where `<other source>` is whatever things you contacted or built with gulp.

## Using package.json

Basic `package.json` can be generate with a standard Node command:
```
npm init
``` 

By using `package.json` you will not have to repeat author, name, version and description twice.

You will just add user-script specific information in a separate property called `"monkeyscript"`.

So a minimum `package.json` would be created by adding some `match` array for user-script *meta* like so:
```json
{
    "author": "Tom",
    "name": "My Awesome Userscript!",
    "version": "1.0.0",
    "description": "This userscript adds new functionality!",
	"monkeyscript": {
	    "meta": {
		    "match": [
		        "http://www.expample.com/page1/*"
		    ]
		}
	}
}
```

`gulpfile.js`:

```js
const ms = require('gulp-monkeyscript');
const msProject = ms.createProject("package.json");

gulp.src("src/**/*.js")				// get all js from `src` folder 
	.pipe(concat("script.user.js"))	// concat js to a single file
    .pipe(msProject())				// append Grease/Tampermonkey header to that file
	.pipe(gulp.dest("dist/"));		// put the file in `dist` folder

```

## Dependencies
- <a href="https://www.npmjs.com/package/readable-stream">readable-stream</a>
- <a href="https://www.npmjs.com/package/streamqueue">streamqueue</a>

## License

MIT © 2017-2020 Tom O'Neill, Maciej Nux Jaros
