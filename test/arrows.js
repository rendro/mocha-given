const expect = require('expect.js');

let capturedTitle = null;

// Every spec in this file times out or reports a blank title on 0.1.3:
// `hasArguments` decided whether a function took `done` by matching its source
// against /^function \(\)/, which an arrow never satisfies, so the library
// waited for a callback that was never coming.
describe('arrow functions', function () {
  describe('as Then', function () {
    When('sum', function () {
      return 2 + 3;
    });
    Then(() => true);
    And(() => 1 === 1);
  });

  describe('reading closure variables', function () {
    let subject = null;
    Given(() => {
      subject = [];
    });
    When(() => {
      subject.push('foo');
    });
    Then(() => subject.length === 1);
    And(() => expect(subject).to.have.length(1));
  });

  describe('a failing arrow still fails', function () {
    let flag = null;
    Given(() => {
      flag = false;
    });
    // the assertion runs in a classic function so `this` is the mocha context;
    // the point is that the arrow Given above ran at all
    Then(function () {
      return flag === false;
    });
  });

  // capture the generated title from a hook, where `this.currentTest` is the
  // test about to run, then assert on it separately
  describe('titles are derived from arrow bodies', function () {
    Given(function () {
      capturedTitle = this.currentTest.title;
    });
    Then(() => 1 + 1 === 2);
  });

  describe('the captured title', function () {
    Then(function () {
      expect(capturedTitle).to.be('then 1 + 1 === 2');
    });
  });

  describe('arrow taking done is detected by arity', function () {
    Given('t', () => Date.now());
    Then((done) => setTimeout(done, 20));
  });

  describe('block bodied arrows', function () {
    Given('n', () => {
      return 4;
    });
    Then(() => {
      return true;
    });
  });
});

describe('async functions are recognised as functions', function () {
  // Object.prototype.toString reports [object AsyncFunction], so 0.1.3 failed
  // to find the function argument at all
  Given('n', async () => 21);
  Then(function () {
    return this.n === 21;
  });
});
