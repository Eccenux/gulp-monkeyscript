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
});