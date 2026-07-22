Given('x', () => Promise.reject(new Error('given blew up')));
Then(function () {
  return this.x === 1;
});
