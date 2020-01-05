## Install

```
$ npm install gulp-monkeyscript --save-dev
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for details on customizing gulp-monkeyscript.

## Usage

Add `monkeyscript.json` to the root of your project and add the following line to get Intellisense working:
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
// @name		My Awesome Userscript!
// @version		1.0.0
// @author		Tom
// @description		This userscript adds new functionality!
// @match		http://www.website.com/page1/
// @match		http://www.website-alter.com/*
// @run-at		document-start
// ==/UserScript==
'use strict';

<other source>
```

## Dependencies
- <a href="https://www.npmjs.com/package/readable-stream">readable-stream</a>
- <a href="https://www.npmjs.com/package/streamqueue">streamqueue</a>


## License

MIT © 2017-2020 Tom O'Neill, Maciej Nux Jaros
