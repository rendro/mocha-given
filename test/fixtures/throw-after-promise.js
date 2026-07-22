When(() => Promise.resolve('first step is async'));
When(function () { throw new Error('threw after the promise'); });
Then(() => true);
