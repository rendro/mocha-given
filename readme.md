# mocha-given

[![CI](https://github.com/rendro/mocha-given/actions/workflows/ci.yml/badge.svg)](https://github.com/rendro/mocha-given/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/mocha-given.svg)](https://www.npmjs.com/package/mocha-given)

Mocha-given is a mocha interface that helps you write cleaner specs using `Given`, `When`, `Then` and `And`.
It is a shameless port of Justin Searls' [jasmine-given](https://github.com/searls/jasmine-given) which is a tribute to Jim Weirich's terrific [rspec-given](https://github.com/jimweirich/rspec-given) gem.

Zero dependencies. Works with mocha 8 through 11.

## Install

```
$ npm install --save-dev mocha mocha-given
```

Run your specs with the interface set to `mocha-given`:

```
$ mocha --ui mocha-given
```

## Example specs

### JavaScript

```js
describe('assigning stuff to this', function () {
  Given(function () { this.number = 24; });
  When(function () { this.number++; });
  And(function () { this.number *= 2; });
  Then(function () { return this.number === 50; });
});

describe('assigning stuff to variables', function () {
  let subject = null;
  Given(() => { subject = []; });
  When(() => { subject.push('foo'); });
  Then(() => subject.length === 1);
});

describe('Testing deferred', function () {
  Given(function () { this.t = Date.now(); });
  Then.after(1500, 'so much time has passed', function () {
    return Date.now() - this.t >= 1500;
  });
});

describe('Testing async', function () {
  Given(function () { this.subject = new User(); });
  Then('save user', function (done) { this.subject.save(done); });
});
```

### CoffeeScript

```coffee
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

CoffeeScript specs need the compiler registered yourself, which mocha-given no
longer does for you:

```
$ mocha --ui mocha-given --require coffeescript/register --extension coffee
```

## Arrow functions and `this`

Both styles below work, but they are not interchangeable.

State shared between `Given`, `When` and `Then` lives on mocha's test context,
which you reach through `this`. Arrow functions do not bind `this`, and neither
`call` nor `apply` can change that, so a spec that touches `this` **must** use a
classic function:

```js
Given(function () { this.number = 24; });     // writes to the test context
Then(function () { return this.number === 24; });

Given(() => { this.number = 24; });            // writes to module scope
Then(() => this.number === 24);                // reads module scope
```

The arrow version is worse than it looks. It often *passes*, because in
CommonJS the module-level `this` is `module.exports`, so both arrows share one
object. But that object is global to the file and is never reset between tests,
so state leaks from one spec into the next:

```js
describe('first', function () {
  Given(() => { this.n = 1; });
  Then(() => this.n === 1);        // passes
});
describe('second', function () {
  Then(() => this.n === 1);        // also passes, with no Given at all
});
```

Specs built on closure variables have no such constraint, and arrows read
better there:

```js
let subject = null;
Given(() => { subject = []; });
Then(() => subject.length === 0);
```

| Spec style | Use |
| --- | --- |
| `this.foo` shared state | `function` |
| closure variables | arrow, or `function` |

## And after Then

An `And` following a `Then` becomes part of that same spec, so the `Given` and
`When` setup runs **once** for the whole group rather than once per assertion:

```js
Given(function () { this.subject = expensiveSetup(); });
When(function () { this.result = this.subject.run(); });
Then(function () { return this.result.ok === true; });
And(function () { return this.result.items.length === 3; });
And(function () { return this.result.errors.length === 0; });
```

That is one test, one setup. Its title joins the assertions:

```
✔ then this.result.ok === true and this.result.items.length === 3 and this.result.errors.length === 0
```

Two separate `Then`s still run the setup twice, which is the distinction
[rspec-given](https://github.com/jimweirich/rspec-given) and
[jasmine-given](https://github.com/searls/jasmine-given) draw. Use `And` when
several assertions describe one outcome, and a second `Then` when you want a
fresh fixture.

`And` after a `Given`, `When` or `Invariant` is unchanged: it repeats that
construct.

## Promises

`Given`, `When`, `Invariant` and `Then` may all return a promise, and each step
is awaited before the next one runs.

```js
describe('loading a user', function () {
  Given('user', async () => fetchUser(1));
  When('name', function () { return this.user.name; });
  Then(function () { return this.name === 'Ada'; });
});
```

The named forms assign the **resolved value**, not the promise, so `this.user`
above is the user object.

A `Then` that resolves to `false` fails, and a rejection fails with its own
error. A step may take a `done` callback or return a promise, but not both.

## API

| | |
| --- | --- |
| `Given(fn)` | Runs before each `Then` in scope. Sets up state |
| `Given(name, fn)` | Assigns the return value to `this[name]` |
| `When(fn)` | Runs after all `Given`s, immediately before each `Then` |
| `When(name, fn)` | Assigns the return value to `this[name]` |
| `Then(fn)` | A spec. Fails if `fn` returns `false` or throws |
| `Then(label, fn)` | Same, with an explicit title |
| `Then.after(ms, label, fn)` | Runs the assertion after a delay |
| `Then.only(...)` | Runs only this spec |
| `And(fn)` | Repeats whichever of `Given`, `When` or `Invariant` came last. After a `Then` it adds an assertion to that same spec |
| `Invariant(fn)` | Asserted before every `Then` in scope |

A `Then` without a label takes its title from the source of the expression, so
`Then(() => this.sum === 5)` reads as `then this.sum === 5`. Comments inside the
function body end up in the title, so keep them above the call.

When an assertion fails, the comparison is reported with both sides evaluated:

```
1) then this.sum === 99:
   Error: return value is false
   Expected '5' to strictly equal '99'
   Comparison: this.sum === 99
```

## Run tests programmatically

```js
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

// require mocha-given after Mocha is loaded
require('mocha-given');

const testDir = 'test';

const mocha = new Mocha({
  ui: 'mocha-given',
  reporter: 'spec',
});

fs.readdirSync(testDir)
  .filter((file) => /\.(coffee|js)$/.test(file))
  .forEach((file) => mocha.addFile(path.join(testDir, file)));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
```

## Contributing

```
$ npm install
$ npm test
```

`npm test` runs the JavaScript specs and then a small CoffeeScript spec that
guards against breaking CoffeeScript users.

## Credits

Thanks to [SinnerSchrader](http://www.sinnerschrader.com/) for their support and the time to work on this project.

## License

MIT
