Then(async function () {
  throw new Error('boom from a rejected Then');
});
