describe('outer', function () {
  Given(function () { this.n = 1; });
  Then(function () { return this.n === 1; });

  describe.skip('skipped', function () {
    Then(function () { return true; });
  });

  // belongs to the outer Then, and must actually run
  And(function () {
    return 'the trailing And must run' === 'and it did not';
  });
});
