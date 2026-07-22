const expect = require('expect.js');

const later = (value, ms = 10) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Issue #7, open since 2014. None of this works on 0.1.3.
describe('promises', function () {
  describe('Given returning a promise', function () {
    let order = [];
    Given(function () {
      order = [];
      return later('given').then((v) => order.push(v));
    });
    When(function () {
      order.push('when');
    });
    Then(function () {
      return order.join() === 'given,when';
    });
  });

  describe('named Given assigns the resolved value', function () {
    Given('answer', () => later(42));
    Then(function () {
      return this.answer === 42;
    });
    // the promise itself must not leak through
    And(function () {
      expect(this.answer).to.be.a('number');
    });
  });

  describe('named Given with an async function', function () {
    Given('user', async () => {
      const id = await later(7);
      return { id };
    });
    Then(function () {
      return this.user.id === 7;
    });
  });

  describe('named When assigns the resolved value', function () {
    Given('source', () => 5);
    When('result', function () {
      return later(this.source * 2);
    });
    Then(function () {
      return this.result === 10;
    });
  });

  describe('unnamed When is awaited before Then runs', function () {
    let flag = null;
    Given(function () {
      flag = 'pending';
    });
    When(function () {
      return later('settled').then((v) => {
        flag = v;
      });
    });
    Then(function () {
      return flag === 'settled';
    });
  });

  describe('Invariant returning a promise', function () {
    let seen = 0;
    Given(function () {
      seen = 0;
    });
    Invariant(function () {
      return later(1).then((n) => {
        seen += n;
      });
    });
    Then(function () {
      return seen === 1;
    });
  });

  describe('Then returning a promise', function () {
    Given('value', () => 3);
    Then(function () {
      return later(this.value === 3);
    });
    And(async function () {
      const v = await later(this.value);
      expect(v).to.be(3);
    });
  });

  describe('async Then with await', function () {
    Given('n', () => 2);
    Then(async function () {
      const doubled = await later(this.n * 2);
      return doubled === 4;
    });
  });

  describe('promise steps run in order', function () {
    let log = [];
    Given(function () {
      log = [];
      return later('g').then((v) => log.push(v));
    });
    When(function () {
      return later('w1').then((v) => log.push(v));
    });
    And(function () {
      return later('w2').then((v) => log.push(v));
    });
    Then(function () {
      return log.join() === 'g,w1,w2';
    });
  });

  describe('promise and callback styles mix', function () {
    Given('a', () => later(1));
    When(function (done) {
      this.b = 2;
      setTimeout(done, 5);
    });
    Then(function () {
      return this.a + this.b === 3;
    });
  });
});
