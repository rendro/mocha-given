# mocha-given

Mocha-given is a mocha interface that helps you write cleaner specs using `Given`, `When`, and `Then`.
It is a shameless port of Justin Searls' [jasmine-given](https://github.com/searls/jasmine-given).

## Example Specs

``` coffeescript
describe "assigning stuff to this", ->
	Given -> @number = 24
	Given -> @number++
	When -> @number *= 2
	Then -> @number == 50

describe "assigning stuff to variables", ->
	subject = null
	Given -> subject = []
	When -> subject.push('foo')
	Then -> subject.length == 1
```

## Run tests

Currently it is only possible to run tests programatically. For example safe this file as `runtests.js`:

``` javascript
var Mocha = require('mocha');
var fs    = require('fs');
var path  = require('path');

// require mocha-given after Mocha is set
require('mocha-given');

// the directory with your tests/specs
var testDir = 'tests';

// First, you need to instantiate a Mocha instance.
var mocha = new Mocha({
	ui: 'mocha-given',
	reporter: 'spec'
});

// Get test files
fs.readdirSync(testDir).filter(function(file){
	// allow javascript and coffescript files
	return file.match(/\.(coffee|js)$/);
}).forEach(function(file){
	mocha.addFile(
		path.join(testDir, file)
	);
});

// Now, you can run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
	process.exit(failures);
  });
});
```
And the run from command line (with mocha and coffeescript installed):

```
$ node runtests.js
```
