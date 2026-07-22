When(function (done) { done(new Error('when reported an error')); });
Then(() => true);
