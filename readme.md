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

### Global installation of mocha

If you have mocha installed globally you need to install mocha-given globally as well.

$ npm install -g mocha mocha-given

Then you can run your tests by setting the interface of mocha to mocha-given

$ mocha -u mocha-given --compilers coffee:coffeescript -R spec

### Local installation of mocha

If you have installed mocha and mocha-given locally

$ npm install mocha mocha-given

you have to call the mocha binary directly:

$ ./node_modules/.bin/mocha -u mocha-given --compilers coffee:coffeescript -R spec


## Run tests programmatically

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

Run from command line (with mocha and mocha-given installed):

```
$ node runtests.js
```
