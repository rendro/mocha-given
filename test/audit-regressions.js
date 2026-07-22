const { execFileSync } = require('child_process');
const path = require('path');

const MOCHA = path.join(__dirname, '..', 'node_modules', '.bin', 'mocha');
const ENTRY = path.join(__dirname, '..', 'index.js');
const FIXTURES = path.join(__dirname, 'fixtures');

const run = (fixture, extraArgs = []) => {
  try {
    const stdout = execFileSync(
      MOCHA,
      ['--require', ENTRY, '--ui', 'mocha-given', '-R', 'spec', ...extraArgs, path.join(FIXTURES, fixture)],
      { encoding: 'utf8', stdio: 'pipe' },
    );
    return { failed: false, output: stdout };
  } catch (err) {
    return { failed: true, output: `${err.stdout || ''}${err.stderr || ''}` };
  }
};

// These all passed on 0.3.0 when they should not have, or crashed the run.
// Every one is a case where the library reported success incorrectly, which is
// the worst failure mode for a test framework.
describe('audit regressions', function () {
  this.timeout(30000);

  describe('an Invariant returning false fails the spec', function () {
    Given('run', () => run('invariant-false.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /return value is false/.test(this.run.output);
    });
  });

  describe('an Invariant that throws fails the spec', function () {
    Given('run', () => run('invariant-throws.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /invariant blew up/.test(this.run.output);
    });
  });

  describe('a When calling done with an error fails the spec', function () {
    Given('run', () => run('when-done-error.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /when reported an error/.test(this.run.output);
    });
  });

  describe('an Invariant calling done with an error fails the spec', function () {
    Given('run', () => run('invariant-done-error.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /invariant reported an error/.test(this.run.output);
    });
  });

  describe('a synchronous throw after a promise step is reported', function () {
    // this used to become an unhandled rejection and surface as a timeout
    Given('run', () => run('throw-after-promise.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /threw after the promise/.test(this.run.output);
    });
    And(function () {
      return !/Timeout/.test(this.run.output);
    });
  });

  describe('Then.only runs and does not abort the run', function () {
    Given('run', () => run('then-only.js'));
    Then(function () {
      return this.run.failed === false;
    });
    And(function () {
      return !/escapeRegexp/.test(this.run.output);
    });
    // only the focused spec runs
    And(function () {
      return /1 passing/.test(this.run.output);
    });
    And(function () {
      return !/should not run/.test(this.run.output);
    });
  });

  describe('it.only does not abort the run', function () {
    Given('run', () => run('it-only.js'));
    Then(function () {
      return this.run.failed === false;
    });
    And(function () {
      return !/escapeRegexp/.test(this.run.output);
    });
  });

  describe('describe.only does not match unrelated suites by substring', function () {
    Given('run', () => run('describe-only.js'));
    Then(function () {
      return this.run.failed === false;
    });
    // "payments" must not drag in "payments extended"
    And(function () {
      return !/should not run/.test(this.run.output);
    });
  });

  describe('an And after a skipped block is not swallowed', function () {
    Given('run', () => run('and-after-skip.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /the trailing And must run/.test(this.run.output);
    });
  });

  describe('Then.after renders seconds correctly', function () {
    Given('run', () => run('then-after-label.js'));
    Then(function () {
      return this.run.failed === false;
    });
    // 1500 used to render as "after 1.5 ms"
    And(function () {
      return /after 1\.5 s,/.test(this.run.output);
    });
    And(function () {
      return !/after 1\.5 ms,/.test(this.run.output);
    });
  });
});
