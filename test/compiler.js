const assert = require('chai').assert;

var Compiler = require('../compiler');

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

    // geConfigLine function
    describe('geConfigLine', function () {
        it('Should start with key', function () {
            let compiler = new Compiler({abc:123});
            let result = "";
            result = compiler.geConfigLine('abc', 123);
			assert.isTrue(result.startsWith('// @abc'));
		});
        it('Should be aligned with spaces', function () {
            let compiler = new Compiler({abc:123, abcdef:234}, 0);
            assert.equal(compiler.keysLength, 6);
            let result = "";
            result = compiler.geConfigLine('abcdef', 234);
			assert.equal(result, '// @abcdef 234\n');
            result = compiler.geConfigLine('abc', 123);
			assert.equal(result, '// @abc    123\n');
		});
    });
});