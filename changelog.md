# Changelog

## 0.4.0

Fixes found by an adversarial audit. Three of these caused specs to **pass when
they should have failed**, which for a test framework is the worst possible
defect: it hands you false confidence.

### Fixed
* **`Invariant` was never asserted.** The readme says an invariant is "asserted
  before every Then in scope", but invariants ran through the waterfall, which
  discards return values. `Invariant(() => false)` passed silently; only an
  invariant that *threw* ever failed. Invariants are assertions now. `When`
  steps are setup and still legitimately return anything.
* **`done(err)` from a `When` or `Invariant` was discarded.**
  `asyncTaskCompleted` took no argument, so an errored step was
  indistinguishable from a successful one and the spec passed. `Given` goes
  through mocha's real `beforeEach` and failed correctly, so the two were
  silently asymmetric.
* **`Then.only` and `it.only` crashed the entire run.** Both called
  `Mocha.utils.escapeRegexp`, which does not exist anywhere in the supported
  peer range. Focusing a single spec threw at load time and ran zero tests.
  Both now use mocha's own `markOnly`, which also fixes `describe.only`
  matching unrelated suites by substring.
* An `And` written after a `describe.skip` / `xdescribe` block attached to a
  `Then` *inside* the skipped suite, so it never ran and was never reported.
* A synchronous throw from a step after an earlier step returned a promise
  became an unhandled rejection, surfacing as a bogus timeout instead of the
  real error.
* The "a step may take `done` or return a promise, not both" guard ran after the
  step body, so a step that called `done()` synchronously triggered mocha's
  "done() called multiple times" instead of the intended message. Async
  functions declaring `done` are now rejected before the body runs.
* `Then.after(1500, ...)` rendered its title as "after 1.5 ms" — it converted to
  seconds but still printed "ms".
* The `browser` entry point could not be bundled: a static bare
  `require('mocha')` is resolved eagerly by bundlers regardless of the runtime
  guards around it.
* The readme's explanation of arrow functions was wrong. `Then(() => this.x)`
  usually *passes*, because module-level `this` is `module.exports` in
  CommonJS; the real hazard is that the state is file-global and leaks between
  specs.

## 0.3.0

### Changed
* **`And` after `Then` no longer re-runs the setup** (#2, open since 2014). An
  `And` following a `Then` now joins that spec instead of declaring a new one,
  so the `Given` and `When` before it run once for the whole group rather than
  once per assertion. This is the `subsequentThen` behaviour of jasmine-given,
  which mocha-given set out to mirror.

  A `Then` plus two `And`s used to be three tests that each re-ran setup; it is
  now one test with three assertions, titled
  `then a === 1 and b === 2 and c === 3`. Two separate `Then`s still run the
  setup twice.

  `And` after a `Given`, `When` or `Invariant` is unchanged.
* `Then.only` now sets the target for a following `And`, as `Then` and
  `Then.after` already did.

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
