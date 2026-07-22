const expect = require('expect.js');
const { execFileSync } = require('child_process');
const path = require('path');

const MOCHA = path.join(__dirname, '..', 'node_modules', '.bin', 'mocha');
const ENTRY = path.join(__dirname, '..', 'index.js');
const FIXTURES = path.join(__dirname, 'fixtures');

let capturedTitle = null;

const run = (fixture) => {
  try {
    const stdout = execFileSync(
      MOCHA,
      ['--require', ENTRY, '--ui', 'mocha-given', '-R', 'spec', path.join(FIXTURES, fixture)],
      { encoding: 'utf8', stdio: 'pipe' },
    );
    return { failed: false, output: stdout };
  } catch (err) {
    return { failed: true, output: `${err.stdout || ''}${err.stderr || ''}` };
  }
};

// Issue #2: an And after a Then belongs to the same spec, so the Given and
// When that preceded it run once rather than once per assertion.
describe('And after Then shares the setup', function () {
  this.timeout(20000);

  describe('setup runs once for a Then plus its Ands', function () {
    let setupRuns = 0;
    Given(() => {
      setupRuns++;
    });
    When(() => {});
    Then(() => true);
    And(() => true);
    And(function () {
      return setupRuns === 1;
    });
  });

  describe('two separate Thens still run setup twice', function () {
    // jasmine-given semantics, and what was agreed on the issue thread
    let runs = 0;
    Given(() => {
      runs++;
    });
    Then(() => runs === 1);
    Then(() => runs === 2);
  });

  describe('every assertion in the group actually runs', function () {
    const seen = [];
    Given(() => {
      seen.length = 0;
    });
    Then(() => {
      seen.push('a');
      return true;
    });
    And(() => {
      seen.push('b');
      return true;
    });
    And(function () {
      seen.push('c');
      return seen.join('') === 'abc';
    });
  });

  // capture from a hook, then assert in a separate spec: an assertion that
  // checked the title from inside the group would appear in that title
  describe('the title joins the assertions', function () {
    Given(function () {
      capturedTitle = this.currentTest.title;
    });
    Then(() => 1 === 1);
    And(() => 2 === 2);
  });

  describe('the captured title', function () {
    Then(function () {
      expect(capturedTitle).to.be('then 1 === 1 and 2 === 2');
    });
  });

  describe('a failing And fails the spec', function () {
    Given('run', () => run('failing-and.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /return value is false/.test(this.run.output);
    });
    // it reports the failing assertion, not the passing first one
    And(function () {
      return /never runs/.test(this.run.output);
    });
  });

  describe('a throwing And fails the spec', function () {
    Given('run', () => run('throwing-and.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /boom from the second And/.test(this.run.output);
    });
  });

  describe('an And still repeats a Given', function () {
    Given(function () {
      this.a = 1;
    });
    And(function () {
      this.b = 2;
    });
    Then(function () {
      return this.a + this.b === 3;
    });
  });

  describe('an And still repeats an Invariant', function () {
    Given(function () {
      this.n = 0;
    });
    Invariant(function () {
      this.n++;
    });
    And(function () {
      this.n += 10;
    });
    Then(function () {
      return this.n === 11;
    });
  });

  describe('async assertions inside a group', function () {
    Given('base', () => 1);
    Then(function () {
      return Promise.resolve(this.base === 1);
    });
    And(function (done) {
      setTimeout(done, 5);
    });
    And(async function () {
      return this.base === 1;
    });
  });
});

describe('groups do not leak across nested describes', function () {
  let outerRuns = 0;
  Given(() => {
    outerRuns++;
  });
  Then(() => true);

  describe('inner', function () {
    Then(function () {
      return outerRuns >= 1;
    });
  });

  // this And belongs to the outer Then, not to anything inside `inner`
  And(() => true);
});
