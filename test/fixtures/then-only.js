describe('focused', function () {
  Then.only(function () { return true; });
});
describe('unfocused', function () {
  Then('should not run', function () { return true; });
});
