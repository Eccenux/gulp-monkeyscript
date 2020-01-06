Install and test
----------------
To prepare the project you will need [Node.js](https://nodejs.org/en/). Version 8.2 or above should be fine (mostly because using `padEnd`; see [Node compatibility chart](https://node.green/))

Now that you have node install dependencies:
```
npm install
```

To check if it work run tests:
```
npm test
```

Running a local copy
--------------------
Note to use a development version of gulp-monkeyscript in your script install it as a folder. So use something like:
```
npm install ..\..\gulp-monkeyscript\ 
```

This will allow you to run with your modification before pushing them back to Github.

Debugging tests
---------------

### VSCode ###
Probably the easiest way to debug tests is to use Visual Studio Code. Just set a breakpoint in a test file in some test and press F5.

Note! On Windows, if you are using *symbolic links*, then debugging might seem to be broken. Either use the `debugger` keyword in tests or make sure to use final path. So this is only a problem with setting breakpoints.

### Chrome ###

Another way would be to use Chrome DevTools.
1. Install mocha globally (`npm install -g mocha`).
2. Put the `debugger` keyword in a test you want to debug. 
3. Run mocha in *inspect* mode (`mocha --inspect`) or with immediate brake (`mocha --inspect-brk`).
	* This should show something like:
	* "Debugger listening on ws://127.0.0.1:1234/43301230a-2ad8-42e8-b12d-41351cee47dd"
4. Open Chrome DevTools.
5. Click on Node icon in DevTools.