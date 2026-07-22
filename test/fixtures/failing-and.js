Then(() => true);
And(() => true);
And(function () {
  return 'the third assertion' === 'never runs';
});
