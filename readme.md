# mocha-given

[![Build Status](https://travis-ci.org/rendro/mocha-given.png?branch=development)](https://travis-ci.org/rendro/mocha-given)
[![NPM version](https://badge.fury.io/js/mocha-given.png)](http://badge.fury.io/js/mocha-given)

Mocha-given is a mocha interface that helps you write cleaner specs using `Given`, `When`, `Then` and `And`.
It is a shameless port of Justin Searls' [jasmine-given](https://github.com/searls/jasmine-given) which is a tribute to Jim Weirich's terrific [rspec-given](https://github.com/jimweirich/rspec-given) gem.

## Example Specs

``` coffeescript
describe 'assigning stuff to this', ->
	Given -> @number = 24
	When  -> @number++
	And   -> @number *= 2
	Then  -> @number == 50

describe 'assigning stuff to variables', ->
	subject = null
	Given -> subject = []
	When  -> subject.push('foo')
	Then  -> subject.length == 1

describe 'Testing deferred', ->
	Given -> @t = Date.now()
	Then.after 1500, 'so much time has passed', -> Date.now() - @t >= 1500

describe 'Testing async', ->
	Given -> @subject = new User()
	Then 'save user', (done) -> @subject.save(done);
```

## Run tests

### Global installation of mocha

If you have mocha installed globally you need to install mocha-given globally as well.
```
$ npm install -g mocha mocha-given
```
Then you can run your tests by setting the interface of mocha to mocha-given
```
$ mocha -u mocha-given --compilers coffee:coffee-script -R spec
```
### Local installation of mocha

If you have installed mocha and mocha-given locally
```
$ npm install mocha-given coffee-script
```
you have to call the mocha binary directly:
```
$ ./node_modules/.bin/mocha -u mocha-given --compilers coffee:coffee-script -R spec
```

## Run mocha-given tests & start contributing

To run the `mocha-given` tests for developing, it has to be symlinked into the `node_modules` folder to enable `mocha` to resolve `mocha-given`.

Therefore run the script:

```
$ npm run link
```

Afterwards `mocha` has to be installed with ` $ npm install mocha`.

Now you can run the tests using `$ npm tests` and start contributing.

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

Credits
-------

Thanks to [SinnerSchrader](http://www.sinnerschrader.com/) for their support and the time to work on this project.
