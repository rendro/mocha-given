// Loaded by mocha as a custom interface, and by a bundler in the browser.
const Mocha =
  typeof module !== 'undefined' && module.parent
    ? module.parent.require('mocha')
    : typeof window !== 'undefined'
      ? window.Mocha
      : require('mocha');

const Suite = Mocha.Suite;
const Test = Mocha.Test;
const utils = Mocha.utils;
const Context = Mocha.Context;

/**
 * Runs a list of functions in order, waiting for any that take a `done`
 * callback, then invokes the final callback.
 */
class Waterfall {
  constructor(context, functions = [], finalCallback, onError) {
    this.context = context;
    this.functions = functions.slice(0);
    this.finalCallback = finalCallback;
    this.onError = onError;
    this.asyncCount = this.functions.filter((fn) => fn.length > 0).length;
  }

  asyncTaskCompleted = () => {
    this.asyncCount -= 1;
    this.flow();
  };

  invokeFinalCallbackIfNecessary = () => {
    if (this.asyncCount === 0) {
      this.finalCallback?.apply(this.context);
      this.finalCallback = undefined;
    }
  };

  flow = () => {
    if (this.functions.length === 0) return this.invokeFinalCallbackIfNecessary();

    const func = this.functions.shift();

    // callback style: wait for done()
    if (func.length > 0) {
      const returned = func.apply(this.context, [this.asyncTaskCompleted]);
      if (isThenable(returned)) {
        this.fail(
          new Error(
            'mocha-given: a step may take a `done` callback or return a promise, not both',
          ),
        );
      }
      return;
    }

    const returned = func.apply(this.context);

    // promise style: wait for it to settle before the next step
    if (isThenable(returned)) {
      this.asyncCount += 1;
      returned.then(() => {
        this.asyncCount -= 1;
        this.flow();
      }, this.fail);
      return;
    }

    this.flow();
  };

  fail = (err) => {
    this.finalCallback = undefined;
    this.onError?.(err);
  };
}

const comparisonLookup = {
  '===': 'to strictly equal',
  '!==': 'to strictly differ from',
  '==': 'to equal',
  '!=': 'to differ from',
  '>': 'to be bigger than',
  '>=': 'to be bigger or equal',
  '<': 'to be smaller than',
  '<=': 'to be smaller or equal',
};

let whenList = [];
let invariantList = [];

const o = (thing) => ({
  // typeof, not Object.prototype.toString: the latter reports async functions
  // as [object AsyncFunction] and would reject `Then(async () => ...)`
  isFunction: () => typeof thing === 'function',

  isString: () => Object.prototype.toString.call(thing) === '[object String]',

  isNumber: () => Object.prototype.toString.call(thing) === '[object Number]',

  firstThat(test) {
    for (let i = 0; i < thing.length; i++) {
      if (test(thing[i]) === true) return thing[i];
    }
    return undefined;
  },
});

const tidy = (source) => source.replace(/\s+/g, ' ').replace('void 0', 'undefined').trim();

// Handles `function () { return x; }`, `() => x`, `async () => x` and block
// bodied arrows. The 0.1.x version only matched the `function (...)` form, so
// arrow specs rendered with an empty title.
const stringifyExpectation = (expectation) => {
  const source = String(expectation).replace(/\s+/g, ' ').trim();

  const block = source.match(/\{\s*(?:return\s+)?(.*?);?\s*\}$/);
  if (block) return tidy(block[1]);

  const arrow = source.match(/=>\s*(.*)$/);
  if (arrow) return tidy(arrow[1]);

  return '';
};

const isThenable = (value) =>
  value != null && typeof value.then === 'function';

const finalStatementFrom = (expectationString) => {
  const multiStatement = expectationString.match(/.*return (.*)/);
  return multiStatement ? multiStatement[multiStatement.length - 1] : expectationString;
};

const wasComparison = (expectation) => {
  const comparison = expectation.match(/(.*) (===|!==|==|!=|>|>=|<|<=) (.*)/);
  if (!comparison) return undefined;
  const [, left, comparator, right] = comparison;
  return { left, comparator, right };
};

const getErrorDetails = (fn, context) => {
  const expectationString = stringifyExpectation(fn);
  const expectation = finalStatementFrom(expectationString);
  const comparison = wasComparison(expectation);
  if (!comparison) return '';

  // eval is evil, and the operands are whatever text sat either side of the
  // comparison, so this has to tolerate anything that will not parse
  let left;
  let right;
  try {
    left = function () {
      return eval(comparison.left);
    }.call(context);
    right = function () {
      return eval(comparison.right);
    }.call(context);
  } catch (err) {
    return `     Comparison: ${expectationString}\n`;
  }

  return (
    `     Expected '${left}' ${comparisonLookup[comparison.comparator]} '${right}'\n` +
    `     Comparison: ${expectationString}\n`
  );
};

