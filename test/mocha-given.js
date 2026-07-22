const expect = require('expect.js');

// setTimeout(fn, N) can fire a fraction under N as measured by Date.now(),
// which made these specs flaky on busy CI runners. Allow a small tolerance.
const DELAY = 30;
const TOLERANCE = 5;
const elapsedIsAtLeastDelay = (start) => Date.now() - start >= DELAY - TOLERANCE;

// Ported from test/mocha-given.coffee. Specs that read or write `this` use
// classic functions, because arrows do not bind mocha's test context.
describe('mocha-given', function () {
  describe('implements Rspec Given interface', function () {
    Then(() => expect(Given).to.be.a('function'));
    Then(() => expect(When).to.be.a('function'));
    Then(() => expect(Then).to.be.a('function'));
    Then(() => expect(Then.only).to.be.a('function'));
    Then(() => expect(Then.after).to.be.a('function'));
    Then(() => expect(And).to.be.a('function'));
    Then(() => expect(Invariant).to.be.a('function'));
  });

  describe('assigning stuff to this', function () {
    Given(function () {
      this.number = 24;
    });
    And(function () {
      this.number++;
    });
    When(function () {
      this.number *= 2;
    });
    Then(function () {
      return this.number === 50;
    });
    // or
    Then(function () {
      expect(this.number).to.be(50);
    });
  });

  describe('assigning stuff to variables', function () {
    let subject = null;
    Given(() => {
      subject = [];
    });
    When(() => {
      subject.push('foo');
    });
    Then(() => subject.length === 1);
    // or
    Then(() => expect(subject).to.have.length(1));
  });

  describe('eliminating redundant test execution', function () {
    let timesGivenWasInvoked = 0;
    let timesWhenWasInvoked = 0;

    context('a traditional spec with numerous Then statements', function () {
      Given(() => {
        timesGivenWasInvoked++;
      });
      When(() => {
        timesWhenWasInvoked++;
      });
      Then(() => timesGivenWasInvoked === 1);
      Then(() => timesWhenWasInvoked === 2);
      Then(() => timesGivenWasInvoked === 3);
      Then("it's important this gets invoked separately for each spec", () => timesWhenWasInvoked === 4);
    });

    context('using And statements', function () {
      Given(() => {
        timesGivenWasInvoked = timesWhenWasInvoked = 0;
      });
      And(() => {
        timesGivenWasInvoked++;
      });
      When(() => {
        timesWhenWasInvoked++;
      });
      Then(() => timesGivenWasInvoked === 1);
      And(() => timesWhenWasInvoked === 1);
      And(() => timesGivenWasInvoked === 1);
      And(() => timesWhenWasInvoked === 1);
    });
  });

  describe('Invariant', function () {
    context('implicitly called for each Then', function () {
      Given(function () {
        this.timesInvariantWasInvoked = 0;
      });
      Invariant(function () {
        this.timesInvariantWasInvoked++;
      });
      Then(function () {
        return this.timesInvariantWasInvoked === 1;
      });
      And(function () {
        return this.timesInvariantWasInvoked === 1;
      });
    });

    context('following a Then', function () {
      Invariant(function () {
        expect(this.meat).to.contain('pork');
      });
      Given(function () {
        this.meat = 'pork';
      });
      When(function () {
        this.meat += 'muffin';
      });
      Then(function () {
        return this.meat === 'porkmuffin';
      });
      And(function () {
        return this.meat !== 'hammuffin';
      });
    });

    context('called by And', function () {
      Given(function () {
        this.a = 0;
      });
      Invariant(function () {
        this.a++;
      });
      And(function () {
        this.a += 5;
      });
      Then(function () {
        return this.a === 6;
      });
    });
  });

  describe('And', function () {
    context('following a Given', function () {
      Given(function () {
        this.a = 'a';
      });
      And(function () {
        this.b = 'b' === this.a; // is okay to return false
      });
      Then(function () {
        return this.b === false;
      });
    });

    context('following a When', function () {
      Given(function () {
        this.a = () => 'a';
      });
      When(function () {
        this.b = this.a();
      });
      And(function () {
        this.b = 'b' === 'a'; // is okay to return false
      });
      Then(function () {
        return this.b === false;
      });
    });

    context('following a Then', function () {
      Given(function () {
        this.meat = 'pork';
      });
      When(function () {
        this.meat += 'muffin';
      });
      Then(function () {
        return this.meat === 'porkmuffin';
      });
      And(function () {
        return this.meat !== 'hammuffin';
      });
    });
  });

  describe('giving Given a variable', function () {
    context('add a variable to `this`', function () {
      Given('pizza', () => 5);
      Then(function () {
        return this.pizza === 5;
      });
    });
  });

  describe('giving When a variable', function () {
    context('add a variable to `this`', function () {
      Given('source', () => 5);
      When('result', function () {
        return this.source * 2;
      });
      Then(function () {
        return this.result === 10;
      });
    });
  });

  describe('variable scoping', function () {
    context('not defined yet', function () {
      Then(function () {
        return this.pizza === undefined;
      });
    });

    context('add a variable to `this`', function () {
      Given('pizza', () => 5);
      Then(function () {
        return this.pizza === 5;
      });
    });

    context('a subsequent unrelated test run', function () {
      Then(function () {
        return this.pizza === undefined;
      });
    });
  });

  describe('Givens before Whens order', function () {
    context('Outer block', function () {
      Given(function () {
        this.a = 1;
      });
      And(function () {
        this.b = 2;
      });
      When(function () {
        this.sum = this.a + this.b;
      });
      Then(function () {
        return this.sum === 3;
      });

      context('Middle block', function () {
        Given(function () {
          this.units = 'days';
        });
        When(function () {
          this.label = `${this.sum} ${this.units}`;
        });
        Then(function () {
          return this.label === '3 days';
        });

        context('Inner block A', function () {
          Given(function () {
            this.a = -2;
          });
          Then(function () {
            return this.label === '0 days';
          });
        });

        context('Inner block B', function () {
          Given(function () {
            this.units = 'cm';
          });
          Then(function () {
            return this.label === '3 cm';
          });
        });
      });
    });
  });

  describe('async testing', function () {
    Given(function () {
      this.t = Date.now();
    });

    describe('async Given', function () {
      Given((done) => setTimeout(done, DELAY));
      Then(function () {
        return elapsedIsAtLeastDelay(this.t);
      });
    });

    describe('async When', function () {
      Given('result', () => false);
      When(function (done) {
        setTimeout(() => {
          if (elapsedIsAtLeastDelay(this.t)) {
            this.result = true;
            done();
          } else {
            done(new Error(`only ${Date.now() - this.t}ms elapsed`));
          }
        }, DELAY);
      });
      Then(function () {
        return this.result === true;
      });
    });

    describe('async Invariant', function () {
      Invariant(function (done) {
        setTimeout(() => {
          if (elapsedIsAtLeastDelay(this.t)) {
            this.result = true;
            done();
          } else {
            done(new Error(`only ${Date.now() - this.t}ms elapsed`));
          }
        }, DELAY);
      });
      Then(function () {
        return this.result === true;
      });
    });

    describe('async Then', function () {
      Then(function (done) {
        setTimeout(() => {
          done(
            elapsedIsAtLeastDelay(this.t)
              ? undefined
              : new Error(`only ${Date.now() - this.t}ms elapsed`),
          );
        }, DELAY);
      });
    });
  });

  describe('Then after', function () {
    Given(function () {
      this.t = Date.now();
    });
    Then.after(DELAY, 'time has passed', function () {
      return elapsedIsAtLeastDelay(this.t);
    });
  });
});
