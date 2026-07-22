const { execFileSync } = require('child_process');
const path = require('path');

const MOCHA = path.join(__dirname, '..', 'node_modules', '.bin', 'mocha');
const ENTRY = path.join(__dirname, '..', 'index.js');
const FIXTURES = path.join(__dirname, 'fixtures');

/**
 * Run mocha over a fixture and return its output plus whether it failed.
 * A rejected promise must actually fail the run: without this the promise
 * specs could all be passing vacuously.
 */
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

describe('failure paths', function () {
  this.timeout(20000);

  describe('a Then whose promise resolves false', function () {
    Given('run', () => run('resolves-false.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /return value is false/.test(this.run.output);
    });
  });

  describe('a Then that rejects', function () {
    Given('run', () => run('rejects.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /boom from a rejected Then/.test(this.run.output);
    });
  });

  describe('a Given that rejects', function () {
    Given('run', () => run('given-rejects.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /given blew up/.test(this.run.output);
    });
  });

  describe('a When that rejects', function () {
    Given('run', () => run('when-rejects.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /when blew up/.test(this.run.output);
    });
  });

  describe('a step taking done and returning a promise', function () {
    Given('run', () => run('done-and-promise.js'));
    Then(function () {
      return this.run.failed === true;
    });
    And(function () {
      return /not both/.test(this.run.output);
    });
  });
});
