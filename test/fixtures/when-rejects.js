When(function () {
  return Promise.reject(new Error('when blew up'));
});
Then(function () {
  return true;
});
