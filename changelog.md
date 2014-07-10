# CHANGELOG

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