const declareSpec = (specArgs, itFunc) => {
  const label = o(specArgs).firstThat((arg) => o(arg).isString());
  const fn = o(specArgs).firstThat((arg) => o(arg).isFunction());
  const time = o(specArgs).firstThat((arg) => o(arg).isNumber());
  const timelabel =
    time !== undefined ? `after ${time > 1e3 ? time / 1e3 : time} ms, ` : '';

  // the `done` parameter is load-bearing: mocha reads fn.length to decide
  // whether the test is asynchronous
  itFunc(`then ${timelabel}${label ?? stringifyExpectation(fn)}`, function (done) {
    const args = Array.prototype.slice.call(arguments);

    const falsyError = () =>
      new Error('return value is false\n' + getErrorDetails(fn, this));

    const expectation = () => {
      let result;
      let exception;

      try {
        result = fn.apply(this, args);
      } catch (e) {
        exception = e;
      }

      // a Then that returns a promise: settle it, then judge the value
      if (isThenable(result)) {
        return result.then(
          (value) => done(value === false ? falsyError() : undefined),
          (err) => done(err),
        );
      }

      // synchronous: throw exactly as 0.1.x did, so failure output is unchanged
      if (exception) {
        throw new Error(exception.message + '\n' + getErrorDetails(fn, this));
      }
      if (result === false) throw falsyError();

      // arity, not source sniffing: an arrow taking `done` is now detected
      if (fn.length === 0) done();
    };

    new Waterfall(
      this,
      [].concat(whenList, invariantList),
      () => {
        if (time !== undefined) {
          setTimeout(expectation, time);
        } else {
          expectation();
        }
      },
      done,
    ).flow();
  });
};

const MochaGivenSuite = (suite) => {
  const suites = [suite];

  suite.on('pre-require', (context, file, mocha) => {
    // reset context for watched tests
    suite.ctx = new Context();

    context.before = (fn) => {
      suites[0].beforeAll(fn);
    };

    context.after = (fn) => {
      suites[0].afterAll(fn);
    };

    context.beforeEach = (fn) => {
      suites[0].beforeEach(fn);
    };

    context.afterEach = (fn) => {
      suites[0].afterEach(fn);
    };

    context.describe = context.context = (title, fn) => {
      const nested = Suite.create(suites[0], title);
      suites.unshift(nested);
      fn.call(nested);
      suites.shift();
      return nested;
    };

    context.xdescribe =
      context.xcontext =
      context.describe.skip =
        (title, fn) => {
          const nested = Suite.create(suites[0], title);
          nested.pending = true;
          suites.unshift(nested);
          fn.call(nested);
          suites.shift();
        };

    context.describe.only = (title, fn) => {
      const nested = context.describe(title, fn);
      mocha.grep(nested.fullTitle());
      return nested;
    };

    context.it = context.specify = (title, fn) => {
      const parent = suites[0];
      if (parent.pending) fn = null;
      const test = new Test(title, fn);
      parent.addTest(test);
      return test;
    };

    context.it.only = (title, fn) => {
      const test = context.it(title, fn);
      const reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    context.xit =
      context.xspecify =
      context.it.skip =
        (title) => {
          context.it(title);
        };

    // mocha-given extension
    let mostRecentlyUsed = null;

    // record the keys present before a test runs
    context.beforeEach(function () {
      const keys = [];
      for (const key in this.currentTest.ctx) keys.push(key);
      this.currentTest.ctxKeys = keys;
    });

    // remove added keys to clean up what mocha messes up with a shared context
    context.afterEach(function () {
      for (const key in this.currentTest.ctx) {
        if (!this.currentTest.ctxKeys.includes(key)) {
          delete this.currentTest.ctx[key];
        }
      }
    });

    const Given = function (...args) {
      const assignTo = o(args).firstThat((arg) => o(arg).isString());
      const fn = o(args).firstThat((arg) => o(arg).isFunction());

      if (assignTo) {
        // mocha awaits a promise returned from beforeEach, so the named form
        // assigns the resolved value rather than the promise
        context.beforeEach(function () {
          const result = fn.apply(this);
          if (isThenable(result)) {
            return result.then((value) => {
              this[assignTo] = value;
            });
          }
          this[assignTo] = result;
        });
      } else {
        context.beforeEach.apply(this, args);
      }
    };

    const When = function (...args) {
      const assignTo = o(args).firstThat((arg) => o(arg).isString());
      const fn = o(args).firstThat((arg) => o(arg).isFunction());

      if (assignTo) {
        context.beforeEach(() =>
          whenList.push(function () {
            const result = fn.apply(this);
            // returning the promise lets Waterfall await it before the next step
            if (isThenable(result)) {
              return result.then((value) => {
                this[assignTo] = value;
              });
            }
            this[assignTo] = result;
          }),
        );
      } else {
        context.beforeEach(() => whenList.push(fn));
      }

      context.afterEach(() => {
        whenList.pop();
      });
    };

    const Invariant = (fn) => {
      context.beforeEach(() => invariantList.push(fn));
      context.afterEach(() => invariantList.pop());
    };

    const Then = function (...args) {
      declareSpec(args, context.it);
    };

    context.Given = function (...args) {
      mostRecentlyUsed = Given;
      Given.apply(this, args);
    };

    context.When = function (...args) {
      mostRecentlyUsed = When;
      When.apply(this, args);
    };

    context.Then = function (...args) {
      mostRecentlyUsed = Then;
      Then.apply(this, args);
    };

    context.Then.only = function (...args) {
      declareSpec(args, context.it.only);
    };

    context.Then.after = function (...args) {
      mostRecentlyUsed = Then;
      declareSpec(args, context.it);
    };

    context.Invariant = function (...args) {
      mostRecentlyUsed = Invariant;
      Invariant.apply(this, args);
    };

    context.And = function (...args) {
      mostRecentlyUsed.apply(this, args);
    };
  });
};

if (typeof exports === 'object') module.exports = MochaGivenSuite;
Mocha.interfaces['mocha-given'] = MochaGivenSuite;
