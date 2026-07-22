describe.only('payments', function () {
  Then(function () { return true; });
});
describe('payments extended', function () {
  Then('should not run', function () { return true; });
});
