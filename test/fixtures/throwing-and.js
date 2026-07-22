Then(() => true);
And(function () {
  throw new Error('boom from the second And');
});
