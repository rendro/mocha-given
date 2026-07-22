# Changelog

## 0.2.0

Rewritten in plain JavaScript. **No runtime dependencies**: `coffee-script` is
gone, which also removes a formally deprecated package ("CoffeeScript on NPM has
moved to `coffeescript`") and about 420 kB per install. Behaviour is unchanged
apart from the fixes below, verified by porting the existing suite test for test.

### Fixed
* **Arrow functions work.** `Then(() => true)` used to hang until the mocha
  timeout and report a blank title: `hasArguments` decided whether a function
  took a `done` callback by matching its source against `/^function \(\)/`,
  which an arrow never satisfies, so the library waited for a callback that
  never came. Arity is used now, and titles are read from arrow bodies too.
* **Async functions are recognised.** `Object.prototype.toString` reports them
  as `[object AsyncFunction]`, so `Then(async () => ...)` failed to find its
  function argument at all.
* A failing assertion whose expression could not be evaluated reported a
  `SyntaxError` from the internal `eval` instead of the actual failure.

### Added
* **Promise support** (#7). `Given`, `When`, `Invariant` and `Then` may return a
  promise, and each step is awaited before the next. The named forms
  (`Given('x', fn)`, `When('x', fn)`) assign the resolved value. A step may take
  a `done` callback or return a promise, but not both.
* CI across mocha 8, 9, 10 and 11, and Node 20, 22 and 24.

### Changed
* **CoffeeScript users must register the compiler themselves.** `index.js` used
  to `require('coffee-script/register')` as a side effect, which also registered
  the `.coffee` extension for your specs. Add
  `--require coffeescript/register` to your mocha invocation. Note the modern
  package name has no hyphen.
* `license` is MIT in `package.json`, matching `license.txt`. It previously
  declared Apache 2.0 in the deprecated `licenses` array.
* The generated `browser/mocha-given.js` is gone. `browser` now points at
  `lib/mocha-given.js`, which needs no build step.
* Minimum mocha is 8.

## Version 0.1.2, Jul 10, 2014
* Return value of assertion must strictly equal false for test to fail #3
* Add browser field to package.json

## Version 0.1.1, Jun 5, 2014
* Update coffee-script and mocha peer dependency

## Version 0.1.0, Feb 4, 2014
* Update all dependencies

## Version 0.0.18, Jan 8, 2014
* Updated mocha peer dependency

## Version 0.0.17, Dec 17, 2013
* fixed undefined error in test label

## Version 0.0.16, Dec 13, 2013
* added `Then.only` for deferred tests
* added async `Whens` and `Invariants`

## Version 0.0.15, Dec 11, 2013
* added mocha-given interface for tests running in a browser

## Version 0.0.14, Dec 11, 2013
* removed useless dependencies

## Version 0.0.13, Dec 11, 2013
* fixed async `Thens`

## Version 0.0.12, Dec 10, 2013
* remove expect.js dependency

## Version 0.0.11, Dec 10, 2013
* Add `Invariant`

## Version 0.0.10, Dec 9, 2013
* `When` has same syntax and logic as `Given`
* added more tests

## Version 0.0.9, Dec 9, 2013
* execute all `Givens` before the `Whens`
* added given when then execution order tests

## Version 0.0.8, Dec 9, 2013
* fixed scope errors my mochas "shared behaviour"

## Version 0.0.7, Dec 5, 2013
* added support for async `Then` with a done callback

## Version 0.0.6, Dec 5, 2013
* fixed `And`

## Version 0.0.5, Dec 4, 2013
* Added `And`

## Version 0.0.4, Dec 3, 2013
* fixed broken export

## Version 0.0.3, Dec 3, 2013
* export MochaGivenSuite to allow it being automatically loaded by mocha

## Version 0.0.2, Dec 3, 2013
* Added `Then.only`

## Version 0.0.1, Dec 3, 2013
* Initial version with `Given`, `When`, and `Then`
